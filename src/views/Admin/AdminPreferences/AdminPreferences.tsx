"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { faker } from "@faker-js/faker";
import { Trash2, Loader2 } from "lucide-react";

type LanguageOption = "English" | "Bahasa Indonesia" | "Melayu" | "Japanese";
type ThemeOption = "Light" | "Dark";

type SessionRow = {
  id: string;
  device: string;
  initiatedAt: Date;
  lastAccess: Date;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  "English",
  "Bahasa Indonesia",
  "Melayu",
  "Japanese",
];

const BROWSERS = ["Chrome", "Brave", "Firefox", "Safari", "Edge"] as const;

function formatDateTime(dt: Date): string {
  const month = dt.toLocaleString("en-US", { month: "long" });
  const day = dt.toLocaleString("en-US", { day: "2-digit" });
  const year = dt.getFullYear();
  const time = dt.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${Number(day)}, ${year} - ${time}`;
}

const sampleSessions: SessionRow[] = (() => {
  const count = faker.number.int({ min: 3, max: 8 });
  const rows: SessionRow[] = [];
  for (let i = 0; i < count; i++) {
    const browser = faker.helpers.arrayElement(BROWSERS);
    const version = `${faker.number.int({ min: 80, max: 130 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`;
    const initiated = faker.date.recent({ days: 30 });
    const lastAccess = faker.date.between({ from: initiated, to: new Date() });
    rows.push({
      id: faker.string.uuid(),
      device: `${browser} ${version}`,
      initiatedAt: initiated,
      lastAccess,
    });
  }
  return rows;
})();

function AdminPreferences() {
  // UI - Language
  const [language, setLanguage] = useState<LanguageOption>("English");
  const [theme, setTheme] = useState<ThemeOption>("Light");

  // General
  const [name, setName] = useState<string>(faker.person.fullName());
  const [email, setEmail] = useState<string>(faker.internet.email());
  const [password, setPassword] = useState<string>("");

  // Security
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);

  // Sessions
  const [sessions, setSessions] = useState<SessionRow[]>(sampleSessions);

  // Saving states
  const [savingField, setSavingField] = useState<
    | null
    | "language"
    | "theme"
    | "name"
    | "email"
    | "password"
    | "2fa"
  >(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = () => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1400);
  };

  const handleInlineSave = (field: typeof savingField) => {
    setSavingField(field);
    window.setTimeout(() => {
      setSavingField(null);
      showToast();
    }, 700);
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.lastAccess.getTime() - a.lastAccess.getTime());
  }, [sessions]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin/dashboards" className="hover:underline">Dashboard</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Preferences</li>
        </ol>
      </nav>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">User Preferences</h1>
      </div>

      {/* User Interface */}
      <section className="rounded-md border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <h2 className="text-base font-medium">User Interface</h2>
          {savingField === "language" || savingField === "theme" ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 md:gap-4 md:p-6">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageOption)}
              onBlur={() => handleInlineSave("language")}
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Choose the display language.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeOption)}
              onBlur={() => handleInlineSave("theme")}
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
            <p className="text-xs text-muted-foreground">Switch between Light and Dark appearance.</p>
          </div>
        </div>
      </section>

      {/* General */}
      <section className="rounded-md border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <h2 className="text-base font-medium">General</h2>
          {savingField === "name" || savingField === "email" || savingField === "password" ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 md:gap-4 md:p-6">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleInlineSave("name")}
              placeholder="Your name"
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleInlineSave("email")}
              placeholder="you@example.com"
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleInlineSave("password")}
              placeholder="••••••••"
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
            />
            <p className="text-xs text-muted-foreground">Leave blank to keep your current password.</p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-md border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <h2 className="text-base font-medium">Security</h2>
          {savingField === "2fa" ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 md:gap-4 md:p-6">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Two-Factor Authentication (2FA)</label>
            <div className="flex items-center gap-3">
              <input
                id="twofa"
                type="checkbox"
                checked={twoFAEnabled}
                onChange={(e) => setTwoFAEnabled(e.target.checked)}
                onBlur={() => handleInlineSave("2fa")}
                className="h-4 w-4"
              />
              <label htmlFor="twofa" className="text-sm">{twoFAEnabled ? "Enabled" : "Disabled"}</label>
            </div>
            <p className="text-xs text-muted-foreground">
              Enable 2FA to add an extra layer of security to your account. When enabled, you’ll 
              be asked to provide a verification code in addition to your password when signing in.
            </p>
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section className="rounded-md border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <h2 className="text-base font-medium">Sessions</h2>
          <p className="text-xs text-muted-foreground">Active sessions on your account</p>
        </div>
        <div className="p-4 md:p-6">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium">NO</th>
                  <th className="px-3 py-3 text-left font-medium">DEVICE</th>
                  <th className="px-3 py-3 text-left font-medium">INITIATED AT</th>
                  <th className="px-3 py-3 text-left font-medium">LAST ACCESS</th>
                  <th className="px-3 py-3 text-left font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No active sessions</td>
                  </tr>
                ) : (
                  sortedSessions.map((s, idx) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-3">{idx + 1}</td>
                      <td className="px-3 py-3">{s.device}</td>
                      <td className="px-3 py-3">{formatDateTime(s.initiatedAt)}</td>
                      <td className="px-3 py-3">{formatDateTime(s.lastAccess)}</td>
                      <td className="px-3 py-3">
                        <div className="inline-flex overflow-hidden rounded-md border">
                          <button
                            className="p-2.5 text-red-600 hover:bg-muted"
                            aria-label="Delete"
                            title="Delete"
                            onClick={() => setSessions((prev) => prev.filter((r) => r.id !== s.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toastVisible ? (
        <div className="fixed bottom-4 right-4 rounded-md border bg-white px-4 py-2 text-sm shadow-sm">
          Preference Saved
        </div>
      ) : null}
    </div>
  );
}

export default AdminPreferences;