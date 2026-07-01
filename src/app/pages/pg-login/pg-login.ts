import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pg-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pg-login.html'
})
export class PgLogin {
  nome = '';

  constructor(private router: Router) {}

  entrarComoParticipante() {
    const participante = this.nome.trim() || 'Victor';

    localStorage.setItem('usuarioNome', participante);
    localStorage.setItem('usuarioPerfil', 'participante');

    this.router.navigate(['/homepage']);
  }

  entrarComoOrganizador() {
    const organizador = this.nome.trim() || 'Fabricio';

    localStorage.setItem('usuarioNome', organizador);
    localStorage.setItem('usuarioPerfil', 'organizador');

    this.router.navigate(['/organizer-homepage']);
  }
}