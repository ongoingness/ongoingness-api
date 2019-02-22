import * as crypto from 'crypto';

export default class CryptoHelper {
  public static hashString(m: string, salt?: string): string {
    const hash: crypto.Hash = crypto.createHash('sha256');
    hash.update(`${salt}${m}`);
    return hash.digest('hex');
  }

  public static getRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
