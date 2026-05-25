import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">
        Go Home
      </Link>
    </div>
  );
}
