import * as path from 'path';
import * as fs from 'fs';

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
export function getStat(filename: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stats: fs.Stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

/**
 * 返回相对于根目录的路径
 * @param pathname
 */
export function resolveRoot(pathname: string = ''): string {
  return path.resolve(__dirname, '..', pathname);
}

/**
 * 同步读取文本文件
 * @param filename
 */
export function readTextFile(filename: string): string {
  return fs.readFileSync(filename).toString();
}

/**
 * 解析JSON文件
 * @param filename
 */
export function parseJSONFile(filename: string): object | null {
  let data: any = null;
  try {
    data = JSON.parse(readTextFile(filename));
  } catch (e) {
    console.error(e);
  }
  return data;
}

/**
 * 返回目录index文件
 * @param dirname
 * @param index
 */
export function getIndexFilename(dirname: string, index: string = 'index'): Promise<string> {
  return new Promise((resolve, reject) => {
    const indexFiles: string[] = [
      `${index}.html`,
      `${index}.htm`
    ];

    fs.readdir(dirname, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const indexFile = files.find((file: string) => {
          file = file.toLowerCase();
          return indexFiles.some((item) => item === file);
        });
        if (indexFile) {
          resolve(path.resolve(dirname, indexFile));
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

/**
 * 返回相对路径，如果rootPath不是filename的父级，则返回null
 * @param rootPath
 * @param filename
 */
export function getRelativePath(rootPath: string, filename: string): string | null {
  const relativePath = path.relative(rootPath, filename);
  if (/^\.\./.test(relativePath)) {
    return null;
  }
  return relativePath;
}

/**
 * 查找map的值，类似Array.prototype.find
 * @param map
 * @param callback
 */
export function findMap<K, T>(
  map: Map<K, T>,
  callback: (value: T, key: K, map: Map<K, T>) => boolean
): { key: K, value: T } | undefined {
  const keys = map.keys();
  map.entries();
  const result = keys.next();
  while (!result.done) {
    const key = result.value;
    const value = map.get(key) as T;
    const isFound = callback(value, key, map);
    if (isFound) {
      return {
        key,
        value
      };
    }
  }
  return undefined;
}
