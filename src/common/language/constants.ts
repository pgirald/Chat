import { IS_EMAIL, IS_STRONG_PASSWORD } from 'class-validator';
import { Language } from './interfaces';
import { IS_USERNAME } from '../../auth/validators/isUsername';

export const english: Language = {
  lang: 'english',
  usernameNotAvailable: 'Username not available.',
  emailNotAvailable: 'Email not available.',
  validation: {
    getDefault: function (property: string): string {
      return `The value of ${property} is invalid.`;
    },
    [IS_EMAIL]: 'The email has an incorrect format.',
    [IS_STRONG_PASSWORD]: 'The password is not strong enough.',
    [IS_USERNAME]: 'The username has an invalid format.',
  },
  status: {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    409: 'Conflict',
    410: 'Gone',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    unknown:"Unknown Error",
  },
};

export const spanish: Language = {
  lang: 'spanish',
  usernameNotAvailable: 'Usuario no disponible.',
  emailNotAvailable: 'Email no disponible.',
  validation: {
    getDefault: function (property: string): string {
      return `El valor de ${property} es inválido.`;
    },
    [IS_EMAIL]: 'El email tiene un formato incorrecto.',
    [IS_STRONG_PASSWORD]: 'La contraseña no es los suficientemente fuerte.',
    [IS_USERNAME]: 'El nombre de usuario tiene un formato incorrecto.',
  },
  status: {
    200: 'Correcto',
    201: 'Creado',
    202: 'Aceptado',
    204: 'Sin Contenido',
    400: 'Solicitud Incorrecta',
    401: 'No Autorizado',
    403: 'Prohibido',
    404: 'No Encontrado',
    405: 'Método No Permitido',
    406: 'No Aceptable',
    409: 'Conflicto',
    410: 'Ya No Disponible',
    422: 'Entidad No Procesable',
    500: 'Error Interno del Servidor',
    501: 'No Implementado',
    502: 'Puerta de Enlace Incorrecta',
    503: 'Servicio No Disponible',
    504: 'Tiempo de Espera de la Puerta de Enlace Agotado',
    unknown:"Error Desconocido",
  },
};