import type { Metadata } from "next";
import { Lato, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { PRODUCT_NAME } from "@/lib/brand";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const sourceCode = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description:
    "Property management built for independent landlords. See how each rental is performing — rent, vacancies, utilities, expenses, mortgage, and cash flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${sourceCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
