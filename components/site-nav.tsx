"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/services", label: "Services" },
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !toggleRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  // Close the mobile menu automatically if the viewport grows past the
  // md breakpoint (e.g. rotating a tablet, resizing a browser window).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="glass-nav sticky top-0 z-40 w-full">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="GN Labs, home">
          <span className="gradient-ring flex h-9 items-center justify-center rounded-lg bg-black px-2">
            <Image
              src="/brand/gn-labs-logo.png"
              alt="GN Labs"
              width={112}
              height={112}
              priority
              className="h-6 w-auto"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-[0.12em] text-mist-dim uppercase transition-colors hover:text-mist"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/consultation" />}
            size="sm"
            className="hidden sm:inline-flex"
          >
            Book a Consultation
          </Button>

          <Button
            ref={toggleRef}
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      {open && (
        <div
          id={menuId}
          ref={panelRef}
          className="glass border-t border-glass-border px-4 pb-4 sm:px-6 md:hidden"
        >
          <div className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm tracking-[0.12em] text-mist-dim uppercase transition-colors hover:bg-glass-strong hover:text-mist"
              >
                {link.label}
              </Link>
            ))}
            <Button
              render={<Link href="/consultation" onClick={() => setOpen(false)} />}
              size="sm"
              className="mt-2 justify-center sm:hidden"
            >
              Book a Consultation
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
