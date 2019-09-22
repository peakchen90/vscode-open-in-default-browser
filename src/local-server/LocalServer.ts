import * as express from 'express';
import {stat, Stats} from 'fs';
import {WorkspaceFolder} from './types';
import {getPort, openBrowser} from '../utils/utils';
import {getLocale, showWarningMessage} from '../utils/vscode';
import $t from '../../i18n/lang-helper';

export default class LocalServer {
  private app: express.Application | null;

  private workspaceFolder: WorkspaceFolder;

  private rootPath: string;

  private port: number | null;

  private _isMounted: boolean;

  private _isDestroyed: boolean;

  constructor(workspaceFolder: WorkspaceFolder) {
    this.app = null;
    this.workspaceFolder = workspaceFolder;
    this.rootPath = workspaceFolder.uri.fsPath;
    this._isMounted = false;
    this._isDestroyed = false;
  }

  /**
   * 创建服务
   */
  async createServer(): Promise<void> {
    if (this.isMounted()) {
      return;
    }

    this.app = express();
    this.app.engine('art', require('express-art-template'));
    this.app.set('views', require('path').resolve(__dirname, '../public/template'));
    this.app.set('view engine', 'art');
    this.app.use(require('compression')());

    this.app.use(this.handleRequest);
    // this.app.use(this.handleRequest);
    this.app.use(this.handleCatch);
    this.port = await getPort(52330);
    this.app.listen(this.port);
  }

  /**
   * 更新workspace
   */
  update(workspaceFolder: WorkspaceFolder) {
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

  isMounted() {
    return this._isMounted;
  }

  isDestroyed() {
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

  private handleRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    const {resolve} = require('path');
    const relativePath = req.url.replace(/^\//, '');
    const filename = resolve(this.rootPath, relativePath);
    stat(filename, (err, stats: Stats) => {
      if (err) {
        res.status(404);
        next(new Error('404 Not Found'));
      } else if (!stats.isFile()) {
        res.status(404);
        next(new Error('404 Not Found'));
      } else {
        res.sendFile(filename);
      }
    });
  }

  private handleCatch(err: any, req: express.Request, res: express.Response) {
    if (err) {
      res.render('error', {
        lang: getLocale(),
        title: err.message || 'Error Page',
        content: err.stack || err.message || '500 Error'
      });
    }
  }
}
