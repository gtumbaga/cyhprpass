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

  ab2b64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  b642ab(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
    ): Promise<CryptoKey>
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
    //const derivation = await crypto.subtle.deriveBits(params, importedKey, keyLength * 8);

    let derivation: CryptoKey;
    try {
      derivation = await window.crypto.subtle.deriveKey(
        {name: 'PBKDF2', hash: 'SHA-512', salt: saltBuffer, iterations: 1001},
        importedKey,
        {name: 'AES-GCM', length: 256},
        true,
        ['encrypt', 'decrypt']
      );
    } catch (err) {
      console.log(`Unable to derrive key because of error: ${err}`);

    }

    return derivation;
  }

  async cryptoKey2JWK(theCKey: CryptoKey): Promise<string> {
    return JSON.stringify(await crypto.subtle.exportKey('jwk', theCKey));
  }

  async JWK2CryptoKey(theJSONstr: string): Promise<CryptoKey> {
    const theJSON = JSON.parse(theJSONstr);
    const importedKey = await crypto.subtle.importKey('jwk', theJSON, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
    return importedKey;
  }

  async strKey2CrytoKey(strKey: string, strSalt: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const saltBuffer = enc.encode(strSalt);

    // turn the string into array buffer
    const abKey = this.b642ab(strKey);

    // import the key
    let importKey: CryptoKey;
    try {
      importKey = await window.crypto.subtle.importKey('raw', abKey, 'PBKDF2', false, ['deriveBits', 'deriveKey']);
    } catch (err) {
      console.log(`Unable to import key because of error: ${err}`);
    }
    // derrive the key
    let key: CryptoKey;
    try {
      key = await window.crypto.subtle.deriveKey(
        {name: 'PBKDF2', hash: 'SHA-512', salt: saltBuffer, iterations: 1001},
        importKey,
        {name: 'AES-GCM', length: 256},
        false,
        ['encrypt', 'decrypt']
      );
    } catch (err) {
      console.log(`Unable to derrive key because of error: ${err}`);
    }

    return key;
  }

  generateRandomIV(): ArrayBuffer {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }

  async encryptMessage(keyCryptoKey: CryptoKey, theIV: ArrayBuffer, strSalt: string, userString: string): Promise<ArrayBuffer> {
    const enc = new TextEncoder();
    const encoded = enc.encode(userString);

    try {
      //const key = await this.strKey2CrytoKey(strKey, strSalt);
      const key = keyCryptoKey;
      // The iv must never be reused with a given key.
      //const randomIV = window.crypto.getRandomValues(new Uint8Array(12));

      const ciphertext = await window.crypto.subtle.encrypt( { name: 'AES-GCM', iv: theIV }, key, encoded);
      //const tag = ciphertext.getAuthTag();

      //const buffer = new Uint8Array(ciphertext, 0, 5);

      return ciphertext;
    } catch (err) {
      console.log(`error importing derrived key, because: ${err}`);
      return new Uint8Array(null, 0, 5);
    }

  } // encryptMessage


  async decryptMessage(keyCryptoKey: CryptoKey, strSalt: string,  cipherPackage: string): Promise<string> {

    //const key = await this.strKey2CrytoKey(strKey, strSalt);
    const key = keyCryptoKey;

    //const randomIV = window.crypto.getRandomValues(new Uint8Array(12));
    //const encryptedAB = this.str2ab(encryptedString);



    // string gets converted from base64 to JSON string, then parase the JSON string
    // back to object, then remove the iv and b64 encrypted message from it...
    const cipherObj = JSON.parse(atob(cipherPackage));

    console.log(`extracted cipher from cipherObj as: ${cipherObj.cipher}`);

    const encryptedAB = this.str2ab(cipherObj.cipher);

    const theIV = this.str2ab(cipherObj.iv);
    //const theIV = cipherObj.iv;
    //const encryptedAB = encryptMessage;

    let decrypted: ArrayBuffer;
    try{
    decrypted = await window.crypto.subtle.decrypt( { name: 'AES-GCM', iv: theIV }, key, encryptedAB);
    } catch (err) {
      console.log(`unable to decrypt message because of error: ${err}`);
    }

    //return this.ab2str(decrypted);

    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decrypted);
    return plaintext;
  } // decryptMessage
}
