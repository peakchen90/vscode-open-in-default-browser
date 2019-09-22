import * as express from 'express';
import {CustomError, WorkspaceFolder} from './types';
import {
  getIndexFilename, getPort, getStat, openBrowser
} from '../utils/utils';
import {getLocale, showWarningMessage} from '../utils/vscode';
import $t from '../../i18n/lang-helper';

export default class LocalServer {
  private app: express.Application | null;

  private workspaceFolder: WorkspaceFolder;

  private rootPath: string;

  private port: number | null;

  private locale: string;

  private _isMounted: boolean;

  private _isDestroyed: boolean;

  constructor(workspaceFolder: WorkspaceFolder) {
    this.app = null;
    this.workspaceFolder = workspaceFolder;
    this.rootPath = workspaceFolder.uri.fsPath;
    this.port = null;
    this.locale = getLocale();
    this._isMounted = false;
    this._isDestroyed = false;
  }

  /**
   * 创建服务
   */
  async createServer(): Promise<number> {
    if (this.isMounted()) {
      return this.port as number;
    }

    const {resolve} = require('path');
    this.app = express();
    this.app.engine('html', require('express-art-template'));
    this.app.set('views', resolve(__dirname, '../public/template'));
    this.app.set('view engine', 'html');
    this.app.use(require('serve-favicon')(resolve(__dirname, '../public/favicon.ico')));
    this.app.use(require('compression')());

    this.app.use(this._handleRequest.bind(this));
    this.app.use(this._handleCatch.bind(this));
    this.port = await getPort(52330);
    this.app.listen(this.port);
    return this.port;
  }

  /**
   * 更新workspace
   */
  update(workspaceFolder: WorkspaceFolder): void {
    this.workspaceFolder = workspaceFolder;
    this.rootPath = workspaceFolder.uri.fsPath;
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.app = null;
    this.port = null;
    this._isMounted = false;
    this._isDestroyed = false;
  }

  isMounted(): boolean {
    return this._isMounted;
  }

  isDestroyed(): boolean {
    return this._isDestroyed;
  }

  /**
   * 打开浏览器
   * @param filename
   */
  async openBrowser(filename: string): Promise<void> {
    if (!this.isMounted()) {
      showWarningMessage($t('localServer.noLaunch'));
      await this.createServer();
    }

    const {relative, sep} = require('path');
    const relativePath = relative(this.rootPath, filename);
    const url = relativePath.split(sep).join('/');

    await openBrowser(`http://localhost:${this.port}/${url}`);
  }

  private _handleRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const {resolve} = require('path');
    const relativePath = req.url.replace(/^\//, '');
    const filename = resolve(this.rootPath, relativePath);
    getStat(filename).then((stats) => {
      if (stats.isDirectory()) {
        getIndexFilename(filename).then((indexFile) => {
          res.sendFile(indexFile);
        }).catch(() => {
          const error = new Error('404 Not Found');
          error.name = '404';
          next(error);
        });
      } else if (!stats.isFile()) {
        const err = new Error('404 Not Found');
        err.name = '404';
        next(err);
      } else {
        res.sendFile(filename);
      }
    }).catch((err) => {
      err.name = '404';
      next(err);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _handleCatch(err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (err) {
      if (err.name === '404') {
        res.status(404);
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
