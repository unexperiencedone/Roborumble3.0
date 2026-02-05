"use client"
import React from 'react';
import Link from 'next/link'; // 👈 IMPORT IMPORTANT FOR NAVIGATION
// npm install lucide-react
import { Mail, Phone, MapPin, Instagram, Linkedin, } from 'lucide-react';

const Footer = () => {

  // 1. Define Links for "Explore" Column
  const exploreLinks = [
    { name: 'Home', url: '/' },
    { name: 'Events', url: '/events' },
    { name: 'Schedule', url: '/schedule' },
    { name: 'Gallery', url: '/gallery' },
    { name: 'Register', url: '/dashboard' }, // 👈 Register Link
  ];

  // 2. Define Links for "Festival" Column
  const festivalLinks = [
    { name: 'Sponsors', url: '/sponsors' },
    { name: 'Schedule', url: '/schedule' },
  ];

  return (
    <footer className="bg-[#020410] border-t border-slate-800/50 pt-16 pb-8 font-orbitron relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00ff9f 1px, transparent 1px), linear-gradient(90deg, #00ff9f 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* COLUMN 1: BRAND & INTRO */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-wider">
                ROBO <span className="text-[#4cd84c]">RUMBLE</span> '26
              </h2>
              <p className="text-sm font-bold text-slate-500 mt-1 tracking-widest">
                UIET TECHFEST CSJMU
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[#4cd84c] text-sm font-bold tracking-[0.2em] uppercase">
                Build Complete Dominate
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                "Engineering the future, one circuit at a time. Join us in the ultimate battle of wits and machines where innovation meets destiny."
              </p>
            </div>
          </div>

          {/* COLUMN 2: EXPLORE */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-[#4cd84c] shadow-[0_0_10px_#00ff9f]"></div>
              <h3 className="text-lg font-bold text-white tracking-widest uppercase">
                Explore
              </h3>
            </div>
            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.url}
                    className="text-slate-400 text-sm hover:text-[#4cd84c] hover:pl-2 transition-all duration-300 block uppercase tracking-wider"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: FESTIVAL */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-[#4cd84c] shadow-[0_0_10px_#00ff9f]"></div>
              <h3 className="text-lg font-bold text-white tracking-widest uppercase">
                Festival
              </h3>
            </div>
            <ul className="space-y-3">
              {festivalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.url}
                    className="text-slate-400 text-sm hover:text-[#4cd84c] hover:pl-2 transition-all duration-300 block uppercase tracking-wider"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONTACT */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-[#00ff9f] shadow-[0_0_10px_#00ff9f]"></div>
              <h3 className="text-lg font-bold text-white tracking-widest uppercase">
                Contact
              </h3>
            </div>

            <div className="space-y-4 mb-8">
              <a href="mailto:contact@roborumble.com" className="flex items-center gap-3 text-slate-400 hover:text-[#00ff9f] transition-colors group">
                <Mail className="w-4 h-4 text-[#00ff9f] group-hover:shadow-[0_0_10px_#00ff9f]" />
                <span className="text-sm">contact@roborumble.com</span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 text-slate-400 hover:text-[#00ff9f] transition-colors group">
                <Phone className="w-4 h-4 text-[#00ff9f] group-hover:shadow-[0_0_10px_#00ff9f]" />
                <span className="text-sm">+91 98765 43210</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400 group">
                <MapPin className="w-4 h-4 text-[#00ff9f] mt-1 group-hover:shadow-[0_0_10px_#00ff9f]" />
                <span className="text-sm">
                  UIET, CSJM University,<br /> Kanpur, Uttar Pradesh
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Follow Us
            </h4>
            <div className="flex gap-4">
              {[Instagram, Linkedin,].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#00ff9f] hover:border-[#00ff9f] hover:shadow-[0_0_10px_rgba(0,255,159,0.3)] transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
          <p>© 2026 ROBO RUMBLE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#00ff9f] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#00ff9f] transition-colors">TERMS & CONDITIONS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;