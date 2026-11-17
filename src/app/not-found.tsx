import Link from "next/link";
import { buttonVariants } from "@/ui/primitives/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-medium text-muted-foreground text-sm">404</p>
      <h1 className="font-semibold text-2xl tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Go home
      </Link>
    </main>
  );
}
