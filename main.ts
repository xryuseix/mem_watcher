let maxMemory = 0;
let process: Deno.ChildProcess;

function setSignals() {
  Deno.addSignalListener("SIGINT", () => {
    console.log(`\nmax memory usage: ${maxMemory} KB`);
    Deno.exit(1);
  });
}

async function getMemUsage(multiProcess: string | undefined) {
  if (!process) {
    console.error("Process is not running");
    return 0;
  }

  const args = multiProcess
    ? [
      "-c",
      `ps aux | grep -i ${multiProcess} | tail -n +2 | awk -F ' ' '{sum += $6} END {print sum}'`,
    ]
    : ["-c", `ps -p ${process.pid} -o rss | grep -v RSS`];

  const watcher = new Deno.Command("/bin/sh", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr } = await watcher.output();
  if (stderr.length > 0) {
    console.error(new TextDecoder().decode(stderr));
  }

  const rawMemory = new TextDecoder().decode(stdout).trim();
  const memoryUsage = Number(rawMemory);
  return memoryUsage;
}

function main() {
  let multiProcess: string | undefined = undefined;
  const args = Deno.args.flatMap((arg) => {
    if (arg.startsWith("--multi")) {
      multiProcess = arg.split("=")?.[1] ?? undefined;
      return [];
    }
    return [arg];
  });
  setSignals();

  const p = new Deno.Command(args[0], {
    args: Deno.args.slice(1),
    stdout: "piped",
    stderr: "piped",
  });
  process = p.spawn();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  process.stdout.getReader().read().then((v) => {
    const stdout = decoder.decode(v.value);
    console.log(`\nstdout: ${stdout}`);
  });
  process.stderr.getReader().read().then((v) => {
    const stderr = decoder.decode(v.value);
    console.log(`\nstderr: ${stderr}`);
  });

  setInterval(async () => {
    const memUsage = await getMemUsage(multiProcess);
    maxMemory = Math.max(maxMemory, memUsage);
    Deno.stdout.write(
      encoder.encode(`\r\x1b[0Kcurrent memory usage: ${memUsage}`),
    );
  }, 500);
}

main();
