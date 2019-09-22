import {readdir, stat, Stats} from 'fs';

/**
 * 加密成base64
 * @param str
 */
export function encodeBase64(str: string) {
  return Buffer.from(str).toString('base64');
}

/**
 * 返回文件stats
 * @param filename
 */
export function getStat(filename: string): Promise<Stats> {
  return new Promise((resolve, reject) => {
    stat(filename, (err, stats: Stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

/**
 * 返回目录index文件
 * @param dirname
 * @param index
 */
export function getIndexFilename(dirname: string, index: string = 'index'): Promise<string> {
  return new Promise((resolve, reject) => {
    const {resolve: resolvePath} = require('path');
    const indexFiles: string[] = [
      `${index}.html`,
      `${index}.htm`
    ];

    readdir(dirname, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const indexFile = files.find((file: string) => {
          file = file.toLowerCase();
          return indexFiles.some((item) => item === file);
        });
        if (indexFile) {
          resolve(resolvePath(dirname, indexFile));
        } else {
          reject(new Error(`file not found: ${dirname}`));
        }
      }
    });
  });
}

/**
 * 获取可用的端口号
 * @param start
 */
export function getPort(start: number): Promise<number> {
  return new Promise((resolve, reject) => {
    require('getport')(start, (err: any, port: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(port);
      }
    });
  });
}

/**
 * 打开默认浏览器
 * @param url
 */
export async function openBrowser(url: string): Promise<void> {
  const open = require('open');
  await open(url);
}
