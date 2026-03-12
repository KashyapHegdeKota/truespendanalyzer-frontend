"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center"
        style={{ fontFamily: "'Avenir Next', 'Avenir', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#e0e3e8] border-t-[#0077C5] animate-spin" />
          <p className="text-sm text-[#6b7280] font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}