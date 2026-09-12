import type { ReactNode } from "react";

interface ArticleShellProps {
  title: string;
  intro: string;
  updatedAt?: string;
  children: ReactNode;
}

/** Marco común de las páginas de texto largo (legales e informativas). */
export function ArticleShell({ title, intro, updatedAt, children }: ArticleShellProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3 border-b border-border-subtle pb-8">
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-fg">{title}</h1>
        <p className="text-sm leading-relaxed text-fg-muted">{intro}</p>
        {updatedAt ? (
          <p className="text-xs text-fg-faint">Última actualización: {updatedAt}</p>
        ) : null}
      </header>

      <article className="gf-prose pt-2">{children}</article>
    </main>
  );
}
