const path = require('path');
const fs = require('fs');

type LocaleData = Record<string, string>
type LangData = Record<string, LocaleData>;

let langData: LangData | null = null;

function readLangConfig(): void {
  try {
    // 读取i18n/lang
    const langFolder = path.resolve(__dirname, '../../i18n/lang');
    fs.readdirSync(langFolder).forEach((item: string) => {
      const match = item.match(/([\w-]+)\.json/i);
      const stat = fs.statSync(path.resolve(langFolder, item));
      if (match && stat.isFile()) {
        try {
          const locale = match[1].toLowerCase();
          const content = fs.readFileSync(path.resolve(langFolder, item));
          langData = langData as LangData;
          langData[locale] = JSON.parse(content);
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
export default function langHelper(locale: string, key: string, defaultText: string): string {
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
