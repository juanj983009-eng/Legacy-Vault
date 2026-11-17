import type { CheckoutInput, DeliveryInput, FieldErrors } from '../types/checkout';

export const MAX_BUYER_NAME = 120;
export const MAX_EMAIL = 254;
export const MAX_ALIAS = 40;
const EMAIL_FORMAT = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function validateCheckout(input: CheckoutInput): FieldErrors<keyof CheckoutInput> {
  const name = input.name.trim();
  const email = input.email.trim();
  const errors: FieldErrors<keyof CheckoutInput> = {};
  if (name.length < 2 || name.length > MAX_BUYER_NAME) {
    errors.name = 'Escribe un nombre de 2 a 120 caracteres.';
  }
  if (email.length > MAX_EMAIL || !EMAIL_FORMAT.test(email)) {
    errors.email = 'Escribe un correo válido de ejemplo, como visitante@example.test.';
  }
  return errors;
}

export function readAccessCredentials(data: FormData) {
  return {
    email: String(data.get('email') ?? '').trim().toLowerCase(),
    password: String(data.get('password') ?? ''),
  };
}

export function validateCredentials({ email, password }: ReturnType<typeof readAccessCredentials>): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {};
  if (email.length > MAX_EMAIL || !EMAIL_FORMAT.test(email)) {
    errors.email = 'Escribe un correo electrónico válido.';
  }
  if (password.length < 8 || password.length > 72) {
    errors.password = 'Escribe una contraseña de 8 a 72 caracteres.';
  }
  return errors;
}

export function validateDelivery({ address, city, phone }: DeliveryInput): FieldErrors<keyof DeliveryInput> {
  const errors: FieldErrors<keyof DeliveryInput> = {};
  if (address.length < 5 || address.length > 120) errors.address = 'Escribe una dirección de 5 a 120 caracteres.';
  if (city.length < 2 || city.length > 60) errors.city = 'Escribe una ciudad o distrito de 2 a 60 caracteres.';
  if (!/^\d{9}$/.test(phone.replace(/[\s-]/g, ''))) errors.phone = 'Escribe un teléfono de 9 dígitos.';
  return errors;
}
