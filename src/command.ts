import * as vscode from 'vscode';
import langHelper from '../i18n/lang-helper';
import collect from './service/collect';

const open = require('open');

let config: Record<string, any> = {};
let locale: string = 'en';

try {
  config = JSON.parse(process.env.VSCODE_NLS_CONFIG as string);
  locale = config.locale;
} catch (e) {
  console.error(e);
}


/**
 * 注册 openInBrowser 命令
 */
export function registerOpenInBrowserCommand(context: vscode.ExtensionContext): void {
  const message = langHelper(locale, 'nonHTML.warn', 'Unable to open non-HTM or non-HTML file');

  const disposable: vscode.Disposable = vscode.commands.registerCommand('peakchen90.openInBrowser', (evt) => {
    let filename = '';
    let languageId = '';

    if (evt && typeof evt.path === 'string') {
      const match = evt.path.match(/\.(\w+)$/);
      if (match) {
        filename = evt.fsPath;
        languageId = match[1].toLowerCase();
      }
    } else {
      const activeTextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
      const document = activeTextEditor.document;
      languageId = document.languageId;
      filename = document.fileName;
    }

    let success = false;
    if (/^html?$/i.test(languageId)) {
      open(filename);
      success = true;
    } else {
      vscode.window.showWarningMessage(message);
    }

    // send collect info
    const type = evt ? 'context_menu' : 'shortcut_key';
    collect(type, {success});
  });

  context.subscriptions.push(disposable);
}
