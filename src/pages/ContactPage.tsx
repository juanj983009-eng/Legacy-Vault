import { type SubmitEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { IconUser } from '../components/ui/Icons';
import { usePageMetadata } from '../hooks/usePageMetadata';

const SUBJECTS = [
  ['relojeria', 'Relojería histórica y mecanismos antiguos'],
  ['monedas', 'Numismática colonial y piezas de plata'],
  ['interfaz', 'Navegación y uso de la tienda'],
  ['general', 'Otras consultas generales del catálogo'],
] as const;

interface ContactErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const FIELD_CLASS = 'form-field w-full min-w-0 rounded-control border border-arena/45 bg-carbon py-3 pr-3 pl-11 text-base text-marfil placeholder:text-arena/70';
const FIELD_ICON_CLASS = 'pointer-events-none absolute top-3.5 left-3.5 size-5 text-bronce-hover';

const contactIcons = {
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  tag: 'M20 13l-7 7-9-9V4h7z M8 8h.01',
  message: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.5-.7L4 21l1.4-4.7A8.5 8.5 0 1 1 21 11.5z M9 12h.01 M12 12h.01 M15 12h.01',
};

function ContactIcon({ name, className }: { name: keyof typeof contactIcons; className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={contactIcons[name]} />
    </svg>
  );
}

const consultationDetails = [
  { title: 'Piezas y colecciones', value: 'Consulta sobre relojes, monedas, cámaras y otros objetos.', icon: 'tag' },
  { title: 'Experiencia de compra', value: 'Cuéntanos qué necesitas revisar sobre el catálogo o el carrito.', icon: 'message' },
] as const;

const EMAIL_FORMAT = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function ContactPage() {
  const heading = usePageMetadata('Contáctanos');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [messageLength, setMessageLength] = useState(0);

  const nameInputId = useId();
  const emailInputId = useId();
  const subjectInputId = useId();
  const messageInputId = useId();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const focusNewDraft = useRef(false);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
    else if (focusNewDraft.current) {
      focusNewDraft.current = false;
      nameRef.current?.focus();
    }
  }, [submitted]);

  function validate(formData: FormData): { isValid: boolean; newErrors: ContactErrors } {
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    const newErrors: ContactErrors = {};

    if (name.length < 2 || name.length > 80) {
      newErrors.name = 'Escribe un nombre de 2 a 80 caracteres.';
    }

    if (email.length < 3 || email.length > 254 || !EMAIL_FORMAT.test(email)) {
      newErrors.email = 'Escribe un correo válido, por ejemplo visitante@example.test.';
    }

    if (!SUBJECTS.some(([value]) => value === subject)) {
      newErrors.subject = 'Selecciona un asunto válido para tu consulta.';
    }

    if (message.length < 20 || message.length > 500) {
      newErrors.message = 'El mensaje debe contener entre 20 y 500 caracteres.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { isValid, newErrors } = validate(formData);
    setErrors(newErrors);

    if (!isValid) {
      // Enfocar el primer campo con error de forma accesible
      if (newErrors.name) {
        nameRef.current?.focus();
      } else if (newErrors.email) {
        emailRef.current?.focus();
      } else if (newErrors.subject) {
        subjectRef.current?.focus();
      } else if (newErrors.message) {
        messageRef.current?.focus();
      }
      return;
    }

    // Éxito puramente local sin envío de red ni persistencia
    setSubmitted(true);
  }

  function handleReset() {
    if (submitted) focusNewDraft.current = true;
    setErrors({});
    setSubmitted(false);
    setMessageLength(0);
  }

  return (
    <div className="relative isolate overflow-hidden bg-carbon">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="/images/editorial-gabinete-contacto.webp"
          alt=""
          width={1440}
          height={620}
          fetchPriority="high"
          className="h-full w-full object-cover object-[35%_center]"
        />
        <div className="absolute inset-0 bg-carbon/80 lg:bg-transparent lg:bg-linear-to-r lg:from-carbon/75 lg:via-carbon/10 lg:to-carbon/50" />
      </div>
      <div className="mx-auto grid max-w-[100rem] gap-6 px-4 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-7 xl:px-12 xl:py-12">
        <header className="min-w-0 lg:px-4 lg:pt-4">
          <p className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-bronce-hover uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-bronce/80" />
            Contacto
          </p>
          <h1 ref={heading} tabIndex={-1} className="mt-3 font-display text-4xl font-bold tracking-tight text-marfil focus:outline-none sm:text-5xl xl:text-6xl">
            Contáctanos
          </h1>
          <p className="mt-3 max-w-[43ch] text-base leading-relaxed text-arena sm:mt-4 sm:text-lg">
            Consulta sobre las piezas, el catálogo o tu experiencia en Legacy Vault.
          </p>
          <div className="mt-5 border-t border-contorno pt-4 lg:mt-7 lg:max-w-[22rem] lg:pb-18">
            <p className="mb-3 text-xs font-semibold tracking-wider text-arena uppercase">¿En qué podemos orientarte?</p>
            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
              {consultationDetails.map(({ title, value, icon }) => (
                <li key={title} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
                  <span className="row-span-2 grid size-9 place-items-center rounded-full border border-bronce/60 bg-carbon text-bronce-hover sm:size-10">
                    <ContactIcon name={icon} className="size-5" />
                  </span>
                  <p className="font-display text-base font-bold text-marfil">{title}</p>
                  <p className="wrap-break-word text-sm leading-relaxed text-arena">{value}</p>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="min-w-0 rounded-tarjeta border border-contorno bg-pizarra p-5 sm:p-7 lg:border-bronce/50 lg:bg-carbon/90 xl:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-carbon text-bronce-hover sm:size-12">
              <ContactIcon name="mail" className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 id="contact-form-title" className="font-display text-2xl leading-tight font-bold text-marfil sm:text-3xl">
                Escribe una consulta
              </h2>
              <p id="contact-privacy" className="mt-1.5 text-sm leading-relaxed text-arena">
                Usa datos de ejemplo. El formulario revisa la consulta sin enviar ni guardar el mensaje.
              </p>
            </div>
          </div>
          {submitted ? (
            <div role="status" aria-atomic="true" className="mt-6 space-y-4 rounded-control border border-contorno bg-pizarra p-5 sm:p-7">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-exito/20 border border-exito text-marfil mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7 text-exito">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 ref={successRef} tabIndex={-1} className="font-display text-2xl font-bold">
                Gracias por tus comentarios
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-arena">
                Agradecemos que hayas dedicado un momento a completar el formulario.
              </p>
              <div className="pt-2">
                <Button variant="primary" onClick={handleReset}>
                  Escribir otra consulta
                </Button>
              </div>
            </div>
          ) : (
            <form aria-labelledby="contact-form-title" aria-describedby="contact-privacy" onSubmit={handleSubmit} onReset={handleReset} noValidate autoComplete="off" className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:gap-6">
                {/* NOMBRE */}
                <div>
                  <label htmlFor={nameInputId} className="block text-sm font-semibold mb-2">
                    Nombre <span className="text-arena" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <IconUser className={FIELD_ICON_CLASS} />
                    <input
                      ref={nameRef}
                      id={nameInputId}
                      name="name"
                      type="text"
                      maxLength={80}
                      placeholder="Ej. Rodrigo Mendoza"
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? `${nameInputId}-error` : undefined}
                      className={FIELD_CLASS}
                    />
                  </div>
                  {errors.name && (
                    <p id={`${nameInputId}-error`} role="alert" className="mt-1.5 border-l-2 border-bronce pl-2 text-xs text-arena font-medium">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* CORREO */}
                <div>
                  <label htmlFor={emailInputId} className="block text-sm font-semibold mb-2">
                    Correo electrónico <span className="text-arena" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <ContactIcon name="mail" className={FIELD_ICON_CLASS} />
                    <input
                      ref={emailRef}
                      id={emailInputId}
                      name="email"
                      type="email"
                      maxLength={254}
                      placeholder="visitante@example.test"
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? `${emailInputId}-error` : undefined}
                      className={FIELD_CLASS}
                    />
                  </div>
                  {errors.email && (
                    <p id={`${emailInputId}-error`} role="alert" className="mt-1.5 border-l-2 border-bronce pl-2 text-xs text-arena font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* ASUNTO */}
              <div>
                <label htmlFor={subjectInputId} className="block text-sm font-semibold mb-2">
                  Asunto de la consulta <span className="text-arena" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <ContactIcon name="tag" className={FIELD_ICON_CLASS} />
                  <select
                    ref={subjectRef}
                    id={subjectInputId}
                    name="subject"
                    defaultValue="relojeria"
                    aria-required="true"
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? `${subjectInputId}-error` : undefined}
                    className={FIELD_CLASS}
                  >
                    {SUBJECTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                {errors.subject && <p id={`${subjectInputId}-error`} role="alert" className="mt-1.5 border-l-2 border-bronce pl-2 text-xs text-arena">{errors.subject}</p>}
              </div>

              {/* MENSAJE */}
              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <label htmlFor={messageInputId} className="text-sm font-semibold">
                    Mensaje detallado <span className="text-arena" aria-hidden="true">*</span>
                  </label>
                  <span className="text-xs text-arena" aria-live="polite">
                    {messageLength} / 500 caracteres (mínimo 20)
                  </span>
                </div>
                <div className="relative">
                  <ContactIcon name="message" className={FIELD_ICON_CLASS} />
                  <textarea
                    ref={messageRef}
                    id={messageInputId}
                    name="message"
                    rows={4}
                    maxLength={500}
                    onChange={(e) => setMessageLength(e.target.value.length)}
                    placeholder="Escribe tu consulta sobre las piezas o tu experiencia con la vitrina."
                    aria-required="true"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? `${messageInputId}-error` : undefined}
                    className={FIELD_CLASS}
                  />
                </div>
                {errors.message && (
                  <p id={`${messageInputId}-error`} role="alert" className="mt-1.5 border-l-2 border-bronce pl-2 text-xs text-arena font-medium">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* BOTONES */}
              <div className="space-y-2">
                <Button type="submit" size="lg" className="w-full" aria-describedby="contact-privacy">
                  <ContactIcon name="message" className="size-5 shrink-0" /> Revisar consulta
                </Button>
                <Button type="reset" variant="ghost" className="justify-start">
                  Limpiar
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
