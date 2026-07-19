import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TasksProvider } from "@/lib/tasks/useTasks";
import { TabBar } from "@/components/TabBar";
import { CaptureFab } from "@/components/CaptureFab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism",
  description:
    "Вивали все, що в голові — AI розбере на задачі та план на сьогодні.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TasksProvider>
          <main className="flex flex-1 flex-col pb-20">{children}</main>
          <CaptureFab />
          <TabBar />
        </TasksProvider>
      </body>
    </html>
  );
}
