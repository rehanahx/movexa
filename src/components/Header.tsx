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
  ShieldAlert,
  Film,
  Sparkles,
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

  // Do not render user header inside /admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/#movies" },
    { label: "Cinemas", href: "/#cinemas" },
    { label: "My Bookings", href: user ? "/bookings" : "/login?redirect=/bookings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-[#111827] text-white flex items-center justify-center font-black text-sm group-hover:bg-[#ff5500] transition-colors">
            M
          </div>
          <span className="text-xl font-black tracking-tight text-neutral-950 font-sans uppercase">
            MOVEXA
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive ? "text-neutral-950 font-bold" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff5500]" />}
              </Link>
            );
          })}

          {/* Admin badge if role is admin */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#fff4ed] text-[#ff5500] border border-[#ffddc7] text-xs font-bold hover:bg-[#ffe8d9] transition-colors"
            >
              <LayoutDashboard size={13} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Search & Profile CTA */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-52 lg:w-64">
            <Search size={14} className="absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-300 rounded-full outline-none transition-all"
            />
          </form>

          {/* User Auth Session */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#111827] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-neutral-900 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in-50">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                      Role: {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/bookings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                    >
                      <Ticket size={14} className="text-[#ff5500]" />
                      <span>My Bookings</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-amber-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} />
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
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-[#ff5500] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="block py-2 text-sm font-bold text-[#ff5500] hover:underline"
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 text-sm font-semibold text-rose-600"
            >
              Sign Out
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-xs font-semibold bg-neutral-100 rounded-lg text-neutral-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2 text-xs font-semibold bg-[#111827] text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
