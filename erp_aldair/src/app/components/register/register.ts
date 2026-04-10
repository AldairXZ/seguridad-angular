import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule, CalendarModule, KeyFilterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      usuario: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      fechaNacimiento: ['', [Validators.required, this.validarMayoriaEdad]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/.*[!@#$%^&*].*/)]],
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
      alert('Registro completado correctamente.');
    }
  }
}
