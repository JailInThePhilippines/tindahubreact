import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = '1gIra1rYbReqpMt5jpYxF85NB8HLrXCtdzw7wWuJ4g3iEiZBo0s+CM1a+PJHVhw5nlXxeT4d5cG86B6irCOJcmU3Lx/56y4TXWCXcTNYDA0EPCRVvsxTRucFo2jNoVIJj6fGQtcU3HKreHxrS37eou84pQSk7X55ad/DyJJCXkRYa+p6ypvv+vjl869zsYuQC4bHPv74GQbShywdbTEPFKqFb6yB4fVvg+iTNKDGVvATT1PXVMnEBM2YDn6x83Ap+GkChHbrFuuixIfUGTdv3qgGvFzwgt0LV28HrNga3lPhyhSLAOBe4gPGUFg6JUX6C5mj4QhTTYcmuVFpLMThNAaPR7sif2zS0F97WRGMZfg=';

class CryptoService {
  private readonly SECRET_KEY: string = ENCRYPTION_KEY;

  encrypt(data: any): string {
    try {
      const stringData = typeof data === 'string' ? data : JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(stringData, this.SECRET_KEY).toString();
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData: string): any {
    try {
      const fromBase64 = atob(encryptedData);
      const decrypted = CryptoJS.AES.decrypt(fromBase64, this.SECRET_KEY);
      const originalData = decrypted.toString(CryptoJS.enc.Utf8);

      try {
        return JSON.parse(originalData);
      } catch {
        return originalData;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }
}

export const cryptoService = new CryptoService();

export const useCrypto = () => {
  return {
    encrypt: (data: any) => cryptoService.encrypt(data),
    decrypt: (encryptedData: string) => cryptoService.decrypt(encryptedData),
  };
};