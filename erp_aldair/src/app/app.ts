import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button severity="danger" label="Aceptar" icon="pi pi-check"></p-button>
  `
})
export class App {
}
