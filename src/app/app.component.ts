import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from './main/services/shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cyphrpass';

  constructor(public sharedService: SharedService, public router: Router) {
    //
  }

  ngOnInit(): void {
    // this will ensure that on browser refresh / page reloads,
    // app redirects back to login screen again
    this.router.navigate(['']);
  }
}
