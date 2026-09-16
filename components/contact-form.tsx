"use client";

import { useState, type FormEvent } from "react";

type Errors = Partial<Record<"name" | "message", string>>;

const field =
  "ease mt-2 block w-full border border-rule-strong bg-ground px-3 py-2.5 text-base text-ink placeholder:text-ink-2 hover:border-accent focus:border-accent focus:outline-none aria-[invalid=true]:border-[#c0362c]";

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
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
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
            <p id="name-error" className="mt-1.5 text-sm text-[#c0362c] dark:text-[#ff8a7f]">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="company" className="text-sm font-medium">
            Company <span className="font-normal text-ink-2">(optional)</span>
          </label>
          <input id="company" name="company" autoComplete="organization" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${field} resize-y`}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-[#c0362c] dark:text-[#ff8a7f]">
            {errors.message}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="ease inline-flex h-11 items-center justify-center border border-accent bg-accent px-5 text-sm font-medium whitespace-nowrap text-accent-ink hover:border-ink hover:bg-ink hover:text-ground active:translate-y-px"
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
