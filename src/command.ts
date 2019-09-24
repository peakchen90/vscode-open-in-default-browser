import * as vscode from 'vscode';
import collect from './service/collect';
import {showWarningMessage} from './utils/vscode';
import {openBrowser} from './utils/utils';
import $t from '../i18n/lang-helper';
import {openBrowserByServer} from './local-server';

/**
 * 注册 openInBrowser 命令
 */
export function registerOpenInBrowserCommand(context: vscode.ExtensionContext): void {
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
    if (/^x?html?$/i.test(languageId)) {
      // openBrowser(filename);
      openBrowserByServer(filename);
      success = true;
    } else {
      showWarningMessage($t('nonHTML.warn'));
    }

    // send collect info
    const type = evt ? 'context_menu' : 'shortcut_key';
    collect(type, {success});
  });

  context.subscriptions.push(disposable);
}
