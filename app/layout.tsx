import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "eulr music service",
  description: "Remote focus music and synchronized radio for the eulr coding agent.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
