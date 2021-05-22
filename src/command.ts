import * as vscode from 'vscode';
import {getConfiguration} from './utils/vscode';
import {openBrowserByServer} from './local-server';
import {COMMAND, CONFIGURATION} from './config';
import {openFileByTransitServer} from './utils/TransitServer';

/**
 * 注册 openInDefaultBrowser 命令
 */
export function registerOpenInBrowserCommand(context: vscode.ExtensionContext): void {
  const disposable: vscode.Disposable = vscode.commands.registerCommand(COMMAND.OPEN_IN_BROWSER, (evt) => {
    let filename = '';

    if (evt && typeof evt.path === 'string') {
      const match = evt.path.match(/\.(\w+)$/);
      if (match) {
        filename = evt.fsPath;
      }
    } else {
      const activeTextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
      const document = activeTextEditor.document;
      filename = document.fileName;
    }

    const useHttpServer = getConfiguration(CONFIGURATION.OPEN_WITH_HTTP_SERVER);
    if (useHttpServer) {
      openBrowserByServer(filename);
    } else {
      openFileByTransitServer(filename);
    }
  });

  context.subscriptions.push(disposable);
}
