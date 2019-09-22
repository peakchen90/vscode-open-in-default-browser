import * as vscode from 'vscode';

/**
 * 返回当前环境locale
 */
export function getLocale(): string {
  if (getLocale.__locale__) {
    return getLocale.__locale__;
  }

  let config: Record<string, any> = {};
  let locale: string = 'en';

  try {
    config = JSON.parse(process.env.VSCODE_NLS_CONFIG as string);
    locale = config.locale;
  } catch (e) {
    console.error(e);
  }

  getLocale.__locale__ = locale;
  return locale;
}

/**
 * 提示警告信息
 * @param message
 */
export function showWarningMessage(message: string): void {
  vscode.window.showWarningMessage(message);
}
