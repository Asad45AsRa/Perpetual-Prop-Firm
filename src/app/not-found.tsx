import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-medium">404</h1>
      <p className="text-muted">Page not found.</p>
      <Link href="/" className="text-gold underline">
        Back to home
      </Link>
    </div>
  );
}
