import { Component } from '@angular/core';
import { SharedService } from './main/services/shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cyphrpass';

  constructor(public sharedService: SharedService) {
    //
  }
}
