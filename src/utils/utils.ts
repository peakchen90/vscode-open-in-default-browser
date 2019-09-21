/**
 * 加密成base64
 * @param str
 */
export function encodeBase64(str: string) {
  return Buffer.from(str).toString('base64');
}
