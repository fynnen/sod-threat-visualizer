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
      <main
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </main>
  );
}


// export default function Layout({ children }: PropsWithChildren) {
//   return (
//     <>
//       <main className="flex min-h-screen bg-gray-100">
//         <div className="flex flex-col flex-1 overflow-y-auto">
//           <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 pb-4"></div>
//           <div className="m-12">{children}</div>
//         </div>
//       </main>
//     </>
//   );
// }
