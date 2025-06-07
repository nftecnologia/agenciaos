import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "../components/layout/main-layout";
import { AuthProvider } from "../components/providers/session-provider";
import { QueryProvider } from "../components/providers/query-provider";
import { BrowserNotificationsProvider } from "../components/providers/browser-notifications-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgênciaOS",
  description: "Sistema completo para gestão de agências digitais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <BrowserNotificationsProvider>
              <MainLayout>{children}</MainLayout>
            </BrowserNotificationsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
