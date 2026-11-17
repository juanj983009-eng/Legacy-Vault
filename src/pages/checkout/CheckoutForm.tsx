import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { DemoField } from '../../components/forms/DemoField';
import { Button } from '../../components/ui/Button';
import { IconArrowRight, IconInfo } from '../../components/ui/Icons';
import { useFormErrors } from '../../hooks/useFormErrors';
import { MAX_BUYER_NAME, MAX_EMAIL, validateCheckout, validateDelivery } from '../../utils/validation';

type CheckoutDetails = { name: string; email: string; address: string; city: string; phone: string };

export function CheckoutForm({ onConfirm, initialContact }: { onConfirm: () => void; initialContact?: { name: string; email: string } }) {
  const { formRef, errors, setErrors } = useFormErrors<keyof CheckoutDetails>();
  const [details, setDetails] = useState<CheckoutDetails>();
  const [review, setReview] = useState(false);
  const reviewHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (review) reviewHeading.current?.focus();
    else if (details) formRef.current?.querySelector('input')?.focus();
  }, [details, formRef, review]);

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (field: keyof CheckoutDetails) => String(data.get(field) ?? '').trim();
    const draft = { name: read('name'), email: read('email'), address: read('address'), city: read('city'), phone: read('phone') };
    const next = { ...validateCheckout(draft), ...validateDelivery(draft) };
    setErrors(next);
    if (Object.keys(next).length) return;
    setDetails(draft);
    setReview(true);
  }

  return (
    <div className="min-w-0 space-y-4">
      <ol aria-label="Pasos de la compra" className="grid grid-cols-2 border-b border-contorno text-sm sm:text-base">
        <li aria-current={!review ? 'step' : undefined} className={`border-b-2 px-2 pb-2 ${review ? 'border-transparent text-arena' : 'border-bronce font-semibold text-bronce-hover'}`}>1. Contacto y entrega</li>
        <li aria-current={review ? 'step' : undefined} className={`border-b-2 px-2 pb-2 ${review ? 'border-bronce font-semibold text-bronce-hover' : 'border-transparent text-arena'}`}>2. Revisar y confirmar</li>
      </ol>
      {review && details ? (
        <section aria-labelledby="checkout-review-title" className="checkout-panel space-y-5 p-5 sm:p-7">
          <h2 id="checkout-review-title" ref={reviewHeading} tabIndex={-1}
            className="font-display text-2xl font-bold focus:outline-none">Revisa tu pedido</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 wrap-break-word">
              <dt className="text-sm font-semibold text-bronce-hover">Contacto</dt>
              <dd className="mt-1 text-sm leading-relaxed text-arena">{details.name}<br />{details.email}<br />{details.phone}</dd>
            </div>
            <div className="min-w-0 wrap-break-word">
              <dt className="text-sm font-semibold text-bronce-hover">Entrega a domicilio</dt>
              <dd className="mt-1 text-sm leading-relaxed text-arena">{details.address}<br />{details.city}, Perú</dd>
            </div>
          </dl>
          <div className="border-t border-contorno pt-4">
            <h3 className="font-semibold">Pago de prueba</h3>
            <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-arena">
              <IconInfo className="mt-0.5 size-4 shrink-0 text-bronce-hover" />
              Al confirmar no se realizará ningún cobro ni envío.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
            <Button variant="outline" onClick={() => setReview(false)}>Editar datos</Button>
            <Button onClick={onConfirm}>Confirmar pedido</Button>
          </div>
        </section>
      ) : (
        <form ref={formRef} aria-labelledby="checkout-fields" onSubmit={submit} noValidate autoComplete="off"
          className="checkout-panel min-w-0 space-y-5 p-5 sm:p-7">
          <div>
            <h2 id="checkout-fields" className="font-display text-2xl font-bold">Información del comprador</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-arena">Completa el formulario con datos de ejemplo.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DemoField id="checkout-name" label="Nombre del comprador" name="name" maxLength={MAX_BUYER_NAME}
              defaultValue={details?.name ?? initialContact?.name} placeholder="Ana Demo" required error={errors.name} />
            <DemoField id="checkout-email" label="Correo electrónico" name="email" type="email" maxLength={MAX_EMAIL}
              defaultValue={details?.email ?? initialContact?.email} placeholder="visitante@example.test" required error={errors.email} />
          </div>
          <fieldset className="min-w-0 border-t border-contorno">
            <legend className="pr-3 font-display text-xl font-bold">Dirección de entrega</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 sm:col-span-2">
                <DemoField id="checkout-address" label="Dirección" name="address" maxLength={120}
                  defaultValue={details?.address} placeholder="Av. Ejemplo 123" required error={errors.address} />
              </div>
              <DemoField id="checkout-city" label="Ciudad o distrito" name="city" maxLength={60}
                defaultValue={details?.city} placeholder="Lima" required error={errors.city} />
              <DemoField id="checkout-phone" label="Teléfono" name="phone" type="tel" maxLength={15}
                defaultValue={details?.phone} placeholder="000 000 000" required error={errors.phone} />
            </div>
          </fieldset>
          <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
            <Link to={PATHS.cart} className="inline-flex min-h-11 items-center justify-center rounded-control px-3 text-sm font-semibold text-bronce-hover underline underline-offset-4">Volver al carrito</Link>
            <Button type="submit">Revisar pedido <IconArrowRight className="size-4 shrink-0" /></Button>
          </div>
        </form>
      )}
    </div>
  );
}
