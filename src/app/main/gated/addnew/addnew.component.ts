import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared/shared.service';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-addnew',
  templateUrl: './addnew.component.html',
  styleUrls: ['./addnew.component.scss']
})
export class AddnewComponent implements OnInit {
  public formFields: Array<any>;

  constructor(private authService: AuthService) {

    this.formFields = Array(
      {
        label: 'Title',
        data: '',
        privateText: false
      },
      {
        label: 'Username',
        data: '',
        privateText: false
      },
      {
        label: 'Password',
        data: '',
        privateText: true
      },
      {
        label: 'Authenticator Key (TOTP)',
        data: '',
        privateText: true
      },
      {
        label: 'Email',
        data: '',
        privateText: false
      },
      {
        label: 'URL',
        data: '',
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

  public saveEntry(): void {
    this.authService.saveEntry(this.formFields);
  }

}
