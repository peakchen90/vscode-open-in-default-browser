import * as vscode from 'vscode';
import LocalServer from './LocalServer';

export type WorkspaceFolder = vscode.WorkspaceFolder;
export type WorkspaceFolders = WorkspaceFolder[];

export interface WorkspaceData {
  workspaceFolder: WorkspaceFolder,
  dirname: string,
  server: LocalServer
}

export interface CustomError extends Error {
  payload: any
}
