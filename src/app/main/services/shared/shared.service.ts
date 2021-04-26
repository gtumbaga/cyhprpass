import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public importedKey: CryptoKey;
  public titlesList: Array<any>;
  public currentEntryID: string;

  constructor() {
    this.titlesList = Array();
    this.currentEntryID = '';
  }

  public initTitlesList(data: any): void {
    this.titlesList = data;
  }

  public addToTitlesList(data: any): void {
    this.titlesList.push(data);
  }

  public updateToTitlesList(newData: any): void {
    const currentDocID = newData.id;
    const newTitlesList = this.titlesList.map((currentData) => {
      if (currentData.id === currentDocID) {
        return newData;
      } else {
        return currentData;
      }
    });
    this.titlesList = newTitlesList;
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
