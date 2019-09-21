import * as vscode from 'vscode';
import langHelper from '../i18n/lang-helper';
import collect from './service/collect';

const open = require('open');

let config: Record<string, any> = {};
let locale: string = 'en';

try {
  config = JSON.parse(process.env.VSCODE_NLS_CONFIG);
  locale = config.locale;
} catch (e) {
  console.error(e);
}


/**
 * 注册 openInBrowser 命令
 */
export function registerOpenInBrowserCommand(context: vscode.ExtensionContext) {
  const disposable: vscode.Disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', (evt) => {
    const activeTextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
    const document = activeTextEditor.document;
    const languageId = document.languageId;
    const filename = document.fileName;
    const message = langHelper(locale, 'nonHTML.warn', 'Unable to open non-HTM or non-HTML file');
    let success = false;

    if (languageId === 'html') {
      open(filename);
      success = true;
    } else if (evt) {
      vscode.window.showWarningMessage(message);
      console.log(message);
    }

    // send collect info
    const type = evt ? 'context_menu' : 'shortcut_key';
    collect(type, {success}).then(() => {
    });
  });

  context.subscriptions.push(disposable);
}
