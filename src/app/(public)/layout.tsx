import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import NextAuthSessionProvider from "@/providers/sessionProvider";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
});
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Login",
  description: "Portal My Alinça",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
