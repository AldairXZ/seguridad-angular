import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://spatial-delcine-devemma-edfc3f92.koyeb.app';

  usuariosDb: any[] = [];
  usuarioActual: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.cargarDatosGuardados();
  }

  cargarDatosGuardados() {
    const sesionGuardada = localStorage.getItem('erp_sesion_actual');
    if (sesionGuardada) {
      this.usuarioActual = JSON.parse(sesionGuardada);
    }

    const dbGuardada = localStorage.getItem('erp_usuarios_db');
    if (dbGuardada) {
      this.usuariosDb = JSON.parse(dbGuardada);
    }
  }

  guardarBaseDeDatos() {
    localStorage.setItem('erp_usuarios_db', JSON.stringify(this.usuariosDb));
  }

  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email: email, password: pass }).pipe(
      tap(response => {
        const rawPermisos = response.permissions || response.user?.permissions || [];
        const permisosAdaptados = [...rawPermisos];

        if (permisosAdaptados.includes('ticket:edit:state')) {
          permisosAdaptados.push('ticket:edit_state');
        }
        if (permisosAdaptados.includes('user:manage')) {
          permisosAdaptados.push('users:view');
        }

        this.usuarioActual = {
          id: Date.now(),
          nombre: email.split('@')[0],
          email: email,
          permisos: permisosAdaptados
        };

        localStorage.setItem('erp_sesion_actual', JSON.stringify(this.usuarioActual));
      })
    );
  }

  logout() {
    this.usuarioActual = null;
    localStorage.removeItem('erp_sesion_actual');
    this.router.navigate(['/login']);
  }

  hasPermission(permission: string): boolean {
    return this.usuarioActual ? this.usuarioActual.permisos.includes(permission) : false;
  }
}
