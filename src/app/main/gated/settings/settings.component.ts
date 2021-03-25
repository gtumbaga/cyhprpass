import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { CryptoService } from '../../services/crypto/crypto.service';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterContentChecked {
  userPW: string;
  userPIN: string;

  constructor(private cryptoService: CryptoService, public sharedService: SharedService) {
    //
  }

  ngOnInit(): void {
  }

  ngAfterContentChecked(): void {
    this.sharedService.toggleHeader(true);
  }

  async btnClick(): Promise<void> {
    const theKeyBuff = await this.cryptoService.deriveKeyFromMasterString(this.userPW);
    const theKey = this.cryptoService.ab2str(theKeyBuff);
    const ciphertextValue = `${theKey}...[${theKeyBuff.byteLength} bytes total]`;
    console.log(`the key: ${ciphertextValue}`);
    console.log(String.fromCharCode.apply(null, new Uint8Array(theKeyBuff)));


    // now lets try to use the string and encrypt something...
    const stringToEncrypt = 'Gabe was here...';
    const gotEncrypted = await this.cryptoService.encryptMessage(theKeyBuff, stringToEncrypt);
    const gotEncrypted2string = this.cryptoService.ab2str(gotEncrypted);
    console.log(`${stringToEncrypt} has been encrypted to this: ${gotEncrypted2string}`);








    // now for testing, we will turn it back into an array buffer, then back to a string again, to see if it stays the same...
    //const back2AB = this.cryptoService.str2ab(theKey);
    //const theKeyAgain = this.cryptoService.ab2str(back2AB);
    //const ciphertextValueAgain = `${theKeyAgain}...[${back2AB.byteLength} bytes total]`;
    //console.log(`the key: again ${ciphertextValueAgain}`);
    //console.log(String.fromCharCode.apply(null, new Uint8Array(back2AB)));
  }

}
