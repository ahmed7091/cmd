# CMD API

> The easiest way to communicate with terminals in the browser.

## Overview

<p style="text-align: center">
  cmd API is a modern, easy-to-use API, to enable communicating with the terminal even if you're in the browser!
</p>

### How it works

cmd API uses the `child_process` node module using the `spawn` function to execute long, complex, and dedicated shell commands.

## Features

* **Available offline**: Using the local build, you can communicate completely offline.
* **Optimized shell enviroment**: If the `shell` property is `true`, you can use all the shell features (Pipes, redirection, chaining, etc...).
* **Time-outs**: if a response took too long, the process is killed and a response of _504 Gateway timeout_ is returned.


## Request Structure
when doing a request to the API, there is a specific structure to follow:

note: The url variable varies depending on what build are you using. See [Build methods](#Getting-Ready)
```JavaScript
// The API URL
const url = "https://cmd-api.up.railway.app";

// Running the code asynchronously
(async () => {
  const data = await fetch(`${url}?timeout=<timeout>`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      cmd: <command>,
      args: <arguments>,
      shell: <bool>,
      cwd: <path>
    })
  })
 })();
```
* **timeout**: a _number_ time-out for the command execution.
* **command**: a _string_ representing the command to execute.
* **arguments**: an _array_ containing arguments to give for the command.
* **bool**: a _boolean_, if set to true, enables shell optimized features (use at your own risk!).
* **path**: a _string_ representing the Current Working Directory (CWD) while executing the command.

## Getting Ready

you can communicate with the cmd API using 2 building methods:

### Local build
Here, you can communicate with the API offline, by copying the source code and serving it, by doing:

1. Go to your project if you haven't:
```bash
cd path/to/project
```

2. Clone this repository:

```bash
# using git
git clone https://github.com/ahmed7091/cmd.git

# using Github CLI
gh repo clone ahmed7091/cmd
```

3. in a different shell session, go to the server & start the server:

```bash
cd cmd
npm start
```

Now you can use the API at the URL `http://localhost:3000`:

```python
from requests import post, Response

url: str = "http://localhost:3000/"

data: Response = post(url, json={
    "cmd": <command>,
    "args": <arguments>
})

print(data.json())
```

### Global build

In the global build, there isn't a build needed, you just need Wi-Fi connection to send HTTPS requests to the API:
```python
from requests import post, Response

usr: str = "https://cmd-api.up.railway.app"

data: Response = post(url, json={
    "cmd": <command>,
    "args": <arguments>
})
print(data.json())
```
## Options

Here is a table of the options available while requesting:

| name    | type            | definition                       |
| -----   | --------        | -----------------------          |
| cmd     | body argument   | the shell command to execute     |
| args    | body argument   | the arguments for &lt;cmd&gt;    |
| shell   | body argument   | enables dedicated shell features |
| cwd     | body argument   | the directory to execute in      |
| timeout | Query Parmeter  | the timeout for a command        |

## Example

A sample test: going to a directory & creating files and listing them.

```JavaScript

(async () => {
  const url = "http://localhost:3000";
  const dir = `${process.cwd()}/project1`;

  await fetch(url, { // creating a new directory
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      cmd: "mkdir",
      args: ["test", "&&", "cd", "test"], /* chaining */
      cwd: dir,
      shell: true, // enabling it to chain commands
    }
  });

  await fetch(url, { // creating new files
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      cmd: "touch",
      args: ["file1.txt", "file2.txt", "file3.txt"],
      cwd: `${dir}/test`,
    }
  })

  const dirFiles = await fetch(`${url}?timeout=1e4`, {
    // Time-out parameter ->        ---^^^^^^^
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      cmd: "ls",
      cwd: `${dir}/test`
    },
  })
  try{
    const res = await dirFiles.json();
  } catch (err){
    console.error("Unexpected error happened: ", err.messsge);
    return
  };

  const { output, error } = res;
  if (error){
    console.error("An error occurred while executing: ", error)
    return;
  };

  console.log(`Files found in folder "${dir}/test" :\n`, dirFiles.output)
}
)();
```

Output:

```
Files found in folder "/home/usr/test":
file1.txt
file2.txt
file3.txt
```

## Notes

- Relative paths in `cwd` body argument are relative to the folder of the server
- Enabling `shell`, however usefull, isn't safe, especially from user input.
- All the [options](#Options) are optional, except `cmd`.
