import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sparkles, Compass, ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="py-12 space-y-20">
      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-3">
          The Moon Light Sanctuary
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-slate-100 mb-6">
          Architectural Grandeur & <br />
          <span className="gold-gradient-text">Bespoke Hospitality</span>
        </h1>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          Rooted on an exclusive mist-draped hilltop in Lonavala, Moon Light Villa was created as a private sanctuary for those who value privacy, sublime architecture, and personalized service.
        </p>
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-6" />
      </div>

      {/* Story & Architecture Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
              Architectural Vision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 leading-tight">
              Designed to Frame the Infinite Beauty of Nature
            </h2>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Every curve, floor-to-ceiling glass panel, and natural stone elevation at Moon Light Villa has been meticulously aligned with the natural valley topography. As dawn breaks, golden sunlight floods the expansive living salons and master balconies.
            </p>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Our 9,200 square foot private estate blends modern Scandinavian warmth with classical royal hospitality. Imported Italian marble, acoustic velvet cinema halls, and cantilevered infinity glass pools harmoniously come together.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <strong className="text-amber-400 text-lg font-serif block">9,200+</strong>
                <span className="text-slate-400">Sq. Ft. Private Estate</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <strong className="text-amber-400 text-lg font-serif block">100%</strong>
                <span className="text-slate-400">Private Seclusion</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80"
              alt="Living Lounge"
              className="w-full h-[450px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Private Culinary Art */}
      <div className="bg-slate-900/60 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden order-2 lg:order-1 border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80"
                alt="Culinary Dining"
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                Bespoke Dining
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
                Gourmet Menus Tailored To Your Palate
              </h2>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Hospitality at Moon Light Villa centers around culinary joy. Our executive chefs curate organic, farm-fresh menus customized to your family's preferences—from coastal seafood grills and authentic Maharashtrian delicacies to gourmet Italian pastas and live barbecue evenings under the stars.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dedicated live butler and banquet service on the pool terrace</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Separate vegetarian and Jain kitchen prep facilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Organic farm-to-table vegetables sourced locally daily</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Plan Your Stay at Moon Light Villa
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Whether you seek a serene weekend retreat, a milestone family anniversary, or an intimate private gathering, our estate concierge is at your service.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/booking"
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg"
          >
            Check Live Availability
          </Link>
          <Link
            to="/contact"
            className="bg-slate-800 text-slate-200 text-xs uppercase tracking-wider px-8 py-3.5 rounded-full border border-slate-700 hover:border-amber-400 transition-colors"
          >
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
