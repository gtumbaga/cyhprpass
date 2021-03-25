import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private currentKey: ArrayBuffer;

  constructor() { }

  /**
   * This takes the current given key, and sets currentKey to it.
   *
   * @param theKey A Key that was derrived from deriveKeyFromMasterString.
   * @return void
   */
  setCurrentKey(theKey: ArrayBuffer): void {
    this.currentKey = theKey;
  }

  /**
   * Returns the currentKey ArrayBuffer.
   *
   * @return this.currentKey ArrayBuffer.
   */
  getCurrentKey(): ArrayBuffer {
    return this.currentKey;
  }

  /**
   * Converts the given array buffer to string, useful for storing key locally.
   *
   * @param buf A key in the form of ArrayBuffer
   * @return string form of the array buffer.
   */
  ab2str(buf: ArrayBuffer): string {
    const asString =  String.fromCharCode.apply(null, new Uint8Array(buf));

    const arrStringCodes = Array();
    for (let i = 0; i < asString.length; i++) {
      const currentCode = asString.charCodeAt(i);
      arrStringCodes[i] = currentCode;
      // console.log(currentCode);
    }

    return arrStringCodes.toString();
  }

  /**
   * Converts a string given from ab2str, back to an ArrayBuffer.
   *
   * @param str The string that was originally obtained from ab2str.
   * @return data.buffer,The Key once again in the form of an ArrayBuffer.
   */
  str2ab(str: string): ArrayBuffer {
    let strArray = Array();
    strArray = str.split(',');
    const data = Uint8Array.from(strArray);
    return data.buffer;
  }

  /**
   * Given a Master String (user password), will derive a 32 byte key out of it.
   *
   * @param password The master string (or password) that the user typed.
   * @param theSalt The string that will be used as a salt when deriving the key.
   * @param theHash The type of encryption to use.
   * @param keyLength The required length that the return key must be.
   * @param iterationsCount The amount of times the encryption should iterate.
   * @return Promise<ArrayBuffer> A promise that returns an ArrayBuffer.
   */
  async deriveKeyFromMasterString(
      password: string,
      theSalt: string = 'something',
      theHash: string = 'SHA-512',
      keyLength: number = 32,
      iterationsCount: number = 1001
    ): Promise<ArrayBuffer>
  {
    const textEncoder = new TextEncoder();
    const passwordBuffer = textEncoder.encode(password);
    const importedKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits', 'deriveKey']);

    const saltBuffer = textEncoder.encode(theSalt);
    const params = {
      name: 'PBKDF2',
      hash: theHash,
      salt: saltBuffer,
      iterations: iterationsCount
    };
    const derivation = await crypto.subtle.deriveBits(params, importedKey, keyLength * 8);

    return derivation;
  }

  async encryptMessage(abKey: ArrayBuffer, userString: string): Promise<ArrayBuffer> {
    const enc = new TextEncoder();
    const encoded = enc.encode(`xxxxxxxxxxxx${userString}`);

    try {
      const key = await window.crypto.subtle.importKey('raw', abKey, 'PBKDF2', false, ['encrypt', 'decrypt']);
      console.log('successfully created key out of abKey');
      // The iv must never be reused with a given key.
      const randomIV = window.crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await window.crypto.subtle.encrypt( { name: 'AES-GCM', iv: randomIV }, key, encoded);

      const buffer = new Uint8Array(ciphertext, 0, 5);

      return buffer;
    } catch(err) {
      console.log(`error importing derrived key, because: ${err}`);
      return new Uint8Array(null, 0, 5);
    }

  } // encryptMessage

  async decryptMessage(abKey: ArrayBuffer, encryptedAB: ArrayBuffer): Promise<string> {
    const key = await crypto.subtle.importKey('raw', abKey, 'PBKDF2', false, ['encrypt', 'decrypt']);
    const randomIV = window.crypto.getRandomValues(new Uint8Array(12));

    const decrypted = await window.crypto.subtle.decrypt( { name: 'AES-GCM', iv: randomIV }, key, encryptedAB);

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } // decryptMessage
}
