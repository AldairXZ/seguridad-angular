import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, ChartModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  totalTickets: number = 45;

  estadisticas: any[] = [
    { estado: 'Pendiente', cantidad: 12, color: 'danger' },
    { estado: 'En progreso', cantidad: 18, color: 'info' },
    { estado: 'Revisión', cantidad: 5, color: 'warning' },
    { estado: 'Finalizado', cantidad: 10, color: 'success' }
  ];

  pieData: any;
  pieOptions: any;
  barData: any;
  barOptions: any;

  ngOnInit() {
    this.pieData = {
      labels: ['Pendiente', 'En Progreso', 'Revisión', 'Finalizado'],
      datasets: [
        {
          data: [12, 18, 5, 10],
          backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e']
        }
      ]
    };

    this.pieOptions = {
      plugins: {
        legend: { position: 'bottom' }
      }
    };

    this.barData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      datasets: [
        {
          label: 'Nuevos Tickets',
          backgroundColor: '#6366f1',
          data: [4, 7, 2, 9, 5]
        }
      ]
    };

    this.barOptions = {
      plugins: {
        legend: { display: false }
      }
    };
  }
}
