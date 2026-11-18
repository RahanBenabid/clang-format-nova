const config = require("./config.js");

function runClangFormat(editor, text, path) {
  return new Promise((res, rej) => {
    const executable =
      nova.config.get(config.CONFIG_EXECUTABLE, "string") ||
      "/opt/homebrew/bin/clang-format";

    const options = {
      args: ["--assume-filename", path],
      stdio: "pipe",
    };

    if (nova.workspace.path) options.cwd = nova.workspace.path;

    const process = new Process(executable, options);
    if (!process) {
      console.error("couldn't create a process");
      if (reject) reject("no process");
      return;
    }

    const textRange = new Range(0, editor.document.length);
    const content = editor.document.getTextInRange(textRange);
    const filePath = nova.workspace.relativizePath(editor.document.path);

    let outBuffer = [];
    let errBuffer = [];

    process.onStdout((output) => outBuffer.push(output));
    process.onStderr((err) => errBuffer.push(err));

    process.onDidExit((status) => {
      if (status === 0) {
        res(outBuffer.join(""));
      } else {
        console.error(errBuffer.join(""));
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
  const range = new Range(0, editor.document.length);
  const original = editor.document.getTextInRange(range);

  try {
    const formattedContent = await runClangFormat(
      editor,
      original,
      editor.document.path,
    );

    if (formattedContent !== original) {
      console.log("Formatting " + editor.document.path);
      await editor.edit((edit) => {
        edit.replace(range, formattedContent, InsertTextFormat.PlainText);
      });
    } else {
      console.log("Nothing to format");
    }

    return;
  } catch (err) {
    console.error(`clang format: ${error.message}`);
  }
}

module.exports = {
  formatEditor,
};
