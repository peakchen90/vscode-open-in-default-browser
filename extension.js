var vscode = require('vscode');
var opn = require('opn');

function activate(context) {

    var disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', function (e) {
        var filename = e._fsPath;
        if (!/\.html?$/i.test(filename)) {
            vscode.window.showWarningMessage('不能打开非HTML或HTM格式的文件');
            return;
        }
        opn(filename);
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;