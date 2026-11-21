"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Ticket,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/#movies?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Do not render public header inside /admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Screenings", href: "/#movies" },
    { label: "Auditoriums", href: "/#cinemas" },
    { label: "Reservations", href: user ? "/bookings" : "/login?redirect=/bookings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo - Minimalist Editorial */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-6 h-6 rounded-sm bg-neutral-950 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            M
          </div>
          <span className="text-sm font-extrabold tracking-[0.25em] text-neutral-950 uppercase font-sans">
            MOVEXA
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive ? "text-neutral-950 font-bold" : "hover:text-neutral-950"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-neutral-950" />
                )}
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-300 text-neutral-800 text-[10px] font-mono uppercase tracking-wider hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-colors"
            >
              <LayoutDashboard size={12} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Search & Profile CTA */}
        <div className="flex items-center gap-3">
          {/* Minimalist Search Box */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-48 lg:w-56">
            <Search size={13} className="absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:border-neutral-900 rounded-lg outline-none transition-all font-sans"
            />
          </form>

          {/* User Auth Session */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[10px] font-mono font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-neutral-900 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={13} className="text-neutral-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in-50">
                  <div className="px-3.5 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/bookings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                    >
                      <Ticket size={13} className="text-neutral-500" />
                      <span>My Bookings</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                      >
                        <LayoutDashboard size={13} className="text-neutral-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-4 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </form>

          <nav className="flex flex-col space-y-2 text-xs font-semibold uppercase tracking-wider text-neutral-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="py-2 hover:text-neutral-950 border-b border-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="py-2 text-neutral-950 font-bold border-b border-neutral-100"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
