import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarModule, ButtonModule],
  templateUrl: './app.html'
})
export class AppComponent {
  sidebarVisible: boolean = false;
  projectName: string = 'erp_aldair_practica3';
  appVersion: string = '0.4';

  showMenu: boolean = false;
  rutaActual: string = 'Home';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      const hideRoutes = ['/login', '/register', '/home', '/'];
      this.showMenu = !hideRoutes.includes(url);

      if (url.includes('/dashboard')) {
        this.rutaActual = 'Home / Dashboard';
      } else if (url.includes('/user')) {
        this.rutaActual = 'Home / User';
      } else if (url.includes('/group')) {
        this.rutaActual = 'Home / Group';
      } else if (url.includes('/vista-grupo')) {
        this.rutaActual = 'Home / Group / Ticket';
      } else {
        this.rutaActual = 'Home';
      }
    });
  }
}
