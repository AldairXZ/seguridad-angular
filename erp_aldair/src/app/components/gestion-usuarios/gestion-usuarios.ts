import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, CheckboxModule, DropdownModule, ToastModule],
  providers: [MessageService],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  grupos: any[] = [];

  displayEditDialog: boolean = false;
  displayPermsDialog: boolean = false;

  usuarioSeleccionado: any = {};
  grupoParaPermisos: any = null;

  permisosDisponibles = [
    { label: 'Ver Tickets', value: 'tickets:view' },
    { label: 'Agregar Tickets', value: 'tickets:add' },
    { label: 'Mover Tickets', value: 'tickets:move' },
    { label: 'Administrar Tickets', value: 'tickets:manage' },
    { label: 'Ver Grupos', value: 'group:view' },
    { label: 'Administrar Grupos', value: 'groups:manage' },
    { label: 'Administrar Usuarios', value: 'users:manage' }
  ];

  permisosSeleccionados: string[] = [];

  constructor(private http: HttpClient, private messageService: MessageService, private auth: AuthService) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarGrupos();
  }

  private getHeaders() {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_token='))?.split('=')[1];
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarUsuarios() {
    this.http.get<any>('http://localhost:3000/api/users', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.usuarios = res.data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar usuarios' })
    });
  }

  cargarGrupos() {
    this.http.get<any>('http://localhost:3000/api/groups', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.grupos = res.data
    });
  }

  abrirEdicion(usuario: any) {
    this.usuarioSeleccionado = { ...usuario };
    this.displayEditDialog = true;
  }

  abrirPermisos(usuario: any) {
    this.usuarioSeleccionado = { ...usuario };
    this.grupoParaPermisos = null;
    this.permisosSeleccionados = [];
    this.displayPermsDialog = true;
  }

  onGrupoChange() {
    if (this.grupoParaPermisos && this.usuarioSeleccionado.permisos) {
      this.permisosSeleccionados = this.usuarioSeleccionado.permisos[this.grupoParaPermisos.id] || [];
    }
  }

  guardarUsuario() {
    this.http.put<any>(`http://localhost:3000/api/users/${this.usuarioSeleccionado.id}`, this.usuarioSeleccionado, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.displayEditDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
      }
    });
  }

  guardarPermisos() {
    if (!this.grupoParaPermisos) return;

    const payload = {
      groupId: this.grupoParaPermisos.id.toString(),
      permisos: this.permisosSeleccionados
    };

    this.http.put<any>(`http://localhost:3000/api/users/${this.usuarioSeleccionado.id}/permissions`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.displayPermsDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Permisos actualizados' });
      }
    });
  }
}
