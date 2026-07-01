import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EventoService, Evento } from '../../services/evento.service';

@Component({
  selector: 'app-pg-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pg-homepage.html'
})
export class PgHomepage implements OnInit {
  usuarioNome = localStorage.getItem('usuarioNome') || 'Victor';
  usuarioPerfil = localStorage.getItem('usuarioPerfil') || 'participante';

  eventos: Evento[] = [];

  texto = '';
  categoria = '';
  ordenar = 'asc';

  carregando = false;
  salvando = false;

  erro = '';
  sucesso = '';

  mostrarFormulario = false;
  editando = false;
  eventoEditandoId = '';

  inscritosPorEvento: Record<string, string[]> = {};

  eventoForm: Evento = {
    titulo: '',
    descricao: '',
    dataHora: '',
    local: '',
    categoria: '',
    vagas: 1,
    imagem: '',
    organizador: this.usuarioNome,
    inscritos: []
  };

  constructor(
    private eventoService: EventoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarEventos();
  }

  get ehOrganizador() {
    return this.usuarioPerfil === 'organizador';
  }

  carregarEventos() {
    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    const organizador = this.ehOrganizador ? this.usuarioNome : undefined;

    this.eventoService
      .listarEventos(this.texto, this.categoria, this.ordenar, organizador)
      .subscribe({
        next: eventos => {
          this.eventos = eventos;
        },
        error: err => {
          this.erro = 'Erro ao carregar eventos: ' + err.message;
        },
        complete: () => {
          this.carregando = false;
        }
      });
  }

  limparFiltros() {
    this.texto = '';
    this.categoria = '';
    this.ordenar = 'asc';
    this.carregarEventos();
  }

  abrirFormularioNovo() {
    this.mostrarFormulario = true;
    this.editando = false;
    this.eventoEditandoId = '';
    this.limparFormulario();
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.eventoEditandoId = '';
    this.limparFormulario();
  }

  salvarEvento() {
    if (
      !this.eventoForm.titulo ||
      !this.eventoForm.descricao ||
      !this.eventoForm.dataHora ||
      !this.eventoForm.local ||
      !this.eventoForm.categoria ||
      !this.eventoForm.vagas
    ) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.sucesso = '';

    const eventoParaSalvar: Evento = {
      ...this.eventoForm,
      organizador: this.usuarioNome,
      vagas: Number(this.eventoForm.vagas)
    };

    if (this.editando && this.eventoEditandoId) {
      this.eventoService
        .editarEvento(this.eventoEditandoId, eventoParaSalvar)
        .subscribe({
          next: () => {
            this.sucesso = 'Evento atualizado com sucesso.';
            this.cancelarFormulario();
            this.carregarEventos();
          },
          error: err => {
            this.erro = 'Erro ao editar evento: ' + err.error?.error;
            this.salvando = false;
          },
          complete: () => {
            this.salvando = false;
          }
        });

      return;
    }

    this.eventoService.criarEvento(eventoParaSalvar).subscribe({
      next: () => {
        this.sucesso = 'Evento criado com sucesso.';
        this.cancelarFormulario();
        this.carregarEventos();
      },
      error: err => {
        this.erro = 'Erro ao criar evento: ' + err.error?.error;
        this.salvando = false;
      },
      complete: () => {
        this.salvando = false;
      }
    });
  }

  editarEvento(evento: Evento) {
    if (!evento._id) {
      return;
    }

    this.mostrarFormulario = true;
    this.editando = true;
    this.eventoEditandoId = evento._id;

    this.eventoForm = {
      _id: evento._id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      dataHora: this.formatarDataParaInput(evento.dataHora),
      local: evento.local,
      categoria: evento.categoria,
      vagas: evento.vagas,
      imagem: evento.imagem || '',
      organizador: evento.organizador,
      inscritos: evento.inscritos || []
    };
  }

  excluirEvento(evento: Evento) {
    if (!evento._id) {
      return;
    }

    const confirmar = confirm(`Deseja excluir o evento "${evento.titulo}"?`);

    if (!confirmar) {
      return;
    }

    this.eventoService.excluirEvento(evento._id).subscribe({
      next: () => {
        this.sucesso = 'Evento excluído com sucesso.';
        this.carregarEventos();
      },
      error: err => {
        this.erro = 'Erro ao excluir evento: ' + err.error?.error;
      }
    });
  }

  inscrever(evento: Evento) {
    if (!evento._id) {
      return;
    }

    this.eventoService.inscrever(evento._id, this.usuarioNome).subscribe({
      next: () => {
        this.sucesso = 'Inscrição realizada com sucesso.';
        this.carregarEventos();
      },
      error: err => {
        this.erro = 'Erro ao realizar inscrição: ' + err.error?.error;
      }
    });
  }

  cancelarInscricao(evento: Evento) {
    if (!evento._id) {
      return;
    }

    this.eventoService.cancelarInscricao(evento._id, this.usuarioNome).subscribe({
      next: () => {
        this.sucesso = 'Inscrição cancelada com sucesso.';
        this.carregarEventos();
      },
      error: err => {
        this.erro = 'Erro ao cancelar inscrição: ' + err.error?.error;
      }
    });
  }

  estaInscrito(evento: Evento): boolean {
    return evento.inscritos?.includes(this.usuarioNome) || false;
  }

  verInscritos(evento: Evento) {
    if (!evento._id) {
      return;
    }

    this.eventoService.listarInscritos(evento._id).subscribe({
      next: resposta => {
        this.inscritosPorEvento[evento._id || ''] = resposta.inscritos;
      },
      error: err => {
        this.erro = 'Erro ao buscar inscritos: ' + err.error?.error;
      }
    });
  }

  irParaMinhasInscricoes() {
    this.router.navigate(['/my-entries']);
  }

  sair() {
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('usuarioPerfil');
    this.router.navigate(['/login']);
  }

  private limparFormulario() {
    this.eventoForm = {
      titulo: '',
      descricao: '',
      dataHora: '',
      local: '',
      categoria: '',
      vagas: 1,
      imagem: '',
      organizador: this.usuarioNome,
      inscritos: []
    };
  }

  private formatarDataParaInput(dataHora: string): string {
    const data = new Date(dataHora);
    const dataLocal = new Date(data.getTime() - data.getTimezoneOffset() * 60000);

    return dataLocal.toISOString().slice(0, 16);
  }
}