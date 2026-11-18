const formatter = require("./formatter.js");
const config = require("./config.js");

exports.activate = function () {
  nova.commands.register("com.rahan.clangformat.formatDocument", (editor) =>
    formatEditor(editor),
  );

  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave((editor) => {
      if (!nova.config.get(config.CONFIG_FORMAT_ON_SAVE, "boolean")) return;

      if (
        editor.document.syntax != "c" &&
        editor.document.syntax != "cpp" &&
        editor.document.syntax != "h"
      )
        return;

      return formatter.formatEditor(editor);
    });
  });
};

exports.deactivate = function () {};
