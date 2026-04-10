import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, RouterModule, CardModule, ButtonModule,
    AvatarModule, DividerModule, ToastModule, HasPermissionDirective
  ],
  providers: [MessageService],
  templateUrl: './user.html'
})
export class UserComponent implements OnInit {
  userData: any = {};

  constructor(private messageService: MessageService, public auth: AuthService) {}

  ngOnInit() {
    if (this.auth.usuarioActual) {
      this.userData = {
        ...this.auth.usuarioActual,
        telefono: 'N/A',
        direccion: 'N/A'
      };
    }
  }

  actualizarUsuario() {
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Tus datos de perfil han sido guardados' });
  }
}
