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

@Component({
  selector: 'app-vista-grupo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectButtonModule, TableModule,
    CardModule, TagModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, DragDropModule
  ],
  templateUrl: './vista-grupo.html'
})
export class VistaGrupoComponent {
  vistaOpciones: any[] = [
    { icon: 'pi pi-objects-column', value: 'kanban' },
    { icon: 'pi pi-list', value: 'lista' }
  ];
  vistaActual: string = 'kanban';
  filtroActual: string | null = null;
  usuarioLogueado: string = 'Aldair';

  tickets: any[] = [
    { titulo: 'Diseño de Base de Datos', descripcion: 'Crear esquema', estadoActual: 'En progreso', autor: 'Juan', asignadoA: 'Aldair', prioridad: 'Alta', fechaCreacion: '2026-03-01', fechaLimite: '2026-03-10', comentarios: 'Revisar normalización', historialCambios: 'Pendiente -> En progreso' },
    { titulo: 'Crear Landing Page', descripcion: 'Maquetar página', estadoActual: 'Finalizado', autor: 'Aldair', asignadoA: 'Juan', prioridad: 'Media', fechaCreacion: '2026-03-02', fechaLimite: '2026-03-05', comentarios: 'Aprobado', historialCambios: 'En progreso -> Finalizado' },
    { titulo: 'Configurar Servidor', descripcion: 'AWS Setup', estadoActual: 'Pendiente', autor: 'Aldair', asignadoA: '', prioridad: 'Urgente', fechaCreacion: '2026-03-12', fechaLimite: '2026-03-20', comentarios: '', historialCambios: 'Creado' }
  ];

  displayTicketDialog: boolean = false;
  displayMiembrosDialog: boolean = false;
  ticketActual: any = {};
  draggedTicket: any;

  estados = ['Pendiente', 'En progreso', 'Revisión', 'Finalizado'];
  prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];

  miembros: any[] = [
    { id: 1, email: 'admin@correo.com' },
    { id: 2, email: 'juan.dev@correo.com' }
  ];
  nuevoMiembroEmail: string = '';

  constructor(public auth: AuthService) {}

  esCreador(ticket: any): boolean {
    return ticket.autor === this.usuarioLogueado;
  }

  esAsignado(ticket: any): boolean {
    return ticket.asignadoA === this.usuarioLogueado;
  }

  puedeEditarCamposBase(ticket: any): boolean {
    return this.esCreador(ticket) || this.auth.role === 'admin' || this.auth.role === 'superAdmin';
  }

  puedeEditarEstadoYComentarios(ticket: any): boolean {
    return this.esCreador(ticket) || this.esAsignado(ticket) || this.auth.role === 'admin' || this.auth.role === 'superAdmin';
  }

  abrirNuevoTicket() {
    this.ticketActual = {
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
      const index = this.tickets.findIndex(t => t.titulo === this.ticketActual.titulo);
      if (index !== -1) {
        this.tickets[index] = this.ticketActual;
      } else {
        this.tickets.push(this.ticketActual);
      }
      this.displayTicketDialog = false;
      this.tickets = [...this.tickets];
    }
  }

  abrirGestionMiembros() {
    this.displayMiembrosDialog = true;
  }

  agregarMiembro() {
    if (this.nuevoMiembroEmail.trim()) {
      this.miembros.push({ id: Date.now(), email: this.nuevoMiembroEmail });
      this.nuevoMiembroEmail = '';
    }
  }

  eliminarMiembro(id: number) {
    this.miembros = this.miembros.filter(m => m.id !== id);
  }

  getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (estado) {
      case 'Finalizado': return 'success';
      case 'En progreso': return 'info';
      case 'Revisión': return 'warning';
      default: return 'secondary';
    }
  }

  aplicarFiltro(filtro: string | null) {
    this.filtroActual = this.filtroActual === filtro ? null : filtro;
  }

  get ticketsFiltrados() {
    let filtrados = this.tickets;
    if (this.filtroActual === 'mis_tickets') {
      filtrados = filtrados.filter(t => t.asignadoA === this.usuarioLogueado);
    } else if (this.filtroActual === 'sin_asignar') {
      filtrados = filtrados.filter(t => !t.asignadoA || t.asignadoA.trim() === '');
    } else if (this.filtroActual === 'prioridad_alta') {
      filtrados = filtrados.filter(t => t.prioridad === 'Alta' || t.prioridad === 'Urgente');
    }
    return filtrados;
  }

  getTicketsByEstado(estado: string) {
    return this.ticketsFiltrados.filter(t => t.estadoActual === estado);
  }

  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  drop(event: any, estado: string) {
    if (this.draggedTicket) {
      const index = this.tickets.findIndex(t => t.titulo === this.draggedTicket.titulo);
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
