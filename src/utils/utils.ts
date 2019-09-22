/**
 * 加密成base64
 * @param str
 */
export function encodeBase64(str: string) {
  return Buffer.from(str).toString('base64');
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
