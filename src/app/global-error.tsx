"use client";

import "@/theme/globals.css";

// Replaces the root layout when it fails, so it renders its own document.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center antialiased">
        <title>Something went wrong</title>
        <h1 className="font-semibold text-2xl tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          The app couldn't load. Please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
