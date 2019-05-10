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
      mac: mac
    })
  })
}

exports.collect = function (type, others) {
  try {
    getInfo(function (info) {
      Object.assign(info, {
        name: require('./package.json').name,
        type: type,
        others: JSON.stringify(others),
        _: Date.now()
      });
      const params = Object.keys(info).map(function (key) {
        if (!info[key]) return '';
        return key + '=' + info[key];
      }).filter(k => k).join('&');
      console.log(params)

      axios.get('https://service.peakchen.cn/collect/vscode/?' + params, {
        timeout: 20000
      }).then(res => {
        console.log(res);
      }).catch(function () {
      })
    });
  } catch (e) {
  }
}
