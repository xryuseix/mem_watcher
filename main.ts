let maxMemory = 0;
let process: Deno.ChildProcess;

function setSignals() {
  Deno.addSignalListener("SIGINT", () => {
    console.log(`max memory usage: ${maxMemory}`);
    Deno.exit(1);
  });
}

async function getMemUsage() {
  if (!process) {
    console.error("Process is not running");
    return 0;
  }
  const watcher = new Deno.Command("/bin/sh", {
    args: [ "-c",`ps -p ${process.pid} -o rss | grep -v RSS`],
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
  const cmd = Deno.args[0];
  setSignals();

  const p = new Deno.Command(cmd, {
    args: Deno.args.slice(1),
    stdout: "piped",
    stderr: "piped",
  });
  process = p.spawn();

  const encoder = new TextEncoder();

  setInterval(async () => {
    const memUsage = await getMemUsage();
    maxMemory = Math.max(maxMemory, memUsage);
    Deno.stdout.write(encoder.encode(`\r\x1b[0Kcurrent memory usage: ${memUsage}`));
  }, 500)
}

main();
