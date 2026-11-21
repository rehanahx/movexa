"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0a0a0a] text-neutral-400 border-t border-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-5 pr-0 md:pr-10 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="w-5 h-5 bg-white text-neutral-950 font-bold text-[10px] flex items-center justify-center tracking-wider">
                M
              </span>
              <span className="text-sm font-extrabold tracking-[0.25em] text-white uppercase font-sans">
                MOVEXA
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Curated cinema experiences. Reserved luxury auditorium seating, laser projection, and spatial audio architectures.
            </p>
            <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest pt-1">
              Live Box Office • Automated Admission Passes
            </p>
          </div>

          {/* Screenings Column */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <span className="block text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Cinema
            </span>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/#movies" className="hover:text-white transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link href="/#movies" className="hover:text-white transition-colors">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link href="/#cinemas" className="hover:text-white transition-colors">
                  Auditoriums
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div className="col-span-1 md:col-span-2">
            <span className="block text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Access
            </span>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/bookings" className="hover:text-white transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="col-span-2 md:col-span-2">
            <span className="block text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Concierge
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Downtown Metropolis Center & Westside Promenade.
            </p>
            <p className="text-[11px] font-mono text-neutral-500 mt-2">
              support@movexa.com
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-12 mt-12 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <span>© {new Date().getFullYear()} MOVEXA CINEMAS. ALL RIGHTS RESERVED.</span>
          <span className="uppercase tracking-widest text-[10px]">
            PRODUCTION SHOWCASE BUILD
          </span>
        </div>
      </div>
    </footer>
  );
}
