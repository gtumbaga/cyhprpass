import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  public currentEntry: any;

  constructor(public sharedService: SharedService, private authService: AuthService) { }

  ngOnInit(): void {
  }

  public async loadEntry(id: string): Promise<void> {
    console.log(`loading entry: ${id}`);

    const entryData = await this.authService.grabEntry(id);


    // show modal after we've set all the things in it.
    this.sharedService.currentEntryID = id;
    this.showModal();
  }

  public showModal(): void {
    document.getElementById('entryModal').classList.add('show');
  }

  public hideModal(): void {
    document.getElementById('entryModal').classList.remove('show');
  }

}
