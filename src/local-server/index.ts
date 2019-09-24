import Manage from './Manage';
import {showErrorMessage} from '../utils/vscode';
import $t from '../../i18n/lang-helper';

let manage: Manage | null = null;

/**
 * 初始化
 */
export function initLocalServerManage() {
  manage = new Manage();
}

/**
 * 销毁
 */
export function destroyLocalServerManage() {
  if (manage) {
    manage.destroy();
  }
}

/**
 * 打开浏览器
 * @param filename
 */
export function openBrowserByServer(filename: string) {
  if (!manage) {
    showErrorMessage($t('localServer.unknownException'));
    return;
  }
  return (manage as Manage).openBrowser(filename);
}
