import * as path from 'path';
import * as fs from 'fs';
import {getLocale} from '../src/utils/vscode';
import {resolveRoot} from '../src/utils/utils';


type LocaleData = Record<string, string>
type LangData = Record<string, LocaleData>;

let langData: LangData | null = null;

function readLangConfig(): void {
  try {
    // 读取i18n/lang
    const langFolder = resolveRoot('../i18n/lang');
    fs.readdirSync(langFolder).forEach((item: string) => {
      const match = item.match(/([\w-]+)\.json/i);
      const stat = fs.statSync(path.resolve(langFolder, item));
      if (match && stat.isFile()) {
        try {
          const locale = match[1].toLowerCase();
          const content = fs.readFileSync(path.resolve(langFolder, item)).toString();
          langData = langData as LangData;
          langData[locale] = JSON.parse(content as string);
        } catch (e) {
          console.error(e);
        }
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
    langData = {};
    readLangConfig();
  }

  const defaultLocale = 'en';
  let data: LocaleData = langData[locale];
  if (!data) {
    locale = String(locale).split(/[-_]/)[0].toLowerCase();
    data = langData[locale] || langData[defaultLocale] || {};
  }
  return (data && data[key]) || defaultText;
}

export default function $t(key: string): string {
  const locale = getLocale();
  return langHelper(locale, key);
}
