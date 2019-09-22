import * as express from 'express';
import {getPort} from '../utils/utils';

const app = express();

/**
 * 创建本地服务
 */
export default async function createLocalServer() {
  const port = await getPort(52330);
  app.listen(port);
}
