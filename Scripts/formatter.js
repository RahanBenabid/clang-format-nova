const config = require("./config.js");

function runClangFormat(text, path) {
  return new Promise((res, rej) => {
    const executable =
      nova.config.get(config.CONFIG_EXECUTABLE, "string") ||
      "/opt/homebrew/bin/clang-format";

    const options = {
      args: [path],
      stdio: ["pipe", "pipe", "pipe"],
    };

    if (nova.workspace.path) options.cwd = nova.workspace.path;

    const process = new Process(executable, options);
    if (!process) {
      console.error("couldn't create a process");
      if (reject) reject("no process");
      return;
    }

    const stdout = [];
    const stderr = [];

    process.onStdout((line) => stdout.push(line));
    process.onStderr((line) => stderr.push(line));

    process.onDidExit((status) => {
      if (status === 0) {
        res(stdout.join(""));
        return;
      } else {
        const message = stderr.join("").trim();
        rej(new Error(message) || `exited with status ${status}`);
      }
    });

    try {
      process.start();
    } catch (err) {
      rej(err);
      return;
    }

    const writer = process.stdin.getWriter();
    writer.write(text);
    writer.close();
  });
}

async function formatEditor(editor) {
  const document = editor.document;
  const range = new Range(0, document.length);
  const original = document.getTextInRange(range);

  try {
    const formatted = await runClangFormat(original, document.path);
    if (formatted.lenght === 0 && original.length > 0) return;

    await editor.edit((edit) => edit.replace(range, formatted));
  } catch (err) {
    console.error(`clang format: ${error.message}`);
  }
}

module.exports = {
  formatEditor,
};
