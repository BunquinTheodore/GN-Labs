import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-glass-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-mist-dim sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {year} GN Labs. Part of the GN Ventures family.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/services" className="hover:text-mist">
            Services
          </Link>
          <Link href="/jobs" className="hover:text-mist">
            Jobs
          </Link>
          <Link href="/jobs/post" className="hover:text-mist">
            Post a job
          </Link>
          <Link href="/jobs/join" className="hover:text-mist">
            Join the talent list
          </Link>
          <Link href="/consultation" className="hover:text-mist">
            Book a consultation
          </Link>
        </div>
      </div>
    </footer>
  );
}
