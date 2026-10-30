import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { siteConfig } from "@/config/site";

const montreal = localFont({
  src: [
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-Light.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-Italic.otf", weight: "400", style: "italic" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/NeueMontreal/NeueMontreal-BoldItalic.otf", weight: "700", style: "italic" },
  ],
  variable: "--font-montreal",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montreal.variable}>
      <body className=" ">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}