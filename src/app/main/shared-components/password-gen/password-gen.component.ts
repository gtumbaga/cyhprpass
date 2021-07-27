import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-password-gen',
  templateUrl: './password-gen.component.html',
  styleUrls: ['./password-gen.component.scss']
})
export class PasswordGenComponent implements OnInit {
  @Input() generatedPW: string;
  @Output() generatedPWChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    // this is how to send string back to the bind where this component was called
    this.generatedPWChange.emit('fake password...');
  }


}
