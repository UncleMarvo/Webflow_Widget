import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      {/* Offset for fixed navbar */}
      <div className="pt-16">
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
