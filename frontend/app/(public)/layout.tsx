import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
