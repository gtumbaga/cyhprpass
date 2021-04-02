import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared/shared.service';
import { CryptoService } from '../services/crypto/crypto.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private authService: AuthService,
    private cryptoService: CryptoService
  ) { }

  ngOnInit(): void {
  }

  logUserIn(): void {
    // will hit the login service
    const loginSuccess = true;

    if (loginSuccess) {
      // redirect to listing
      this.sharedService.toggleHeader(true);
      this.router.navigate(['listing']);

    } else {
      // show bad password message
    }
  }

  async loginWithGoogle(): Promise<void> {
    const loginSuccess = await this.authService.loginWithGoogle();

    if (loginSuccess) {
      // redirect to listing
      this.sharedService.toggleHeader(true);
      const masterStringExists = this.authService.checkMasterStringExists();
      if (masterStringExists) {
        const masterb64 = localStorage.getItem('master-string-encoded');
        const theKeyBroughtBackStr = atob(masterb64);
        this.sharedService.setMasterKey(await this.cryptoService.JWK2CryptoKey(theKeyBroughtBackStr));
        this.router.navigate(['listing']);
      } else {
        this.router.navigate(['listing/settings']);
      }

    } else {
      // show bad password message
    }
  }

}
