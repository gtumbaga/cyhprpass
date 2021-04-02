import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'firebase';
// @firebase/app


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore, public  router: Router) {
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
        //this.router.navigate(['listing/settings']);
      }

      return true;

    } catch (err) {
      console.log(`Unable to log in with google account, due this this error: ${err}`);
      return false;
    }
  }


} // AuthService
