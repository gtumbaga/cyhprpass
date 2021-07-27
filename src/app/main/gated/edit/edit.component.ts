import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';
import { CryptoService } from '../../services/crypto/crypto.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  public docID: string;
  public formFields: Array<any>;
  public generatePassword: string;

  constructor(
    private route: ActivatedRoute,
    public sharedService: SharedService,
    private authService: AuthService,
    private cryptoService: CryptoService,

  ) {
    this.formFields = Array(
      {
        label: 'Title',
        data: '',
        privateText: false
      }
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.docID = params.id;
      console.log(`page will load docID: ${this.docID}`);

      this.loadEntry(this.docID)
      .then(() => {
        //
      })
      .catch((err) => {
        console.log(`An error occured while trying to load the entry: ${err}`);
      });
   });
  }

  private async loadEntry(id: string): Promise<void> {
    console.log(`loading entry: ${id}`);

    const entryGrabResults = await this.authService.grabEntry(id);

    // iterate and decipher passwords back to useable text
    const theKeyB64Str = localStorage.getItem('master-string-encoded');
    const importedKey = await this.cryptoService.JWK2CryptoKey(atob(theKeyB64Str));

    // iterate through each entry, and encrypt the ones that need to be.
    const promiseArr = entryGrabResults.payload.map(async (entry) => {

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
      this.formFields = resultsArray;

      // show modal after we've set all the things in it.
      this.sharedService.currentEntryID = id;

    }).catch((err) => {
      // do something when any of the promises in array are rejected
      console.log(`An error occured looping over private text: ${err}`);
    });


  }

  public saveEntry(): void {
    this.authService.saveEditedEntry(this.docID, this.formFields);
  }

  public addNewRow(): void {
    this.formFields.push(
      {
        label: '',
        data: '',
        privateText: false
      }
    );
  }

  public removeField(index): void {
    this.formFields.splice(index, 1);
  }

  public async deleteThisEntry(): Promise<void> {
    await this.authService.deleteEntry(this.docID);
  }

  public useGeneratedPW(): void {
    //
  }
}
