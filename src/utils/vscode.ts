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

/**
 * 提示错误信息
 * @param message
 */
export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message);
}

/**
 * 获取workspace配置
 * @param section
 */
export function getConfiguration(section: string) {
  const conf = vscode.workspace.getConfiguration();
  return conf.get(section);
}
