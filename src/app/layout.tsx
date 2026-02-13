import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifeline Safety App",
  description: "Safety Monitoring System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
