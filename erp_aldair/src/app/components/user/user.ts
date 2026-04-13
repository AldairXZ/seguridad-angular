import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    DividerModule,
    TooltipModule
  ],
  templateUrl: './user.html'
})
export class UserComponent implements OnInit {
  usuario: any = null;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Obtenemos los datos directamente del servicio de autenticación
    this.usuario = this.auth.usuarioActual;
  }

  logout() {
    this.auth.logout();
  }

  // Función para dar formato visual a los strings de permisos
  formatPerm(perm: string): string {
    return perm.replace(':', ' ').toUpperCase();
  }
}
