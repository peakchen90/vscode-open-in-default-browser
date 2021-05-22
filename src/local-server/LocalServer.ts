import * as path from 'path';
import * as http from 'http';
import * as os from 'os';
import express from 'express';
import { WorkspaceFolder } from './types';
import { getLocale, showErrorMessage } from '../utils/vscode';
import $t from '../utils/lang-helper';
import {
  getIndexFilename,
  getPort,
  getStat,
  openBrowser,
  resolveRoot
} from '../utils/utils';

const isWin32 = os.platform() === 'win32';

export default class LocalServer {
  private static nextPort: number = 52330;
  private server: http.Server | null;
  private workspaceFolder: WorkspaceFolder;
  private rootPath: string;
  private port: number | null;
  private locale: string;
  private _isDestroyed: boolean;

  constructor(workspaceFolder: WorkspaceFolder) {
    this.server = null;
    this.workspaceFolder = workspaceFolder;
    this.rootPath = workspaceFolder.uri.fsPath;
    this.port = null;
    this.locale = getLocale();
    this._isDestroyed = false;
  }

  /**
   * 打开浏览器
   * @param filename
   */
  async openBrowser(filename: string): Promise<void> {
    if (this.isDestroyed()) {
      return;
    }
    if (!this.isReady()) {
      await this.createServer().catch((err: Error) => {
        showErrorMessage(`${$t('run.localServer.createError')} ${err.message}`);
        throw err;
      });
    }

    const relativePath = path.relative(this.rootPath, filename);
    const url = relativePath.split(path.sep).join('/');
    await openBrowser(`http://localhost:${this.port}/${url}`);
  }

  /**
   * 创建HTTP服务
   */
  async createServer(): Promise<void> {
    if (this.isDestroyed() || this.isReady()) {
      return;
    }

    const app: express.Application = express();
    app.engine('html', require('express-art-template'));
    app.set('views', resolveRoot('public/template'));
    app.set('view engine', 'html');
    app.use(require('serve-favicon')(resolveRoot('public/favicon.ico')));
    app.use(require('compression')());
    app.use(this._handleRequest.bind(this));
    app.use(this._handleCatch.bind(this));

    this.port = await getPort(LocalServer.nextPort++);
    this.server = http.createServer(app);
    this.server.listen(this.port);

    return new Promise<void>((resolve, reject) => {
      const server = this.server as http.Server;
      server.on('listening', resolve);
      server.on('error', reject);
    });
  }

  /**
   * 更新workspace
   */
  updateWorkspace(workspaceFolder: WorkspaceFolder): void {
    this.workspaceFolder = workspaceFolder;
    this.rootPath = workspaceFolder.uri.fsPath;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.isDestroyed()) {
      return;
    }
    if (this.server && this.isReady()) {
      this.server.close();
    }
    this.server = null;
    this.port = null;
    this._isDestroyed = true;
  }

  /**
   * 服务是否可用
   */
  isReady(): boolean {
    return !!this.server && this.server.listening;
  }

  /**
   * 服务是否被销毁
   */
  isDestroyed(): boolean {
    return this._isDestroyed;
  }

  private _handleRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const relativePath = decodeURIComponent(req.url).replace(/^\//, '');

    const filename = path.resolve(this.rootPath, relativePath);

    const relative = path.posix.relative(this.rootPath, filename);
    if (
      (!isWin32 && /^\.\.\//.test(relative))
      || (isWin32 && /^\.\.\\/.test(relative))
    ) {
      const error = new Error('403: No access to files outside the workspace');
      error.stack = '';
      error.name = '403';
      next(error);
      return;
    }

    getStat(filename).then((stats) => {
      if (stats.isDirectory()) {
        getIndexFilename(filename).then((indexFile) => {
          res.sendFile(indexFile);
        }).catch(() => {
          const error = new Error(`File not found: ${filename}`);
          error.stack = '';
          error.name = '404';
          next(error);
        });
      } else if (!stats.isFile()) {
        const error = new Error(`File not found: ${filename}`);
        error.stack = '';
        error.name = '404';
        next(error);
      } else {
        res.sendFile(filename);
      }
    }).catch((err) => {
      err.name = '404';
      next(err);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _handleCatch(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (err) {
      if (err.name === '404') {
        res.status(404);
      } else if (err.name === '403') {
        res.status(403);
      } else {
        res.status(500);
      }
      res.render('error', {
        lang: this.locale,
        title: err.message || 'Error Page',
        content: err.stack || err.message || '500 Error'
      });
    } else {
      res.end();
    }
  }
}
