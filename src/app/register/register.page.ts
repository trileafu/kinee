import { NgIf } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
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
  showErrors = false;
  detailsValid = false;
  emailValid = false;
  passwordValid = false;

  prevSection() {
    this.section--;
  }

  nextSection() {
    this.showErrors = true;
    if (this.emailValid && this.passwordValid) this.section++;
  }

  emailCheck() {
    this.emailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.email);
  }

  passwordCheck() {
    this.passwordValid =
      this.password.length > 8 &&
      /[a-z]/.test(this.password) &&
      /[A-Z]/.test(this.password) &&
      /[0-9]/.test(this.password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }

  detailsCheck() {
    this.detailsValid = this.fullname != '' && this.gender != '';
  }

  register() {
    alert(
      this.email +
        '\n' +
        this.password +
        '\n' +
        this.fullname +
        '\n' +
        this.gender
    );
  }
}
