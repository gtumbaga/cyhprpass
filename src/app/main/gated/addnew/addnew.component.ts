import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-addnew',
  templateUrl: './addnew.component.html',
  styleUrls: ['./addnew.component.scss']
})
export class AddnewComponent implements OnInit {
  public formFields: Array<any>;

  constructor() {

    this.formFields = Array(
      {
        label: 'Title',
        data: 'asdf',
        privateText: false
      },
      {
        label: 'Password',
        data: 'asdf',
        private: true
      },
      {
        label: 'URL',
        data: 'asdf',
        privateText: false
      }
    );
  }

  ngOnInit(): void {
  }

  public addNewRow(): void {
    this.formFields.push(
      {
        label: '',
        data: '',
        privateText: false
      }
    );
  }

}
