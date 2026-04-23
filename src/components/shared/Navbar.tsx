"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    closeSearch();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="sticky top-0 z-navbar bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-xl font-black tracking-tight text-primary">
                OCS <span className="text-accent">Nepal</span>
              </span>
            </Link>

            {/* Desktop nav */}
            {!searchOpen && (
              <nav className="hidden md:flex items-center gap-7">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-sm font-medium transition-colors pb-0.5",
                      "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-accent after:transition-transform after:duration-200",
                      isActive(link.href)
                        ? "text-primary after:scale-x-100"
                        : "text-text-muted hover:text-primary after:scale-x-0 hover:after:scale-x-100",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Desktop search expand */}
            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 items-center gap-2 max-w-md"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 h-9 px-3 text-sm bg-bg-subtle border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="p-1.5 text-text-muted hover:text-primary transition-colors"
                  aria-label="Submit search"
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="p-1.5 text-text-muted hover:text-text transition-colors"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            )}

            {/* Right side icons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 text-text-muted hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                href="/cart"
                className="relative p-2 text-text-muted hover:text-primary transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-4 h-4 px-1 bg-accent text-white text-[10px] font-bold rounded-full">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account/login"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover active:bg-primary-active transition-colors"
              >
                Sign In
              </Link>

              <button
                className="md:hidden p-2 text-text-muted hover:text-primary transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <form onSubmit={handleSearchSubmit} className="md:hidden pb-3 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 h-9 px-3 text-sm bg-bg-subtle border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="p-1.5 text-text-muted hover:text-primary transition-colors"
                aria-label="Submit search"
              >
                <Search size={18} />
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-overlay bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-modal bg-white border-b border-border shadow-lg md:hidden">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-3 text-base font-medium rounded-lg transition-colors",
                    isActive(link.href)
                      ? "text-primary bg-primary-light"
                      : "text-text hover:text-primary hover:bg-bg-subtle",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <Link
                  href="/account/login"
                  className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
