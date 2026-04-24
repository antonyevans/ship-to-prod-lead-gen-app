// app/src/app/page.tsx
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Screenshot from '@/components/landing/Screenshot';
import Comparison from '@/components/landing/Comparison';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FooterCTA from '@/components/landing/FooterCTA';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Screenshot />
      <Comparison />
      <SocialProof />
      <Pricing />
      <FooterCTA />
    </>
  );
}
