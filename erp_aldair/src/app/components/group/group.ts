import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../services/auth';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    InputTextModule, DialogModule, ToastModule, RouterModule,
    TagModule, HasPermissionDirective
  ],
  providers: [MessageService],
  templateUrl: './group.html'
})
export class GroupComponent implements OnInit {
  apiUrl = 'http://localhost:3000/api/groups';
  grupos: any[] = [];
  grupoDialog: boolean = false;
  grupo: any = {};
  submitted: boolean = false;

  constructor(private messageService: MessageService, public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.cargarGrupos();
  }

  private getHeaders() {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_token='))?.split('=')[1];
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarGrupos() {
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => this.grupos = res.data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos' })
    });
  }

  abrirNuevo() {
    this.grupo = {};
    this.submitted = false;
    this.grupoDialog = true;
  }

  editarGrupo(g: any) {
    this.grupo = { ...g };
    this.grupoDialog = true;
  }

  eliminarGrupo(g: any) {
    this.http.delete(`${this.apiUrl}/${g.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.grupos = this.grupos.filter(val => val.id !== g.id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Grupo borrado de la base de datos' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Bloqueado', detail: 'No tienes permiso para borrar grupos' })
    });
  }

  ocultarDialogo() {
    this.grupoDialog = false;
    this.submitted = false;
  }

  guardarGrupo() {
    this.submitted = true;

    if (this.grupo.nombre?.trim()) {
      if (this.grupo.id) {
        this.http.put<any>(`${this.apiUrl}/${this.grupo.id}`, this.grupo, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            const index = this.grupos.findIndex(g => g.id === this.grupo.id);
            this.grupos[index] = res.data[0];
            this.grupoDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo modificado en servidor' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Bloqueado', detail: 'Permisos insuficientes' })
        });
      } else {
        this.http.post<any>(this.apiUrl, this.grupo, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            this.grupos.push(res.data[0]);
            this.grupoDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Grupo sincronizado con servidor' });
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.[0]?.message || 'Permisos insuficientes' })
        });
      }
    }
  }
}
