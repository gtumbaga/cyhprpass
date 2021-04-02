import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public importedKey: CryptoKey;

  constructor() {
  }

  public async setMasterKey(importedKey: CryptoKey): Promise<void> {
    this.importedKey = importedKey;

  }
  public toggleHeader(choice: boolean): void {
    if (choice === true) {
      document.getElementById('header-holder').classList.add('show');
    } else {
      document.getElementById('header-holder').classList.remove('show');
    }
  }
}
