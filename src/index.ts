import * as vscode from 'vscode';
import {registerOpenInBrowserCommand} from './command';
import {destroyLocalServerManage} from './local-server';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  registerOpenInBrowserCommand(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
  destroyLocalServerManage();
}
