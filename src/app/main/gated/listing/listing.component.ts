import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';
import { CryptoService } from '../../services/crypto/crypto.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  public currentEntry: any;

  constructor(
    public sharedService: SharedService,
    private authService: AuthService,
    private cryptoService: CryptoService
  ) {
    this.currentEntry = {
      uid: '',
      payload: [
        {
          data: 'loading...',
            label: 'Title',
            privateText: false
        }
      ]
    };
  }

  ngOnInit(): void {
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
    document.getElementById('entryModal').classList.add('show');
  }

  public hideModal(): void {
    document.getElementById('entryModal').classList.remove('show');
  }

}
