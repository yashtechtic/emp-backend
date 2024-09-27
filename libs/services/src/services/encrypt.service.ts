import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { Injectable } from '@nestjs/common';

import { SettingsService } from './settings.service';

@Injectable()
export class EncryptService {
  constructor(private settings: SettingsService) {}
  KEY: any;
  IV: any;

  initialize = async (type) => {
    let encryptKey = await this.settings.getItem('WS_ENC_KEY');
    if (type === 'content') {
      encryptKey = await this.settings.getItem('DATA_ENCRYPT_KEY');
    }
    const saltPhrase = 'CIT';
    const iterCount = 999;
    const keyPhrase = crypto.createHash('md5').update(encryptKey).digest('hex');
    const ivPhrase = crypto
      .createHash('sha1')
      .update(encryptKey)
      .digest('hex')
      .substring(0, 16);

    this.KEY = CryptoJS.PBKDF2(keyPhrase, saltPhrase, {
      hasher: CryptoJS.algo.SHA256,
      keySize: 64 / 8,
      iterations: iterCount,
    });
    this.IV = CryptoJS.enc.Utf8.parse(ivPhrase);
  };

  encryptContent = async (str) => {
    let output;
    try {
      await this.initialize('content');
      const encrypted = CryptoJS.AES.encrypt(str, this.KEY, {
        iv: this.IV,
      });
      output = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (err) {
      output = '';
    }
    return output;
  };

  decryptContent = async (str) => {
    let output;
    try {
      await this.initialize('content');
      const decrypted = CryptoJS.AES.decrypt(str, this.KEY, {
        iv: this.IV,
        format: CryptoJS.format.Hex,
      });
      output = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      output = '';
    }
    return output;
  };
}
