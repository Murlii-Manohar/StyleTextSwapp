import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero-section";
import TextTransformer from "@/components/text-transformer";
import ExamplesSection from "@/components/examples-section";

export default function HomePage() {
  useEffect(() => {
    document.title = "TextStyler - Neural Style Transfer for Text";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HeroSection />
        <TextTransformer />
        <ExamplesSection />
      </main>
      <Footer />
    </div>
  );
}
