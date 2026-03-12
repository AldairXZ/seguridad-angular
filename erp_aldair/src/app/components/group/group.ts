import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    RouterModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './group.html'
})
export class GroupComponent {
  grupos: any[] = [
    { id: 1, nombre: 'Proyecto Alpha', categoria: 'Desarrollo', nivel: 'Alto', autor: 'Aldair', miembros: 5, tickets: 12 },
    { id: 2, nombre: 'Soporte TI', categoria: 'Mantenimiento', nivel: 'Medio', autor: 'Juan', miembros: 3, tickets: 8 }
  ];

  grupoDialog: boolean = false;
  grupo: any = {};
  submitted: boolean = false;

  constructor(private messageService: MessageService, public auth: AuthService) {}

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
    this.grupos = this.grupos.filter(val => val.id !== g.id);
    this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Grupo borrado correctamente', life: 3000 });
  }

  ocultarDialogo() {
    this.grupoDialog = false;
    this.submitted = false;
  }

  guardarGrupo() {
    this.submitted = true;

    if (this.grupo.nombre?.trim()) {
      if (this.grupo.id) {
        this.grupos[this.grupos.findIndex(g => g.id === this.grupo.id)] = this.grupo;
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo modificado con éxito', life: 3000 });
      } else {
        this.grupo.id = this.grupos.length > 0 ? Math.max(...this.grupos.map(g => g.id)) + 1 : 1;
        this.grupos.push(this.grupo);
        this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Nuevo grupo registrado', life: 3000 });
      }

      this.grupos = [...this.grupos];
      this.grupoDialog = false;
      this.grupo = {};
    }
  }
}
