import express from "express";
import { spawn } from "child_process";
import cors from "cors";
import { type } from "os";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

process.on("warning", (warning) => {
  console.warn(`${warning.name}: ${warning.message}`);
});

// POST /
app.post("/", (req, res) => {
  if (!req.body.cmd) {
    return res.status(400).json({
      error: '"cmd" body argument is not found',
      code: 1,
      status: 400,
    });
  }

  const cmd = req.body.cmd;
  const timeout = +req.query.timeout || 3e4;
  const cwd = req.body.cwd || process.cwd();

  /* format <txt> */
  const fmt = (txt) =>
    String(txt)
      .trim()
      .replace(/\\n/g, String.fromCharCode(10));

  const shell = req.body.shell === "true";
  let child;

  if (Array.isArray(cmd)) {
    child = spawn(cmd[0], cmd.slice(1), { shell, cwd })
  } else if (typeof cmd === "string") {
    const cmdArr = cmd.split(" ");
    child = spawn(
      cmdArr[0],
      cmdArr.slice(1),
      { shell, cwd },
    );
  }

  // Runs if the response took more than <timeout> milliseconds.
  const resTimeout = setTimeout(() => {
    child.kill();
    return res.status(504).json({
      error: "Response took too long to load.",
      timeout: timeout,
    });
  }, timeout);

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("error", (error) => {
    if (!res.headersSent) {
      return res.status(500).json({
        error: fmt(error.messsge),
        status: 500,
      });
    }
  });

  const finish = (code) => {
    // Stop the timeout if the process succeeded.
    clearTimeout(resTimeout);

    if (res.headersSent) return;
    if (code !== 0) {
      return res.status(400).json({
        error: stderr ? fmt(stderr) : `Command ${cmd} failed`,
        status: 400,
        code,
      });
    }
    return res.status(200).json({
      output: fmt(stdout),
      status: 200,
      code,
    });
  };

  child.on("close", finish);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
