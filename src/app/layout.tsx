import type { Metadata } from "next";
import { Geist, Geist_Mono, Alumni_Sans } from "next/font/google";
import { TasksProvider } from "@/lib/tasks/useTasks";
import { TabBar } from "@/components/TabBar";
import { CaptureFab } from "@/components/CaptureFab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alumniSans = Alumni_Sans({
  variable: "--font-alumni-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${alumniSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TasksProvider>
          <main className="mx-auto flex w-full max-w-[700px] flex-1 flex-col pb-20">
            {children}
          </main>
          <CaptureFab />
          <TabBar />
        </TasksProvider>
      </body>
    </html>
  );
}
