import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap, throwError } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { LivrosResultado, Item } from '../../models/interfaces';
import { LivroVolumeInfo } from '../../models/livroVolumeInfo';
import { LivroService } from '../../service/livro.service';
import { LivroComponent } from '../../componentes/livro/livro.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';


const PAUSA = 300;

@Component({
  selector: 'app-lista-livros',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LivroComponent,
    ReactiveFormsModule
  ],
  templateUrl: './lista-livros.component.html',
  styleUrl: './lista-livros.component.css'
})
export class ListaLivrosComponent implements AfterViewInit {
  campoBusca = new FormControl();
  mensagemErro = ''
  livrosResultado!: LivrosResultado;
  @ViewChild('campoBuscaElement') campoBuscaElement!: ElementRef;
  constructor(private service: LivroService,
    private liveAnnouncer: LiveAnnouncer
  ) { }

  ngAfterViewInit() {
    this.campoBuscaElement.nativeElement.focus();
  }

  livrosEncontrados$ = this.campoBusca.valueChanges.pipe(
    debounceTime(PAUSA),
    filter((valorDigitado) => valorDigitado.length >= 3),
    distinctUntilChanged(),
    switchMap((valorDigitado) => {
      if (valorDigitado.trim() === '') {
        return EMPTY;
      } else {
        return this.service.buscar(valorDigitado);
      }
    }),
    tap((resultado) => {
      this.liveAnnouncer.announce(`Total de resuldado! ${resultado.totalItems} ` )
      this.livrosResultado = resultado;
    }),
    map((resultado) => resultado.items ?? []),
    map((items) => this.livrosResultadoParaLivros(items)),
    catchError(() => {
      this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação!';
      return throwError(() => new Error(this.mensagemErro));
    })
  );

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }
}
