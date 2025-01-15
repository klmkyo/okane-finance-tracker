"use client";

import { AuthGuard } from "@/common/authGuard";
import React from "react";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-stretch">
        <Navbar />
        <main className="bg-gray-100 grow">{children}</main>
      </div>
    </AuthGuard>
  );
}
