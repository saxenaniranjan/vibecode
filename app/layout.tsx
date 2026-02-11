import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vintage Letters",
  description: "Private two-device typewriter letter app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
