/**
 * 多语言支持
 * @link http://www.lingoes.cn/zh/translator/langcode.htm
 */

import * as path from 'path';
import * as fs from 'fs';
import {getLocale} from './vscode';
import {parseJSONFile, resolveRoot} from './utils';

type LocaleConfig = Record<string, string>

let langData: Map<string, LocaleConfig> | null = null;

function readLangConfig(): void {
  try {
    const rootPath = resolveRoot();
    fs.readdirSync(rootPath).forEach((item: string) => {
      // 匹配 package.nls(.lang).json
      const match = item.match(/^package\.nls(?:\.([\w-]+?))?\.json$/i);

      try {
        if (match && fs.statSync(path.resolve(rootPath, item))) {
          let locale = match[1] || 'en';
          locale = locale.toLowerCase();
          const content = parseJSONFile(path.resolve(rootPath, item));
          if (langData && content) {
            langData.set(locale, content as LocaleConfig);
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * lang helper
 * @param locale
 * @param key
 * @param defaultText
 */
export function langHelper(locale: string, key: string, defaultText: string = ''): string {
  if (!langData) {
    langData = new Map<string, LocaleConfig>();
    readLangConfig();
  }

  const defaultLocale = 'en';
  let data = langData.get(locale);
  if (!data) {
    locale = String(locale).split(/[-_]/)[0].toLowerCase();
    data = langData.get(locale) || langData.get(defaultLocale) || {};
  }
  return (data && data[key]) || defaultText;
}

export default function $t(key: string): string {
  const locale = getLocale();
  return langHelper(locale, key);
}
