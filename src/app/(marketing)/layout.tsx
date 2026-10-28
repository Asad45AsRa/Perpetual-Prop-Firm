import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/navbar";


export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
