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
   * Given a Master String (user password), will derive a 64 byte key out of it.
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
      keyLength: number = 64,
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
}
