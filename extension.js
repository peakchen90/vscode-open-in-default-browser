var vscode = require('vscode');
var opn = require('opn');

function activate(context) {

    var disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', function (e) {
        var activeFile = vscode.window.activeTextEditor.document.fileName;
        if (!/\.html?$/i.test(activeFile)) {
            vscode.window.showWarningMessage('当前文件格式不是 HTML 或 HTM');
            return;
        }
        var filename = e._fsPath;
        opn(filename);
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;