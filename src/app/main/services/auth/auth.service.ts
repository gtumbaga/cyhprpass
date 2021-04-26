import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'firebase';
import { CryptoService } from '../crypto/crypto.service';
import { SharedService } from '../shared/shared.service';
// @firebase/app


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public  router: Router,
    private cryptoService: CryptoService,
    public sharedService: SharedService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    }); // afAuth.authState.subscribe
  } // constructor

  async checkIfUserDocumentExists(uid: string): Promise<boolean> {

    const userDocExists = await this.afs.collection('users').doc(uid).ref.get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const myData = docSnapshot.data();
        console.log(myData);
        this.sharedService.initTitlesList(myData.entryTitles);

        return true;
      } else {
        return false;
      }
    }).catch(err => {
      console.log(`error: ${err}`);
      return false;
    });

    // console.log(`userDocExists: ${userDocExists}`);

    return userDocExists;
  } // checkIfUserDocumentExists

  async createInitialUserDocument(uid: string, userEmail: string): Promise<void> {
    const result = await this.afs.collection('users').doc(uid).set({
      email: userEmail,
      entryTitles: {}
    });

    return result;
  } // createInitialUserDocument

  get isLoggedIn(): boolean {
    const  user  =  JSON.parse(localStorage.getItem('user'));
    return  user  !==  null;
  } // isLoggedIn

  checkMasterStringExists(): boolean {
    if (localStorage.getItem('master-string-encoded') === null) {
      return false;
    } else {
      return true;
    }
  }

  async loginWithGoogle(): Promise<boolean>{
    try {
      const loginResults = await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());

      console.log(loginResults.user.uid);

      if (await this.checkIfUserDocumentExists(loginResults.user.uid) === false) {
        await this.createInitialUserDocument(loginResults.user.uid, loginResults.user.email);
      }

      return true;

    } catch (err) {
      console.log(`Unable to log in with google account, due this this error: ${err}`);
      return false;
    }
  } // loginWithGoogle

  async saveEntry(fields: Array<any>): Promise<any> {

    const payload: Array<any> = new Array();

    const  user  =  JSON.parse(localStorage.getItem('user'));


    // get title out of fields aray so we can save it to User doc
    const title = fields[0].data;

    const theKeyB64Str = localStorage.getItem('master-string-encoded');
    const importedKey = await this.cryptoService.JWK2CryptoKey(atob(theKeyB64Str));

    // iterate through each entry, and encrypt the ones that need to be.
    const promiseArr = fields.map(async (entry) => {
      const myLabel = entry.label;
      const isPrivate = entry.privateText;

      if (isPrivate === true) {
        const theIV = this.cryptoService.generateRandomIV();

        const stringToEncrypt = entry.data;

        const gotEncrypted = await this.cryptoService.encryptMessage(importedKey, theIV, `${theKeyB64Str}${theKeyB64Str}`, stringToEncrypt);
        const gotEncrypted2string = this.cryptoService.ab2str(gotEncrypted);

        const cipherPayload = btoa(JSON.stringify({
          iv: this.cryptoService.ab2str(theIV),
          cipher: gotEncrypted2string
        }));

        console.log(cipherPayload);
        return {
          label: myLabel,
          data: cipherPayload,
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
      const newId = this.afs.createId();
      console.log('payload:');
      console.log(resultsArray);
      const saveResult = await this.afs.collection('entries').doc(newId).set({
        uid: user.uid,
        payload: resultsArray
      });

      this.sharedService.addToTitlesList(
        {
          id: newId,
          title,
          username: resultsArray[1].data
        }
      );

      this.saveTitlesListDB();

      this.router.navigate(['/listing']);


    }).catch((err) => {
      // do something when any of the promises in array are rejected
      console.log(`An error occured looping over private text: ${err}`);

    });


  } // saveEntry

  async saveEditedEntry(docID: string, fields: Array<any>): Promise<any> {

    const payload: Array<any> = new Array();

    const  user  =  JSON.parse(localStorage.getItem('user'));


    // get title out of fields aray so we can save it to User doc
    const title = fields[0].data;

    const theKeyB64Str = localStorage.getItem('master-string-encoded');
    const importedKey = await this.cryptoService.JWK2CryptoKey(atob(theKeyB64Str));

    // iterate through each entry, and encrypt the ones that need to be.
    const promiseArr = fields.map(async (entry) => {
      const myLabel = entry.label;
      const isPrivate = entry.privateText;

      if (isPrivate === true) {
        const theIV = this.cryptoService.generateRandomIV();

        const stringToEncrypt = entry.data;

        const gotEncrypted = await this.cryptoService.encryptMessage(importedKey, theIV, `${theKeyB64Str}${theKeyB64Str}`, stringToEncrypt);
        const gotEncrypted2string = this.cryptoService.ab2str(gotEncrypted);

        const cipherPayload = btoa(JSON.stringify({
          iv: this.cryptoService.ab2str(theIV),
          cipher: gotEncrypted2string
        }));

        console.log(cipherPayload);
        return {
          label: myLabel,
          data: cipherPayload,
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
      //const newId = this.afs.createId();
      //console.log('payload:');
      //console.log(resultsArray);
      const saveResult = await this.afs.collection('entries').doc(docID).set({
        uid: user.uid,
        payload: resultsArray
      });

      this.sharedService.updateToTitlesList(
        {
          id: docID,
          title,
          username: resultsArray[1].data
        }
      );

      this.saveTitlesListDB();

      this.router.navigate(['/listing']);


    }).catch((err) => {
      // do something when any of the promises in array are rejected
      console.log(`An error occured looping over private text: ${err}`);

    });


  } // saveEditedEntry

  public async saveTitlesListDB(): Promise<void> {
    // const  user  =  JSON.parse(localStorage.getItem('user'));
    const user = this.user;
    await this.afs.collection('users').doc(user.uid).update(
      { entryTitles: this.sharedService.titlesList }
    );
  }

  public async grabEntry(id: string): Promise<any> {
    const userInfo = await this.afs.collection('entries').doc(id).ref.get()
    .then((results) => {
      return results.data();
    })
    .catch((err) => {
      console.log(`Error trying to get entry data: ${err}`);
    });
    return userInfo;
  }

} // AuthService
