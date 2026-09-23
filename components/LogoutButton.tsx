"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-50 dark:border-line-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-bg-dark"
    >
      {loading ? "Keluar..." : "Logout"}
    </button>
  );
  
}