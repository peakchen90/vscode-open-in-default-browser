import * as vscode from 'vscode';

let locale: string | null = null;

/**
 * 返回当前环境locale
 */
export function getLocale(): string {
  if (locale) {
    return locale;
  }

  let config: Record<string, any> = {};
  try {
    config = JSON.parse(process.env.VSCODE_NLS_CONFIG as string);
    locale = config.locale;
  } catch (e) {
    console.error(e);
  }

  return locale || 'en';
}

/**
 * 提示警告信息
 * @param message
 */
export function showWarningMessage(message: string): void {
  vscode.window.showWarningMessage(message);
}
