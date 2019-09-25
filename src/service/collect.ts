import http from './http';
import getBaseInfo from './getBaseInfo';
import {encodeBase64} from '../utils/utils';


export default async function collect(type: string, others: any) {
  const baseInfo = await getBaseInfo();
  const data = {
    ...baseInfo,
    others: others && JSON.stringify(others),
    type
  };

  try {
    await http.get('/collect/send/v2', {
      params: {
        data: encodeBase64(JSON.stringify(data)),
        version: baseInfo.version,
        _: Date.now(),
      }
    });
  } catch (e) {
  }
}
