import * as vscode from 'vscode';
import {parseJSONFile, resolveRoot} from '../utils/utils';

let baseInfo: Record<string, any> | null = null;
let pkg: any = null;

export default function getBaseInfo(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    if (!pkg) {
      pkg = parseJSONFile(resolveRoot('package.json')) || {};
    }

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
          name: pkg.name,
          version: pkg.version,
          mac
        };

        resolve(baseInfo);
      });
    }
  });
}
