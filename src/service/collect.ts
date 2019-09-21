import * as vscode from 'vscode';
import http from './http';
import {encodeBase64} from '../utils/utils';

let baseInfo = null;

function getBaseInfo() {
  return new Promise((resolve) => {
    if (baseInfo) {
      resolve(baseInfo);
    } else {
      require('getmac').getMac((err, mac) => {
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
  const pkg = require('../../package.json');
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
        data: encodeBase64(data),
        version: pkg.version.split('.')[0],
        _: Date.now(),
      }
    });
  } catch (e) {
  }
}
