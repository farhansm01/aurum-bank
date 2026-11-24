import AnnouncementBar from "@/components/home/AnnouncementBar";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import AccountTypes from "@/components/home/AccountTypes";
import HowItWorks from "@/components/home/HowItWorks";
import TransferShowcase from "@/components/home/TransferShowcase";
import LoanCalculator from "@/components/home/LoanCalculator";
import Security from "@/components/home/Security";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <AccountTypes />
        <HowItWorks />
        <TransferShowcase />
        <LoanCalculator />
        <Security />
      </main>
    </>
  );
}