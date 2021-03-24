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
    console.log(`the key: ${theKey}`);
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
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
