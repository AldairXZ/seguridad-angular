import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-vista-grupo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectButtonModule, TableModule,
    CardModule, TagModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, DragDropModule,
    ToastModule, HasPermissionDirective, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './vista-grupo.html'
})
export class VistaGrupoComponent implements OnInit {
  apiUrl = 'http://localhost:3000/api/tickets';

  vistaOpciones: any[] = [
    { icon: 'pi pi-objects-column', value: 'kanban' },
    { icon: 'pi pi-list', value: 'lista' }
  ];
  vistaActual: string = 'kanban';

  tickets: any[] = [];
  displayTicketDialog: boolean = false;
  ticketActual: any = {};
  draggedTicket: any;

  estados = ['Pendiente', 'En progreso', 'Revisión', 'Finalizado'];
  prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];

  groupId: number | null = null;
  groupName: string = '';

  constructor(public auth: AuthService, private http: HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    const savedGroupId = localStorage.getItem('erp_current_group');
    this.groupName = localStorage.getItem('erp_current_group_name') || 'Contexto General';

    if (savedGroupId) {
      this.groupId = parseInt(savedGroupId, 10);
      this.cargarTickets();
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No seleccionaste grupo. Mostrando todos.' });
      this.cargarTickets();
    }
  }

  private getHeaders() {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_token='))?.split('=')[1];
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    if (this.groupId !== null && this.groupId !== undefined) {
      headers = headers.set('x-group-id', this.groupId.toString());
    }

    return headers;
  }

  cargarTickets() {
    const url = this.groupId ? `${this.apiUrl}?groupId=${this.groupId}` : this.apiUrl;
    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
      next: (res) => this.tickets = res.data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets' })
    });
  }

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
    return this.esCreador(ticket) || this.auth.hasPermission('tickets:manage');
  }

  puedeEditarEstadoYComentarios(ticket: any): boolean {
    return this.esCreador(ticket) || this.esAsignado(ticket) || this.auth.hasPermission('tickets:manage') || this.auth.hasPermission('tickets:move');
  }

  abrirNuevoTicket() {
    if (!this.groupId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debes seleccionar un grupo en el Dashboard primero' });
      return;
    }

    this.ticketActual = {
      estadoActual: 'Pendiente',
      prioridad: 'Media',
      groupId: this.groupId
    };
    this.displayTicketDialog = true;
  }

  verDetalleTicket(ticket: any) {
    this.ticketActual = { ...ticket };
    this.displayTicketDialog = true;
  }

  guardarTicket() {
    if (this.ticketActual.titulo && this.ticketActual.estadoActual && this.ticketActual.prioridad && this.ticketActual.groupId) {
      if (this.ticketActual.id) {
        const index = this.tickets.findIndex(t => t.id === this.ticketActual.id);
        if (index !== -1) this.tickets[index] = this.ticketActual;
        this.displayTicketDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Modificación simulada localmente' });
      } else {
        this.http.post<any>(this.apiUrl, this.ticketActual, { headers: this.getHeaders() }).subscribe({
          next: (res) => {
            this.tickets.push(res.data[0]);
            this.displayTicketDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Ticket guardado en la base de datos' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.[0]?.message || 'No autorizado para crear' });
          }
        });
      }
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Faltan campos obligatorios o contexto de grupo' });
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

          this.http.patch<any>(`${this.apiUrl}/${this.draggedTicket.id}/status`, { estadoActual: estado }, { headers: this.getHeaders() }).subscribe({
            next: (res) => {
              this.tickets[index] = res.data[0];
              this.messageService.add({ severity: 'info', summary: 'Movido', detail: `Ticket movido a ${estado}` });
            },
            error: (err) => {
               this.messageService.add({ severity: 'error', summary: 'Acceso Denegado', detail: 'No tienes permisos para mover este ticket' });
            }
          });

        }
      }
      this.draggedTicket = null;
    }
  }

  dragEnd() {
    this.draggedTicket = null;
  }
}
