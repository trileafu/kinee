import { isPlatformBrowser } from '@angular/common';
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
    public router: Router
  ) {
    if (isPlatformBrowser(_platformId))
      if (!localStorage.getItem('authToken')) router.navigate(['/login']);
  }
}
