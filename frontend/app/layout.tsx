import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { ToastProvider } from "../components/Toast";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Wellness Event Booking",
  description: "Online booking system for wellness events with vendor approval workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <main className="min-h-screen bg-gray-50">
                {children}
              </main>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
