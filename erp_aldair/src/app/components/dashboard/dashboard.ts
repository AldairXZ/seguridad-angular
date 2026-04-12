import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardModule, ButtonModule, TagModule, ChartModule, DropdownModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  totalTickets: number = 0;

  estadisticas: any[] = [
    { estado: 'Pendiente', cantidad: 0, color: 'danger' },
    { estado: 'En progreso', cantidad: 0, color: 'info' },
    { estado: 'Revisión', cantidad: 0, color: 'warning' },
    { estado: 'Finalizado', cantidad: 0, color: 'success' }
  ];

  pieData: any;
  pieOptions: any;
  barData: any;
  barOptions: any;

  grupos: any[] = [];
  grupoSeleccionado: any = null;
  todosLosTickets: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private getHeaders() {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_token='))?.split('=')[1];
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarDatosIniciales() {
    // 1. Cargar Grupos para el Selector
    this.http.get<any>('http://localhost:3000/api/groups', { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.grupos = res.data;
        this.grupos.unshift({ id: 0, nombre: 'Todos los Grupos' });
        this.grupoSeleccionado = this.grupos[0];
      }
    });

    this.http.get<any>('http://localhost:3000/api/tickets', { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.todosLosTickets = res.data;
        this.procesarTickets(this.todosLosTickets);
      }
    });
  }

  procesarTickets(ticketsAProcesar: any[]) {
    this.totalTickets = ticketsAProcesar.length;

    const contadores = {
      'Pendiente': 0, 'En progreso': 0, 'Revisión': 0, 'Finalizado': 0
    };

    ticketsAProcesar.forEach((t: any) => {
      const estado = t.estadoActual as keyof typeof contadores;
      if (contadores[estado] !== undefined) {
        contadores[estado]++;
      }
    });

    this.estadisticas[0].cantidad = contadores['Pendiente'];
    this.estadisticas[1].cantidad = contadores['En progreso'];
    this.estadisticas[2].cantidad = contadores['Revisión'];
    this.estadisticas[3].cantidad = contadores['Finalizado'];

    this.actualizarGraficos(contadores);
  }

  actualizarGraficos(contadores: any) {
    this.pieData = {
      labels: ['Pendiente', 'En Progreso', 'Revisión', 'Finalizado'],
      datasets: [
        {
          data: [contadores['Pendiente'], contadores['En progreso'], contadores['Revisión'], contadores['Finalizado']],
          backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e']
        }
      ]
    };

    this.pieOptions = { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false };

    this.barData = {
      labels: ['Volumen de Trabajo'],
      datasets: [
        {
          label: 'Total de Tickets',
          backgroundColor: '#6366f1',
          data: [this.totalTickets]
        }
      ]
    };

    this.barOptions = { plugins: { legend: { display: false } }, maintainAspectRatio: false };
  }

  onGrupoChange(event: any) {
    if (event.value) {
      localStorage.setItem('erp_current_group', event.value.id.toString());
      localStorage.setItem('erp_current_group_name', event.value.nombre);

      if (event.value.id === 0) {
        this.procesarTickets(this.todosLosTickets);
      } else {
        const ticketsFiltrados = this.todosLosTickets.filter(t => t.groupId === event.value.id);
        this.procesarTickets(ticketsFiltrados);
      }
    }
  }
}
