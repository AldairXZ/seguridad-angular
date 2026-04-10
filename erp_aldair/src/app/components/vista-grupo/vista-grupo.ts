import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import { AuthService } from '../../services/auth';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-vista-grupo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectButtonModule, TableModule,
    CardModule, TagModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, DragDropModule, HasPermissionDirective
  ],
  templateUrl: './vista-grupo.html'
})
export class VistaGrupoComponent {
  vistaOpciones: any[] = [
    { icon: 'pi pi-objects-column', value: 'kanban' },
    { icon: 'pi pi-list', value: 'lista' }
  ];
  vistaActual: string = 'kanban';

  tickets: any[] = [
    { id: 1, titulo: 'Diseño de Base de Datos', descripcion: 'Crear esquema', estadoActual: 'En progreso', autor: 'admin@marher.com', asignadoA: 'dev@marher.com', prioridad: 'Alta', fechaCreacion: '2026-03-01', fechaLimite: '2026-03-10', comentarios: 'Revisar normalización', historialCambios: 'Pendiente -> En progreso' },
    { id: 2, titulo: 'Crear Landing Page', descripcion: 'Maquetar página', estadoActual: 'Finalizado', autor: 'dev@marher.com', asignadoA: 'support@marher.com', prioridad: 'Media', fechaCreacion: '2026-03-02', fechaLimite: '2026-03-05', comentarios: 'Aprobado', historialCambios: 'En progreso -> Finalizado' },
    { id: 3, titulo: 'Configurar Servidor', descripcion: 'AWS Setup', estadoActual: 'Pendiente', autor: 'pm@marher.com', asignadoA: 'dev@marher.com', prioridad: 'Urgente', fechaCreacion: '2026-03-12', fechaLimite: '2026-03-20', comentarios: '', historialCambios: 'Creado' }
  ];

  displayTicketDialog: boolean = false;
  ticketActual: any = {};
  draggedTicket: any;

  estados = ['Pendiente', 'En progreso', 'Revisión', 'Finalizado'];
  prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];

  constructor(public auth: AuthService) {}

  get usuarioLogueado() {
    return this.auth.usuarioActual?.email || '';
  }

  esCreador(ticket: any): boolean {
    return ticket.autor === this.usuarioLogueado;
  }

  esAsignado(ticket: any): boolean {
    return ticket.asignadoA === this.usuarioLogueado;
  }

  puedeEditarCamposBase(ticket: any): boolean {
    return this.esCreador(ticket) || this.auth.hasPermission('ticket:edit');
  }

  puedeEditarEstadoYComentarios(ticket: any): boolean {
    return this.esCreador(ticket) || this.esAsignado(ticket) || this.auth.hasPermission('ticket:edit') || this.auth.hasPermission('ticket:edit:state');
  }

  abrirNuevoTicket() {
    this.ticketActual = {
      id: Date.now(),
      estadoActual: 'Pendiente',
      autor: this.usuarioLogueado,
      fechaCreacion: new Date().toISOString().split('T')[0],
      historialCambios: 'Ticket Creado'
    };
    this.displayTicketDialog = true;
  }

  verDetalleTicket(ticket: any) {
    this.ticketActual = { ...ticket };
    this.displayTicketDialog = true;
  }

  guardarTicket() {
    if (this.ticketActual.titulo) {
      const index = this.tickets.findIndex(t => t.id === this.ticketActual.id);
      if (index !== -1) {
        this.tickets[index] = this.ticketActual;
      } else {
        this.tickets.push(this.ticketActual);
      }
      this.displayTicketDialog = false;
      this.tickets = [...this.tickets];
    }
  }

  getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (estado) {
      case 'Finalizado': return 'success';
      case 'En progreso': return 'info';
      case 'Revisión': return 'warning';
      default: return 'secondary';
    }
  }

  getTicketsByEstado(estado: string) {
    return this.tickets.filter(t => t.estadoActual === estado);
  }

  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  drop(event: any, estado: string) {
    if (this.draggedTicket) {
      const index = this.tickets.findIndex(t => t.id === this.draggedTicket.id);
      if (index !== -1 && this.tickets[index].estadoActual !== estado) {
        if (this.puedeEditarEstadoYComentarios(this.tickets[index])) {
          this.tickets[index].historialCambios = `${this.tickets[index].historialCambios}\n${this.tickets[index].estadoActual} -> ${estado}`;
          this.tickets[index].estadoActual = estado;
          this.tickets = [...this.tickets];
        }
      }
      this.draggedTicket = null;
    }
  }

  dragEnd() {
    this.draggedTicket = null;
  }
}
