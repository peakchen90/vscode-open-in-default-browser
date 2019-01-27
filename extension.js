var vscode = require('vscode');
var opn = require('opn');
var i18nHelper = require('./i18n-helper');

var config = JSON.parse(process.env.VSCODE_NLS_CONFIG);
var locale = config.locale;


function activate(context) {

    var disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', function (e) {
        var filename = e._fsPath;
        var message = i18nHelper(locale, 'nonHTML.warn', 'Unable to open non-HTM or non-HTML files');
        if (!/\.html?$/i.test(filename)) {
            vscode.window.showWarningMessage(message);
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