import * as vscode from 'vscode';
import {WorkspaceData, WorkspaceFolder, WorkspaceFolders} from './types';
import LocalServer from './LocalServer';

export default class Manage {
  private workspaceFolders: WorkspaceFolders | undefined;

  private readonly map: Map<string, WorkspaceData>;

  private readonly cancelListening: () => void;

  constructor() {
    this.map = new Map();
    this._updateWorkspaceFolder();
    this._resolveMap();
    this.cancelListening = this._listenWorkspaceFoldersChange();
  }

  add(workspaceFolder: WorkspaceFolder): WorkspaceData {
    const path = workspaceFolder.uri.fsPath;

    if (this.has(path)) {
      const data = this.map.get(path) as WorkspaceData;
      data.workspaceFolder = workspaceFolder;
      data.server.update(workspaceFolder);
      return data;
    }

    const server = new LocalServer(workspaceFolder);
    const data = {
      workspaceFolder,
      path,
      server
    };
    this.map.set(path, data);
    return data;
  }

  remove(path: string): void {
    this.map.delete(path);
  }

  get(path: string): WorkspaceData | null {
    return this.map.get(path) || null;
  }

  getByFilename(filename: string): WorkspaceData | null {
    const {relative} = require('path');
    let target: WorkspaceData | null = null;
    let relativeLength: number = 0;

    this.map.forEach((data) => {
      const relativePath = relative(data.path, filename);
      if (/^\.\./.test(relativePath)) {
        return;
      }
      if (!target) {
        target = data;
        relativeLength = relativePath.length;
      } else if (relativePath.length < relativeLength) {
        target = data;
        relativeLength = relativePath.length;
      }
    });

    return target;
  }

  has(path: string): boolean {
    return this.map.has(path);
  }

  destroy() {
    this.workspaceFolders = undefined;
    this.map.forEach((item) => {
      item.server.destroy();
    });
    this.map.clear();
    this.cancelListening();
  }

  async openBrowser(filename: string): Promise<boolean> {
    const workspaceData = this.getByFilename(filename);
    if (!workspaceData) {
      return false;
    }

    await workspaceData.server.openBrowser(filename);
    return true;
  }

  private _listenWorkspaceFoldersChange(): () => void {
    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(({added, removed}) => {
      if (added.length > 0) {
        added.forEach((workspaceFolder) => this.add(workspaceFolder));
      }
      if (removed.length > 0) {
        removed.forEach((workspaceFolder) => {
          const path = workspaceFolder.uri.fsPath;
          this.remove(path);
        });
      }
    });

    return () => {
      try {
        disposable.dispose();
      } catch (e) {
      }
    };
  }

  private _updateWorkspaceFolder() {
    this.workspaceFolders = vscode.workspace.workspaceFolders;
  }

  private _resolveMap() {
    if (Array.isArray(this.workspaceFolders)) {
      this.workspaceFolders.forEach((workspaceFolder: WorkspaceFolder) => {
        this.add(workspaceFolder);
      });
    }
  }
}
