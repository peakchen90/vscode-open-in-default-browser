import * as vscode from 'vscode';
import * as path from 'path';
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
    const dirname = workspaceFolder.uri.fsPath;

    if (this.has(dirname)) {
      const data = this.map.get(dirname) as WorkspaceData;
      data.workspaceFolder = workspaceFolder;
      data.server.update(workspaceFolder);
      return data;
    }

    const server = new LocalServer(workspaceFolder);
    const data = {
      workspaceFolder,
      dirname,
      server
    };
    this.map.set(dirname, data);
    return data;
  }

  remove(dirname: string): void {
    this.map.delete(dirname);
  }

  get(dirname: string): WorkspaceData | null {
    return this.map.get(dirname) || null;
  }

  getByFilename(filename: string): WorkspaceData | null {
    let target: WorkspaceData | null = null;
    let relativeLength: number = 0;

    this.map.forEach((data) => {
      const relativePath = path.relative(data.dirname, filename);
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

  has(dirname: string): boolean {
    return this.map.has(dirname);
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
          const dirname = workspaceFolder.uri.fsPath;
          this.remove(dirname);
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
