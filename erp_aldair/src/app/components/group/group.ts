import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; // <-- NUEVO IMPORT
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip'; // <-- NUEVO IMPORT
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './group.html'
})
export class GroupComponent implements OnInit {
  grupos: any[] = [];
  displayDialog: boolean = false;
  grupoActual: any = {};

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    public auth: AuthService,
    private router: Router // <-- INYECTAMOS EL ROUTER
  ) {}

  ngOnInit() {
    this.cargarGrupos();
  }

  private getHeaders() {
    const token = document.cookie.split('; ').find(row => row.startsWith('erp_token='))?.split('=')[1];
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarGrupos() {
    this.http.get<any>('http://localhost:3000/api/groups', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.grupos = res.data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos' })
    });
  }

  abrirNuevoGrupo() {
    this.grupoActual = { nombre: '', categoria: '', nivel: 'Medio' };
    this.displayDialog = true;
  }

  editarGrupo(grupo: any) {
    this.grupoActual = { ...grupo };
    this.displayDialog = true;
  }

  // --- NUEVA FUNCIÓN PARA REDIRIGIR A LOS TICKETS ---
  verTicketsDelGrupo(grupo: any) {
    // Simulamos la selección del grupo como lo hace el Dashboard
    localStorage.setItem('erp_current_group', grupo.id.toString());
    localStorage.setItem('erp_current_group_name', grupo.nombre);

    // Actualizamos los permisos en memoria para el nuevo contexto
    this.auth.setPermisosGrupo(grupo.id.toString());

    // Redirigimos al componente del Kanban (Ajusta la ruta '/vista-grupo' si en tu app.routes.ts se llama diferente)
    this.router.navigate(['/vista-grupo']);
  }

  guardarGrupo() {
    if (this.grupoActual.nombre) {
      if (this.grupoActual.id) {
        this.http.put<any>(`http://localhost:3000/api/groups/${this.grupoActual.id}`, this.grupoActual, { headers: this.getHeaders() }).subscribe({
          next: () => {
            this.cargarGrupos();
            this.displayDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Grupo actualizado' });
          }
        });
      } else {
        this.http.post<any>('http://localhost:3000/api/groups', this.grupoActual, { headers: this.getHeaders() }).subscribe({
          next: () => {
            this.cargarGrupos();
            this.displayDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Grupo creado' });
          }
        });
      }
    }
  }

  eliminarGrupo(id: number) {
    if(confirm('¿Seguro que deseas eliminar este workspace? Esto borrará todos sus tickets asociados.')) {
      this.http.delete<any>(`http://localhost:3000/api/groups/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.cargarGrupos();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Grupo eliminado' });
        }
      });
    }
  }
}
