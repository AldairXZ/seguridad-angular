import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.html'
})
export class LoginComponent {
  email: string = '';
  pass: string = '';

  constructor(private auth: AuthService, private router: Router, private messageService: MessageService) {}

  iniciarSesion() {
    if (this.email && this.pass) {
      this.auth.login(this.email, this.pass).subscribe({
        next: () => {
          this.router.navigate(['/group']);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Credenciales incorrectas' });
        }
      });
    }
  }
}
