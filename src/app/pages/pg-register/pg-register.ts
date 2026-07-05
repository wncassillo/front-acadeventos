import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pg-register',
  imports: [FormsModule],
  templateUrl: './pg-register.html',
  styleUrl: './pg-register.scss',
})
export class PgRegister {
   nome = '';

  constructor(private router: Router) {}

  cadastrarComoParticipante() {
    alert("PLACEHOLDER \nParticipante Criado!")
    this.router.navigate(['/login']);
  }

  cadastrarComoOrganizador() {
    alert("PLACEHOLDER \nOrganizador Criado!")
    this.router.navigate(['/login']);
  }

  irParaLogin() {
    this.router.navigate(['/login'])
  }

}
