import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  /** Pregunta de confirmación. Devuelve true si el usuario acepta. */
  async confirmar(
    titulo: string,
    texto = '',
    confirmarTxt = 'Sí, continuar',
  ): Promise<boolean> {
    const r = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmarTxt,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });
    return r.isConfirmed;
  }

  /** Confirmación para acciones destructivas o de cambio de estado. */
  async confirmarPeligro(
    titulo: string,
    texto = '',
    confirmarTxt = 'Sí, continuar',
  ): Promise<boolean> {
    const r = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmarTxt,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      reverseButtons: true,
      focusCancel: true,
    });
    return r.isConfirmed;
  }

  /** Éxito temporal automático (se cierra solo) */
  exito(mensaje: string, detalle = '') {
    Swal.fire({
      icon: 'success',
      title: mensaje,
      text: detalle,
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  /** NUEVO: Éxito con botón OK que espera a que el usuario haga clic */
  async exitoConConfirmacion(
    titulo: string,
    texto = '',
    confirmarTxt = 'Aceptar'
  ): Promise<boolean> {
    const r = await Swal.fire({
      icon: 'success',
      title: titulo,
      text: texto,
      confirmButtonText: confirmarTxt,
      confirmButtonColor: '#2563eb',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    return r.isConfirmed;
  }

  error(mensaje: string, titulo = 'Ocurrió un error') {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Entendido',
    });
  }

  aviso(mensaje: string, titulo = 'Atención') {
    Swal.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Entendido',
    });
  }
}