import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
})
export class RegisterPage {
  section = 0;
  email = '';
  password = '';
  fullname = '';
  gender = '';
  prevSection() {
    this.section--;
  }
  nextSection() {
    this.section++;
  }
  register() {
    alert(this.email + '\n' + this.password);
  }
}
