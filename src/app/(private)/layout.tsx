import type React from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import NextAuthSessionProvider from "@/providers/sessionProvider";

export const metadata: Metadata = {
  title: "MYALIANCA - Portal do Cliente",
  description: "Portal do cliente para gerenciamento de seguros",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
