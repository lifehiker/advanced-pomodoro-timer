import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Focus Flow - Advanced Pomodoro Timer",
  description:
    "Boost your productivity with advanced analytics, gamification, and smart scheduling. The premium Pomodoro timer for focused professionals.",
  keywords: [
    "pomodoro timer",
    "productivity",
    "focus timer",
    "task analytics",
    "study timer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
