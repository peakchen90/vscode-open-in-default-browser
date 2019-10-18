import * as vscode from 'vscode';
import collect from './service/collect';
import {getConfiguration} from './utils/vscode';
import {openBrowser} from './utils/utils';
import {openBrowserByServer} from './local-server';
import {COMMAND, CONFIGURATION} from './config';

/**
 * 注册 openInDefaultBrowser 命令
 */
export function registerOpenInBrowserCommand(context: vscode.ExtensionContext): void {
  const disposable: vscode.Disposable = vscode.commands.registerCommand(COMMAND.OPEN_IN_BROWSER, (evt) => {
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

    const useHttpServer = getConfiguration(CONFIGURATION.OPEN_WITH_HTTP_SERVER);
    if (useHttpServer) {
      openBrowserByServer(filename);
    } else {
      openBrowser(filename);
    }

    const type = evt ? 'context_menu' : 'shortcut_key';
    collect(type, {languageId, useHttpServer});
  });

  context.subscriptions.push(disposable);
}
