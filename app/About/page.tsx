import About from './About';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <About />
      </main>
      <Footer />
    </div>
  );
}