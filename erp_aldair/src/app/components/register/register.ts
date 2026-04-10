import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, InputTextModule,
    PasswordModule, ButtonModule, CalendarModule, KeyFilterModule,
    ToastModule, CardModule
  ],
  providers: [MessageService],
  templateUrl: './register.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      usuario: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      fechaNacimiento: ['', [Validators.required, this.validarMayoriaEdad]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.matchPassword });
  }

  validarMayoriaEdad(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (hoy.getMonth() < fechaNac.getMonth() || (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  matchPassword(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return pass === confirm ? null : { notSame: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      this.http.post(`${this.apiUrl}/auth/register`, formData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Registrado', detail: 'Cuenta creada exitosamente.' });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor.' });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Revisa los campos en rojo.' });
    }
  }
}
