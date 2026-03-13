import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
