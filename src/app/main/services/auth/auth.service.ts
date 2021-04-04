import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'firebase';
import { CryptoService } from '../crypto/crypto.service';
// @firebase/app


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore, public  router: Router, private cryptoService: CryptoService) {
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
  }

  async saveEntry(fields: Array<any>): Promise<any> {

    const payload: Array<any> = new Array();

    const  user  =  JSON.parse(localStorage.getItem('user'));


    // get title out of fields aray so we can save it to User doc
    const title = fields[0].data;

    const theKeyB64Str = localStorage.getItem('master-string-encoded');
    const importedKey = await this.cryptoService.JWK2CryptoKey(atob(theKeyB64Str));

    // iterate through each entry, and encrypt the ones that need to be.
    fields.forEach(async (entry) => {
      const myLabel = entry.label;
      const isPrivate = entry.privateText;

      let newData: string;

      if (isPrivate === true) {
        const theIV = this.cryptoService.generateRandomIV();

        const stringToEncrypt = entry.data;

        const gotEncrypted = await this.cryptoService.encryptMessage(importedKey, theIV, `${theKeyB64Str}${theKeyB64Str}`, stringToEncrypt);
        const gotEncrypted2string = this.cryptoService.ab2str(gotEncrypted);

        const cipherPayload = btoa(JSON.stringify({
          iv: this.cryptoService.ab2str(theIV),
          cipher: gotEncrypted2string
        }));

        newData = cipherPayload;
      } else {
        newData = entry.data;
      }

      payload.push(
        {
          label: myLabel,
          data: newData,
          privateText: isPrivate
        }
      );


    }); // foreach

    const newId = this.afs.createId();
    const saveResult = await this.afs.collection('entries').doc(newId).set({
      email: user.email,
      payload
    });

    console.log('saveResult');
    console.log(saveResult);

  } // saveEntry

} // AuthService
