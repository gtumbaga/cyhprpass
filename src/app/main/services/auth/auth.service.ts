import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
// @firebase/app


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(public afAuth: AngularFireAuth, public  router: Router) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    }); // afAuth.authState.subscribe
  } // constructor

  //async login(email: string, password: string) {
    //const result = await this.afAuth.signInWithEmailAndPassword(email, password);
    //this.router.navigate(['admin/list']);
  //} // login

  //async register(email: string, password: string) {
    //const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
    //this.sendEmailVerification();
  //} // register

  //async sendEmailVerification() {
    //await this.afAuth.currentUser.sendEmailVerification();
    //this.router.navigate(['admin/verify-email']);
  //} // sendEmailVerification

  //async sendPasswordResetEmail(passwordResetEmail: string) {
    //return await this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  //} // sendPasswordResetEmail

  get isLoggedIn(): boolean {
    const  user  =  JSON.parse(localStorage.getItem('user'));
    return  user  !==  null;
  } // isLoggedIn

  async loginWithGoogle(): Promise<void>{
    await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    this.router.navigate(['listing']);
  }


} // AuthService
