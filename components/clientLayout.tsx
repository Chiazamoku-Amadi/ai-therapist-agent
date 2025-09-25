"use client";

import Header from "@/components/header";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/app/hooks/AuthGuard";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthGuard />

      {/* Header */}
      <Header />
      {children}
      <Toaster />
      {/* Footer */}
      <Footer />
    </Providers>
  );
}
