import { Component } from '@angular/core';
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

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    ToastModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent {
  usuarios: any[] = [
    { id: 1, nombre: 'Super Admin', email: 'super@admin.com', rol: 'superAdmin', permisos: ['group:view', 'group:edit', 'group:add', 'group:delete', 'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:delete', 'ticket:edit_state', 'user:view', 'users:view', 'user:edit', 'user:add', 'user:delete'] },
    { id: 2, nombre: 'Aldair', email: 'aldair@correo.com', rol: 'admin', permisos: ['group:view', 'group:edit', 'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:edit_state'] },
    { id: 3, nombre: 'Juan', email: 'juan@correo.com', rol: 'common', permisos: ['group:view', 'ticket:view', 'ticket:edit_state', 'user:view', 'user:edit'] }
  ];

  permisosDisponibles: string[] = [
    'group:view', 'group:edit', 'group:add', 'group:delete',
    'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:delete', 'ticket:edit_state',
    'user:view', 'users:view', 'user:edit', 'user:add', 'user:delete'
  ];

  usuarioDialog: boolean = false;
  usuarioActual: any = {};

  constructor(private messageService: MessageService) {}

  abrirNuevo() {
    this.usuarioActual = { permisos: [] };
    this.usuarioDialog = true;
  }

  editarUsuario(user: any) {
    this.usuarioActual = { ...user, permisos: [...user.permisos] };
    this.usuarioDialog = true;
  }

  eliminarUsuario(user: any) {
    this.usuarios = this.usuarios.filter(u => u.id !== user.id);
    this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario borrado permanentemente' });
  }

  guardarUsuario() {
    if (this.usuarioActual.nombre && this.usuarioActual.email) {
      if (this.usuarioActual.id) {
        const index = this.usuarios.findIndex(u => u.id === this.usuarioActual.id);
        this.usuarios[index] = this.usuarioActual;
      } else {
        this.usuarioActual.id = Date.now();
        this.usuarios.push(this.usuarioActual);
      }
      this.usuarios = [...this.usuarios];
      this.usuarioDialog = false;
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración de usuario actualizada' });
    }
  }
}
