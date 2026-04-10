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

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    InputTextModule, DialogModule, CheckboxModule,
    ToastModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent implements OnInit {

  usuarios: any[] = [];

  permisosDisponibles: string[] = [
    'group:view', 'group:edit', 'group:add', 'group:delete',
    'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:delete', 'ticket:edit_state',
    'user:view', 'users:view', 'user:edit', 'user:add', 'user:delete'
  ];

  usuarioDialog: boolean = false;
  usuarioActual: any = {};

  constructor(private messageService: MessageService, public auth: AuthService) {}

  ngOnInit() {
    this.usuarios = JSON.parse(JSON.stringify(this.auth.usuariosDb));
  }

  abrirNuevo() {
    this.usuarioActual = { id: null, nombre: '', email: '', permisos: [], password: '123' };
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
    this.guardarEnServicio('Usuario borrado');
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
      this.guardarEnServicio('Configuración de usuario actualizada');
    }
  }

  guardarEnServicio(mensaje: string) {
    this.usuarios = [...this.usuarios];
    this.auth.usuariosDb = JSON.parse(JSON.stringify(this.usuarios));
    this.auth.guardarBaseDeDatos();

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: mensaje });
  }
}
