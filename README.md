# Mem Usage

## Usage

some binary

```bash
$ deno task run sleep 1000
Task run deno run --allow-run --allow-sys main.ts "sleep" "1000"
current memory usage: 416
max memory usage: 976
```

Chrome

```bash
$ deno task run --multi=chrome /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=../chrome-user-data
stderr: 
DevTools listening on ws://127.0.0.1:9222/devtools/browser/c04b7315-6835-4133-b8f7-92f7d109bb89

current memory usage: 4122064^C
max memory usage: 4122064 KB
```
