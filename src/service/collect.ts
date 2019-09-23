import * as vscode from 'vscode';
import http from './http';
import {encodeBase64, parseJSONFile, resolveRoot} from '../utils/utils';

let baseInfo: Record<string, any> | null = null;
let pkg: any = null;

function getBaseInfo(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    if (baseInfo) {
      resolve(baseInfo);
    } else {
      require('getmac').getMac((err: any, mac: string) => {
        if (err) {
          mac = '';
        }
        baseInfo = {
          platform: process.platform,
          arch: process.arch,
          node_version: process.version,
          user: process.env.USER || process.env.USERNAME || process.env.LOGNAME,
          language: vscode.env.language,
          vscode_version: vscode.version,
          mac
        };

        resolve(baseInfo);
      });
    }
  });
}

export default async function collect(type: string, others: any) {
  await getBaseInfo();
  if (!pkg) {
    pkg = parseJSONFile(resolveRoot('package.json'));
  }
  const data = {
    ...baseInfo,
    name: pkg.name,
    version: pkg.version,
    others: others && JSON.stringify(others),
    type
  };

  try {
    await http.get('https://vscode.peakchen.cn/collect/send', {
      params: {
        data: encodeBase64(JSON.stringify(data)),
        version: pkg.version.split('.')[0],
        _: Date.now(),
      }
    });
  } catch (e) {
  }
}
