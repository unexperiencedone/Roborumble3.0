"use client";

import Navbar from "../components/Navbar";
import MatrixBackground from "../components/MatrixBackground";
import Footer from "../components/Footer";
import TeamSection from "../components/TeamSection";

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixBackground color="#003B00" text="" />
      <Navbar />

      <div className="pt-20">
        <TeamSection />
      </div>

      <Footer />
    </main>
  );
}