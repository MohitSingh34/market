import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Simulation",
  description: "A self-running market simulation with 200 agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
