import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  readonly MOCK_USER = 'admin@correo.com';
  readonly MOCK_PASS = 'Admin123!@#';

  user = { email: '', password: '' };

  onLogin() {
    if (this.user.email === this.MOCK_USER && this.user.password === this.MOCK_PASS) {
      alert('¡Bienvenido!');
    } else {
      alert('Credenciales incorrectas.');
    }
  }
}
