import { Component, OnInit, OnDestroy } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';
import { CryptoService } from '../../services/crypto/crypto.service';
//import { jsotp } from '../../../../../node_modules/jsotp/lib/jsotp.js';
import * as jsotp from 'jsotp';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit, OnDestroy {
  public currentEntry: any;
  private myInterval: any;
  public currentTotpProgress: number;
  public currentTotpCode: string;

  constructor(
    public sharedService: SharedService,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private clipboard: Clipboard
  ) {
    this.clearCurrentEntry();
    this.currentTotpProgress = 0;

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  private clearCurrentEntry(): void {
    this.currentEntry = {
      uid: '',
      payload: [
        {
          data: '',
            label: '',
            privateText: false
        }
      ]
    };
  }
  public async loadEntry(id: string): Promise<void> {
    console.log(`loading entry: ${id}`);

    const entryGrabResults = await this.authService.grabEntry(id);

    // iterate and decipher passwords back to useable text
    const theKeyB64Str = localStorage.getItem('master-string-encoded');
    const importedKey = await this.cryptoService.JWK2CryptoKey(atob(theKeyB64Str));

    // iterate through each entry, and encrypt the ones that need to be.
    const promiseArr = entryGrabResults.payload.map(async (entry) => {

      //const tmpJSON = atob(entry.payload);
      //const cipherPayload = JSON.parse(tmpJSON);



      const myLabel = entry.label;
      const isPrivate = entry.privateText;

      if (isPrivate === true) {

        const gotDecrypted = await this.cryptoService.decryptMessage(importedKey, `${theKeyB64Str}${theKeyB64Str}`, entry.data );

        return {
          label: myLabel,
          data: gotDecrypted,
          privateText: isPrivate
        };
      } else {
        return {
          label: myLabel,
          data: entry.data,
          privateText: isPrivate
        };
      }

    }); // map

    Promise.all(promiseArr).then(async (resultsArray) => {
      //console.log('payload:');
      //console.log(resultsArray);
      entryGrabResults.payload = resultsArray;
      this.currentEntry = {
        uid: entryGrabResults.uid,
        payload: resultsArray
      };

      // show modal after we've set all the things in it.
      this.sharedService.currentEntryID = id;
      this.showModal();

    }).catch((err) => {
      // do something when any of the promises in array are rejected
      console.log(`An error occured looping over private text: ${err}`);
    });


  }

  public showModal(): void {
    this.myInterval = setInterval(() => {
    this.totpProgressBar();
    }, 300);
  }

  public hideModal(): void {
    clearInterval(this.myInterval);
    this.clearCurrentEntry();
  }

  private totpProgressBar(): void {
    const d = new Date();
    const seconds = d.getSeconds();

    // check if seconds is higher than 30
    // split 0-60 to two groups of 1-30 and 1-30
    const netSeconds = ((seconds + 1) > 30) ? (seconds - 30) : seconds;
    // calculate into a percentage
    const calculatedProgress =  Math.ceil(( (netSeconds + 1) / 30) * 100);
    // we will adjust any percentage under 7 to be 0, so that the progress bar properly looks like it reset.
    const adjustedProgress = (calculatedProgress < 7) ? 0 : calculatedProgress;

    if (this.currentTotpProgress !== adjustedProgress) {
      this.currentTotpProgress = adjustedProgress;
      document.getElementById('totpProgressBar').style.width = `${this.currentTotpProgress}%`;
      // console.log(this.currentTotpProgress);
      // now lets also calculate the totp.
      const totpSecret = this.getKeyFromInput(this.currentEntry.payload[3].data);
      try {
        const totp = jsotp.TOTP(totpSecret);
        this.currentTotpCode = totp.now();
      } catch (err) {
        console.log(`error occurred trying to get totp from your secret. ${err}`);
        this.currentTotpCode = `error. Probably bad key.`;
      }
    }


  }

  private getKeyFromInput(theInput: string): string {
  // first, lets remove the spaces
  const currentKey = theInput.replace(/\s/g, '');

  // console.log(`currentKey: ${currentKey}`);

  if (currentKey.startsWith('otpauth://')) {
    // we will need to retrieve just the key out of the entire string
    const tmpSplit = theInput.split('?');
    const queryString = `?${tmpSplit[1]}`;
    const urlParams = new URLSearchParams(queryString);

    let otpKey = urlParams.get('secret');

    if (otpKey.length > 8 && otpKey.length < 56) {
      // we will keep adding A's to the end until its 64 length
      while (otpKey.length < 56) {
        otpKey = `${otpKey}A`;
      } // while
      console.log(otpKey);
      return otpKey;
    } // if otpKey.length
  } else {
    return currentKey;
  }
} // getKeyFromInput


  public copyData(index: number): void {
    const dataToCopy = this.currentEntry.payload[index].data;
    this.clipboard.copy(dataToCopy);
    console.log(`this is meant to copy index ${index} to the clipboard`);

    const myItem = document.getElementById(`group-item-${index}`);
    myItem.classList.add('highlight');
    setTimeout(() =>{ myItem.classList.remove('highlight'); }, 100);
  }

}
