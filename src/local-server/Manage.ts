import * as vscode from 'vscode';
import {WorkspaceData, WorkspaceFolder, WorkspaceFolders} from './types';
import LocalServer from './LocalServer';
import {showErrorMessage} from '../utils/vscode';
import $t from '../../i18n/lang-helper';
import {getRelativePath} from '../utils/utils';

export default class Manage {
  private workspaceFolders: WorkspaceFolders | undefined;
  private readonly map: Map<string, WorkspaceData>;
  private readonly cancelListening: () => void;

  constructor() {
    this.map = new Map();
    this._resolveWorkspaceMap();
    this.cancelListening = this._listenWorkspaceFoldersChange();
  }

  /**
   * 添加workspace
   * @param workspaceFolder
   */
  add(workspaceFolder: WorkspaceFolder): WorkspaceData {
    const dirname = workspaceFolder.uri.fsPath;

    if (this.has(dirname)) {
      const data = this.map.get(dirname) as WorkspaceData;
      data.workspaceFolder = workspaceFolder;
      data.server.updateWorkspace(workspaceFolder);
      return data;
    }

    const server = new LocalServer(workspaceFolder);
    const data = {workspaceFolder, dirname, server};
    this.map.set(dirname, data);
    return data;
  }

  /**
   * 移出workspace
   * @param dirname
   */
  remove(dirname: string): void {
    const target = this.get(dirname);
    if (target) {
      target.server.destroy();
    }
    this.map.delete(dirname);
  }

  /**
   * 返回workspace数据
   * @param dirname
   */
  get(dirname: string): WorkspaceData | null {
    return this.map.get(dirname) || null;
  }

  /**
   * 根据工作区的文件返回workspace数据
   * @param filename
   */
  getByFilename(filename: string): WorkspaceData | null {
    let target: WorkspaceData | null = null;
    let relativeLength: number = 0;

    this.map.forEach((data) => {
      const relativePath = getRelativePath(data.dirname, filename);
      if (relativePath == null) {
        return;
      }
      if (!target) {
        target = data;
        relativeLength = relativePath.length;
      } else if (relativePath.length > relativeLength) {
        target = data;
        relativeLength = relativePath.length;
      }
    });

    return target;
  }

  /**
   * 判断是否存在workspace
   * @param dirname
   */
  has(dirname: string): boolean {
    return this.map.has(dirname);
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.workspaceFolders = undefined;
    this.map.forEach((item) => {
      item.server.destroy();
    });
    this.map.clear();
    this.cancelListening();
  }

  /**
   * 打开浏览器
   * @param filename
   */
  async openBrowser(filename: string): Promise<boolean> {
    const workspaceData = this.getByFilename(filename);
    if (!workspaceData) {
      showErrorMessage($t('localServer.noMatchWorkspace'));
      return false;
    }

    await workspaceData.server.openBrowser(filename);
    return true;
  }

  /**
   * 监听workspace改变
   * @private
   */
  private _listenWorkspaceFoldersChange(): () => void {
    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this._resolveWorkspaceMap();
    });

    return () => {
      try {
        disposable.dispose();
      } catch (e) {
      }
    };
  }

  /**
   * resolve workspace map
   * @private
   */
  private _resolveWorkspaceMap() {
    this.workspaceFolders = vscode.workspace.workspaceFolders;

    if (Array.isArray(this.workspaceFolders)) {
      // added
      this.workspaceFolders.forEach((workspaceFolder) => {
        const dirname = workspaceFolder.uri.fsPath;
        if (!this.get(dirname)) {
          this.add(workspaceFolder);
        }
      });

      // removed
      const removed: string[] = [];
      this.map.forEach((data) => {
        if (!(this.workspaceFolders as WorkspaceFolders).find((item) => item.uri.fsPath === data.dirname)) {
          removed.push(data.dirname);
        }
      });
      removed.forEach((item) => this.remove(item));
    }
  }
}
