import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { UnreadMessagesProvider } from "@/contexts/unread-messages-context";
import { ConnectionProvider } from "@/contexts/connection-context";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

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
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Suspense>
          <ConnectionProvider>
            <AuthProvider>
              <NotificationsProvider>
                <UnreadMessagesProvider>{children}</UnreadMessagesProvider>
              </NotificationsProvider>
            </AuthProvider>
          </ConnectionProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
