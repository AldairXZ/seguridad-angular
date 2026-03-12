import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TableModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './user.html'
})
export class UserComponent {
  userData = {
    usuario: 'pepe_pepenador',
    nombreCompleto: 'Pepe el que pepena',
    email: 'admin@correo.com',
    telefono: '4421234567',
    fechaNacimiento: '15/08/2000',
    direccion: 'Av. Universidad 123, Santiago de Querétaro, Qro.'
  };

  ticketsUsuario = [
    { titulo: 'Actualizar dependencias', estado: 'Pendiente', prioridad: 'Media', fecha: '2026-03-15' },
    { titulo: 'Diseño de Base de Datos', estado: 'En progreso', prioridad: 'Alta', fecha: '2026-03-10' },
    { titulo: 'Optimizar consultas', estado: 'Finalizado', prioridad: 'Baja', fecha: '2026-03-01' },
    { titulo: 'Maquetar vistas faltantes', estado: 'En progreso', prioridad: 'Alta', fecha: '2026-03-18' }
  ];

  constructor(private messageService: MessageService) {}

  get stats() {
    return {
      pendientes: this.ticketsUsuario.filter(t => t.estado === 'Pendiente').length,
      progreso: this.ticketsUsuario.filter(t => t.estado === 'En progreso').length,
      hechos: this.ticketsUsuario.filter(t => t.estado === 'Finalizado').length
    };
  }

  getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (estado) {
      case 'Finalizado': return 'success';
      case 'En progreso': return 'info';
      case 'Pendiente': return 'warning';
      default: return 'secondary';
    }
  }

  actualizarUsuario() {
    try {
      this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Datos actualizados con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los cambios' });
    }
  }

  eliminarCuenta() {
    this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'La cuenta ha sido desactivada del sistema' });
  }
}
