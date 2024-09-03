import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { genSalt, hash } from 'bcryptjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
})
export class RegisterPage {
  constructor(private http: HttpClient, private router: Router) {}
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
    this.detailsValid = false;
    genSalt(6)
      .then((salt) => hash(this.password, salt))
      .then((hashed) => {
        this.http
          .post('/api/account/register', {
            email: this.email,
            password: hashed,
            fullname: this.fullname,
            gender: this.gender,
          })
          .subscribe({
            error: (e) => {
              alert(e.error);
              this.section = 0;
              this.email = '';
              this.password = '';
              this.fullname = '';
              this.gender = ''
            },
            next: () => {
              this.router.navigateByUrl('/login');
            },
          });
      });
  }
}
