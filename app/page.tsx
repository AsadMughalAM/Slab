import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Bento from "@/components/Bento";
import Showcase from "@/components/Showcase";
import Statement from "@/components/Statement";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";

export default function Home() {
  return (
    <>
      <a
        href="#manifesto"
        className="slab slab-sm fixed left-4 top-4 z-[70] -translate-y-24 bg-lime px-3 py-2 text-[13px] font-bold uppercase focus:translate-y-0"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Bento />
        <Showcase />
        <Statement />
        <FinalCta />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
