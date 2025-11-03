import Header from "@/components/Header";
import Footer from "@/components/Footer";

import LandingPage from "./LandingPage/LandingPage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
