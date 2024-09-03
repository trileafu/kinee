import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    if (isPlatformBrowser(this._platformId)) {
      if (
        !localStorage.getItem('authToken') &&
        !sessionStorage.getItem('authToken')
      )
        this.router.navigate(['/login']);
      this.http
        .get('/api/account/me', {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('authToken')
            }`,
          },
        })
        .subscribe({
          error: (e) => {
            console.log(e);
          },
          next: (d: any) => {
            if (d.gender == 'male') this.pronoun = 'Tuan ';
            if (d.gender == 'female') this.pronoun = 'Nyonya ';
            this.fullname = d.fullname;
          },
        });
    }
  }
  pronoun = '';
  fullname = '';

  logout() {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    this.router.navigateByUrl("/login");
  }
}
