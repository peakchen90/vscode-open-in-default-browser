// eslint-disable-next-line no-unused-vars
import * as vscode from 'vscode';
import {registerOpenInBrowserCommand} from './command';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const pkg = require('../package.json');
  console.log(`extension "${pkg.displayName}" is now active!`);

  registerOpenInBrowserCommand(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
