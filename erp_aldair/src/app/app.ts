import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './services/auth';
import { HasPermissionDirective } from './directives/has-permission.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarModule, ButtonModule, HasPermissionDirective],
  templateUrl: './app.html'
})
export class AppComponent {
  sidebarVisible: boolean = false;

  constructor(public auth: AuthService, private router: Router) {}

  get mostrarMenu(): boolean {
    const rutasOcultas = ['/login', '/register', '/home'];
    const rutaActual = this.router.url.split('?')[0];
    return !rutasOcultas.includes(rutaActual) && this.auth.usuarioActual !== null;
  }
}
