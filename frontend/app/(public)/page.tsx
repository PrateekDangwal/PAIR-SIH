import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Orchestration } from '@/components/landing/orchestration';
import { UseCases } from '@/components/landing/use-cases';

export const metadata = {
  title: 'PAIR — AI-Powered GeM Bid Compliance',
  description: 'Verify GeM tender requirements, bidder evidence and compliance risk with AI.',
};

export default function LandingPage() {
  return (
    <div>
      <section id="hero"><Hero /></section>
      <section id="how-it-works" className="py-24"><HowItWorks /></section>
      <section id="orchestration" className="py-24"><Orchestration /></section>
      <section id="use-cases" className="py-24"><UseCases /></section>
    </div>
  );
}
