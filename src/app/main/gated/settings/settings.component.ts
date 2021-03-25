import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../../services/crypto/crypto.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  currentPW: string;

  constructor(private cryptoService: CryptoService) {
    //
  }

  ngOnInit(): void {
  }

  async btnClick(): Promise<void> {
    const theKeyBuff = await this.cryptoService.deriveKeyFromMasterString(this.currentPW);
    const theKey = this.cryptoService.ab2str(theKeyBuff);
    const ciphertextValue = `${theKey}...[${theKeyBuff.byteLength} bytes total]`;
    console.log(`the key: ${ciphertextValue}`);
    console.log(String.fromCharCode.apply(null, new Uint8Array(theKeyBuff)));

    // now for testing, we will turn it back into an array buffer, then back to a string again, to see if it stays the same...
    const back2AB = this.cryptoService.str2ab(theKey);
    const theKeyAgain = this.cryptoService.ab2str(back2AB);
    const ciphertextValueAgain = `${theKeyAgain}...[${back2AB.byteLength} bytes total]`;
    console.log(`the key: again ${ciphertextValueAgain}`);
    console.log(String.fromCharCode.apply(null, new Uint8Array(back2AB)));
  }

}
