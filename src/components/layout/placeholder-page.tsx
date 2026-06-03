"use client";

import Link from "next/link";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="paper-panel flex w-full max-w-xl flex-col gap-6 rounded-[28px] border-2 border-border p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-display-strong">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="rounded-2xl bg-surface-soft px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-inset-soft)]">
          Future online play will use durable guest sessions tied to the browser, with no login required.
        </p>
        <Link
          href="/"
          className="inline-flex w-fit rounded-xl border-2 border-border px-4 py-2 font-semibold text-display"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}
