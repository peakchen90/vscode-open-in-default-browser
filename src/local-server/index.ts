import Manage from './Manage';

const manage = new Manage();

export function openBrowserByServer(filename: string) {
  return manage.openBrowser(filename);
}
