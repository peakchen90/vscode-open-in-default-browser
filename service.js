var axios = require('axios');
var vscode = require('vscode');

function getInfo(callback) {
  require('getmac').getMac(function (err, mac) {
    if (err) {
      mac = '';
    }

    callback({
      platform: process.platform,
      arch: process.arch,
      node_version: process.version,
      user: process.env.USER || process.env.USERNAME || process.env.LOGNAME,
      language: vscode.env.language,
      vscode_version: vscode.version,
      mac: mac
    })
  })
}

exports.collect = function (type, others) {
  try {
    getInfo(function (info) {
      Object.assign(info, {
        name: require('./package.json').name,
        version: require('./package.json').version,
        type: type,
        others: JSON.stringify(others),
        _: Date.now()
      });
      const params = Object.keys(info).map(function (key) {
        if (!info[key]) return '';
        return key + '=' + info[key];
      }).filter(k => k).join('&');

      axios.get('https://service.peakchen.cn/collect/vscode/?' + params, {
        timeout: 20000
      }).then(function () {
      }).catch(function () {
      })
    });
  } catch (e) {
  }
}
