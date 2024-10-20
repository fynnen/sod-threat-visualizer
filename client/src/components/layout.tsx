import { LogoGithub } from "@carbon/icons-react";

import localFont from "next/font/local";
import "../app/globals.css";

const geistSans = localFont({
  src: "../app/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../app/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <div className="flex items-center justify-between h-16 bg-gray-200 border-b border-gray-400 dark:bg-gray-800 dark:border-black px-8">
        <h1> SOD Threat Analyzer</h1>
        <div>
          <a
            href="https://github.com/fynnen/sod-threat-visualizer/"
            target="_blank"
          >
            <LogoGithub size={40} />
          </a>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto m-8">{children}</div>
    </main>
  );
}
