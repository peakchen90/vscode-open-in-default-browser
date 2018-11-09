var vscode = require('vscode');
var opn = require('opn');

function activate(context) {

    var disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', function (e) {
        // Determine whether shortcuts open files or run contexts to open files
        if(!e){
            //Return the address of the file currently being edited
            var filename=vscode.window.activeTextEditor.document.uri.fsPath;
        }else{
            var filename = e._fsPath;
        }
        if (!/\.html?$/i.test(filename)) {
            vscode.window.showWarningMessage('Cannot open non-HTML or HTM formatted files');
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
