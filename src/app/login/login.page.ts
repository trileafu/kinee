import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  constructor(private http: HttpClient, private router: Router) {}
  email = '';
  password = '';
  remember = false;
  login() {
    this.http
      .post('/api/account/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        error: (e) => {
          alert(e.error);
        },
        next: (d: any) => {
          this.remember
            ? localStorage.setItem('authToken', d.token)
            : sessionStorage.setItem('authToken', d.token);
          this.router.navigateByUrl('/');
        },
      });
  }
}
