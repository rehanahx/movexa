"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Save,
  Server,
  Mail,
  Phone,
  DollarSign,
  Clock,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [cinemaName, setCinemaName] = useState("Movexa Cinemas");
  const [supportEmail, setSupportEmail] = useState("boxoffice@movexa.com");
  const [supportPhone, setSupportPhone] = useState("+1 (800) 555-FILM");
  const [convenienceFee, setConvenienceFee] = useState(30);
  const [maxSeatsPerBooking, setMaxSeatsPerBooking] = useState(8);
  const [currency, setCurrency] = useState("INR (₹)");
  const [allowCancellations, setAllowCancellations] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Cinema Operations & Platform Settings
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Configure platform policies, ticket booking fees, box office contact channels, and system preferences.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Platform settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Cinema Brand & Contact */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Building2 size={17} className="text-[#ff5500]" />
            <span>Cinema Organization & Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cinema Brand Name
              </label>
              <input
                type="text"
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              >
                <option value="INR (₹)">Indian Rupee (₹ INR)</option>
                <option value="USD ($)">US Dollar ($ USD)</option>
                <option value="EUR (€)">Euro (€ EUR)</option>
                <option value="GBP (£)">British Pound (£ GBP)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>Box Office Support Email</span>
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>Concierge & Inquiries Phone</span>
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Box Office & Ticketing Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Ticket size={17} className="text-[#ff5500]" />
            <span>Ticketing & Admission Policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Technology & Convenience Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={convenienceFee}
                onChange={(e) => setConvenienceFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#ff5500]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Flat fee applied once per online booking transaction.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Max Seats Per Booking
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxSeatsPerBooking}
                onChange={(e) => setMaxSeatsPerBooking(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#ff5500]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents bulk scalping and maintains seat distribution.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCancellations}
                onChange={(e) => setAllowCancellations(e.target.checked)}
                className="rounded border-slate-300 text-[#ff5500] focus:ring-[#ff5500] h-4 w-4"
              />
              <span className="text-xs font-medium text-slate-800">
                Allow customers to cancel unredeemed bookings up to 2 hours before showtime
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Architecture & System Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Server size={17} className="text-[#ff5500]" />
            <span>Infrastructure & Storage Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Database Storage</span>
                <span className="text-slate-500 text-[11px]">MongoDB Atlas Cluster</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Media CDN</span>
                <span className="text-slate-500 text-[11px]">Cloudinary Secure Storage</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Save size={15} />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
