"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Calendar,
  Ticket,
  TrendingUp,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  bookingsCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("query", searchQuery.trim());

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load customer list");
      }

      setCustomers(data.customers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Registered Customers & Audience
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Directory of verified user accounts, lifetime ticket reservations, and total box office spending.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#e8ecf2] rounded-xl p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search customer by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      {isLoading ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs">
          <Loader2 size={28} className="animate-spin text-[#ff5500] mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Loading audience directory...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs space-y-3">
          <Users size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No customers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No accounts match your query. New user signups will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Reservations</th>
                  <th className="py-3 px-4 text-right">Lifetime Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {c.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                          <ShieldCheck size={11} />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {c.bookingsCount} orders
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
