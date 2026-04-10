import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    InputTextModule, DialogModule, CheckboxModule,
    ToastModule, TagModule, HasPermissionDirective
  ],
  providers: [MessageService],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  permisosDisponibles: string[] = [
    'group:view', 'group:add', 'group:edit', 'group:delete', 'group:manage',
    'ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete', 'ticket:edit:state', 'ticket:edit:comment', 'ticket:manage',
    'user:view', 'user:add', 'user:edit', 'user:edit:profile', 'user:delete', 'users:manage'
  ];
  usuarioDialog: boolean = false;
  usuarioActual: any = {};

  constructor(private messageService: MessageService, public auth: AuthService) {}

  ngOnInit() {
    this.usuarios = [
      { id: 1, nombre: 'Admin Master', email: 'admin@marher.com', permisos: this.permisosDisponibles },
      { id: 2, nombre: 'Project Manager', email: 'pm@marher.com', permisos: ['group:view', 'group:manage', 'ticket:view', 'ticket:add', 'ticket:manage'] },
      { id: 3, nombre: 'Desarrollador', email: 'dev@marher.com', permisos: ['ticket:view', 'ticket:edit', 'ticket:edit:state'] }
    ];
  }

  abrirNuevo() {
    this.usuarioActual = { id: null, nombre: '', email: '', permisos: [], password: '' };
    this.usuarioDialog = true;
  }

  editarUsuario(user: any) {
    this.usuarioActual = JSON.parse(JSON.stringify(user));
    if (!this.usuarioActual.permisos) {
      this.usuarioActual.permisos = [];
    }
    this.usuarioDialog = true;
  }

  eliminarUsuario(user: any) {
    this.usuarios = this.usuarios.filter(u => u.id !== user.id);
    this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'El usuario ha sido borrado del sistema' });
  }

  guardarUsuario() {
    if (this.usuarioActual.nombre && this.usuarioActual.email) {
      if (this.usuarioActual.id) {
        const index = this.usuarios.findIndex(u => u.id === this.usuarioActual.id);
        this.usuarios[index] = JSON.parse(JSON.stringify(this.usuarioActual));
      } else {
        this.usuarioActual.id = Date.now();
        this.usuarios.push(JSON.parse(JSON.stringify(this.usuarioActual)));
      }
      this.usuarioDialog = false;
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración de usuario actualizada' });
    }
  }
}
