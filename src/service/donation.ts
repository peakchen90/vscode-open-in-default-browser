import * as vscode from 'vscode';
import getBaseInfo from './getBaseInfo';
import http from './http';
import $t from '../utils/lang-helper';
import {openBrowser} from '../utils/utils';

let tradeId: any = null;
let donationUrl: any = null;
let timestamp: number = Date.now();

async function requestFeedback(isOK: boolean) {
  try {
    await http.post('/collect/donationFeedback', {
      tradeId,
      feedback: isOK ? 'ok' : 'cancel',
      feedback_time: Math.ceil((Date.now() - timestamp) / 1000)
    });
  } catch (e) {
  }
}

function showDonationInfo() {
  const okText = $t('donation.okText');
  const cancelText = $t('donation.cancelText');
  vscode.window.showInformationMessage($t('donation.message'), okText, cancelText).then((press) => {
    const isOk = press === okText;
    if (isOk) {
      openBrowser(donationUrl);
    }
    requestFeedback(isOk);
  });
}

async function requestDonation() {
  const baseInfo = await getBaseInfo();
  try {
    const {data} = await http.post('/collect/donation', {
      name: baseInfo.name,
      version: baseInfo.version,
      vscode_version: baseInfo.vscode_version,
      language: baseInfo.language,
      mac: baseInfo.mac
    });
    if (data.donationEnabled && data.donationUrl) {
      tradeId = data.tradeId;
      donationUrl = data.donationUrl;
      timestamp = Date.now();
      let donationDelay = Number(data.donationDelay);
      if (Number.isNaN(donationDelay) || donationDelay < 0) {
        donationDelay = 5;
      }
      setTimeout(() => {
        showDonationInfo();
      }, donationDelay * 1000);
    }
  } catch (e) {
  }
}

export function initDonationTask() {
  requestDonation();
}
