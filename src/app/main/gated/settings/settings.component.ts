import { Component, OnInit } from '@angular/core';
//import * as pbkdf2 from 'pbkdf2';
//const pbkdf2 = require('pbkdf2');

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  currentPW: string;

  constructor() {
    //
  }

  ngOnInit(): void {
  }

  async btnClick() {
    const theKeyBuff = await this.deriveKey(this.currentPW)
    const theKey = this.ab2str(theKeyBuff);
    const ciphertextValue = `${theKey}...[${theKeyBuff.byteLength} bytes total]`;
    console.log(`the key: ${ciphertextValue}`);
    console.log(String.fromCharCode.apply(null, new Uint8Array(theKeyBuff)));

    // now for testing, we will turn it back into an array buffer, then back to a string again, to see if it stays the same...
    const back2AB = this.str2ab(theKey);
    const theKeyAgain = this.ab2str(back2AB);
    const ciphertextValueAgain = `${theKeyAgain}...[${back2AB.byteLength} bytes total]`;
    console.log(`the key: again ${ciphertextValueAgain}`);
    console.log(String.fromCharCode.apply(null, new Uint8Array(back2AB)));
  }

  ab2str(buf): string {
    const asString =  String.fromCharCode.apply(null, new Uint8Array(buf));
    //const buffer = new Uint8Array(buf, 0, 5).toString();
    //return buffer;

    const arrStringCodes = Array();
    for (let i = 0; i < asString.length; i++) {
      const currentCode = asString.charCodeAt(i);
      arrStringCodes[i] = currentCode;
      //console.log(currentCode);
    }

    return arrStringCodes.toString();
  }

  str2ab(str: string) {
    let strArray = Array();
    strArray = str.split(',');
    const data = Uint8Array.from(strArray);
    return data.buffer;
  }

  async deriveKey(password) {
    // const derivedKey = await pbkdf2.pbkdf2(password, 'salt', 1, 32, 'sha512');
    const theSalt = 'something';
    const theHash = 'SHA-512';
    const keyLength = 32;
    const iterationsCount = 100;

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
