import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  usuarioActual: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.cargarDatosGuardados();
  }

  private setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  cargarDatosGuardados() {
    const sesionGuardada = this.getCookie('erp_sesion_actual');
    if (sesionGuardada) {
      this.usuarioActual = JSON.parse(sesionGuardada);
    }
  }

  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email: email, password: pass }).pipe(
      tap(response => {
        const userData = response.data[0].user;
        const token = response.data[0].token;

        this.usuarioActual = {
          id: userData.id,
          nombre: userData.nombre,
          email: userData.email,
          permisos: userData.permisos,
          token: token
        };

        this.setCookie('erp_sesion_actual', JSON.stringify(this.usuarioActual), 1);
        this.setCookie('erp_token', token, 1);
      })
    );
  }

  logout() {
    this.usuarioActual = null;
    this.deleteCookie('erp_sesion_actual');
    this.deleteCookie('erp_token');
    this.router.navigate(['/login']);
  }

  hasPermission(permission: string): boolean {
    return this.usuarioActual ? this.usuarioActual.permisos.includes(permission) : false;
  }
}
