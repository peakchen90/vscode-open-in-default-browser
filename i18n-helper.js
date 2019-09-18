var path = require('path');
var fs = require('fs');

var i18nData = null;

function readConfig() {
  var i18nFolder = path.resolve(__dirname, 'i18n');
  var configFiles = fs.readdirSync(i18nFolder).filter(function (item) {
    if (!/\.json$/i.test(item)) {
      return false;
    }
    var stat = fs.statSync(path.resolve(i18nFolder, item));
    return stat.isFile();
  }).map(function (item) {
    var match = item.match(/([\w-]+)\.json/i);
    if (match) {
      return {
        locale: match[1],
        path: path.resolve(i18nFolder, item)
      }
    }
  })

  configFiles.forEach(function (item) {
    try {
      var content = fs.readFileSync(item.path);
      i18nData[item.locale] = JSON.parse(content);
    } catch (e) {
      console.error(e);
    }
  })
}

/**
 * 国际化i18n helper
 * @param {string} locale 语言
 * @param {string} key 字段
 * @param {string} [defaultText] 默认文本，如果没找到则返回该文本
 */
module.exports = function (locale, key, defaultText) {
  if (i18nData === null) {
    i18nData = {};
    readConfig();
  }

  var data = i18nData[locale]
  if (!data) {
    locale = String(locale).split(/[-_]/)[0];
    data = i18nData[locale] || i18nData['en'] || {};
  }
  return data[key] || defaultText;
}
