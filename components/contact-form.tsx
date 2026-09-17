"use client";

import { useState, type FormEvent } from "react";

type Errors = Partial<Record<"name" | "message", string>>;

const field =
  "mt-2 block w-full border-0 border-b border-rule-strong bg-transparent px-0 py-2.5 text-base font-light text-ink transition-colors duration-300 placeholder:text-ink-2 hover:border-[color-mix(in_srgb,var(--ink)_45%,transparent)] focus:border-ink focus:outline-none aria-[invalid=true]:border-[#e5484d]";

export function ContactForm({ email }: { email: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [opened, setOpened] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Enter your name so I know who is writing.";
    if (!message) next.message = "Write a short message before sending.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = `Portfolio contact from ${name}${company ? `, ${company}` : ""}`;
    const body = `${message}\n\n${name}${company ? `\n${company}` : ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={field}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-sm text-[#ff6b6b]">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="company" className="eyebrow">
            Company <span className="opacity-60">(optional)</span>
          </label>
          <input id="company" name="company" autoComplete="organization" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="eyebrow">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${field} resize-y`}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-[#ff6b6b]">
            {errors.message}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium whitespace-nowrap text-ground transition-shadow duration-500 hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)] active:scale-[0.98]"
        >
          Open in email app
        </button>
        <p aria-live="polite" className="text-sm text-ink-2">
          {opened && (
            <>
              No email app opened? Write to{" "}
              <a href={`mailto:${email}`} className="text-accent">
                {email}
              </a>
              .
            </>
          )}
        </p>
      </div>
    </form>
  );
}
