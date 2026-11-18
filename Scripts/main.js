const formatter = require("./formatter.js");
const config = require("./config.js");

exports.activate = function() {
  nova.commands.register(
      "com.rahan.clangformat.formatDocument",
      (editor) => formatter.formatEditor(editor),
  );

  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave((editor) => {
      if (!nova.config.get(config.CONFIG_FORMAT_ON_SAVE, "boolean"))
        return;

      const supportedSyntaxes = [
        "c",   "cpp",      "cc",    "cxx",         "h",
        "hpp", "hh",       "hxx",   "objective-c", "objc",
        "m",   "mm",       "java",  "javascript",  "typescript",
        "js",  "ts",       "jsx",   "tsx",         "csharp",
        "cs",  "protobuf", "proto", "json",        "cuda",
      ];

      if (!supportedSyntaxes.includes(editor.document.syntax))
        return;

      return formatter.formatEditor(editor);
    });
  });
};

exports.deactivate = function() {};
