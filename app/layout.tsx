import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlueBush | Sustainable Homewares Style Guide",
  description: "BlueBush Web Design Style Guide - Sustainable Homewares. Australian Grown. Down-to-earth Professional.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
