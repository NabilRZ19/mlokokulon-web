"use client";

import { useState } from "react";

// Belum ada Firebase Auth beneran — form controlled biar keliatan hidup, tapi tombol "Masuk"
// belum punya onSubmit. Menyusul saat guard tier & login diimplementasikan.
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-white">
            MK
          </span>
          <h1 className="font-heading text-lg font-semibold text-foreground">Login Admin</h1>
          <p className="text-sm text-muted-foreground">Panel CMS Kelurahan Mlokomanis Kulon</p>
        </div>

        <form className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mlokokulon-ngadirojo.com"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
