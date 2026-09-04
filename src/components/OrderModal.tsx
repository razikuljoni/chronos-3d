import React, { useState } from 'react';
import { WatchConfig } from '../types';
import { X, Check, ShieldCheck, Truck, Clock } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WatchConfig;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, config }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [serialSlot] = useState(() => Math.floor(Math.random() * 450) + 50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const finishNames: Record<string, string> = {
    titanium: 'Natural Brushed Grade 5 Titanium',
    spaceblack: 'DLC Space Black Diamond-Like Carbon',
    rosegold: '18K Champagne Rose Gold Electroplate',
    ceramic: 'Sintered Polar White Ceramic',
  };

  const strapNames: Record<string, string> = {
    obsidian: 'Obsidian Black Fluoroelastomer',
    cognac: 'Tuscan Cognac Saffiano Leather',
    navy: 'Monaco Marine Deep Navy',
    emerald: 'Alpine Emerald Grain',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#111319] border border-[#c8a97e]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Subtle gold accent corner line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c8a97e] to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#a89f91] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#c8a97e] mb-1">
              Bespoke Allocation // Serial N° 0{serialSlot}/500
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-[#fbf8f2] mb-3">
              RESERVE YOUR CHRONOS
            </h3>
            <p className="text-xs text-[#cfc5b5] font-light leading-relaxed mb-6">
              Lock in your hand-numbered timepiece from the initial inaugural atelier production run. No immediate payment charged; your allocation representative will contact you with build verification.
            </p>

            {/* Selected Config Summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 mb-6 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#a89f91]">Case Metallurgy:</span>
                <span className="text-[#e6c894] font-medium">{finishNames[config.finish]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a89f91]">Strap Specification:</span>
                <span className="text-[#e6c894] font-medium">{strapNames[config.strapColor]}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-[#a89f91]">Total Investment:</span>
                <span className="text-white font-bold text-sm">$1,850 USD</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#a89f91] mb-1.5">
                  Client Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Laurent Dufour"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#c8a97e] focus:outline-none text-sm text-[#fbf8f2] placeholder-[#666]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#a89f91] mb-1.5">
                  Direct Concierge Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.ch"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#c8a97e] focus:outline-none text-sm text-[#fbf8f2] placeholder-[#666]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono text-[#a89f91]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#99ff00]" />
                  <span>5-Yr Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Insured Courier</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#c8a97e]" />
                  <span>14-Day Trial</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-full bg-[#c8a97e] hover:bg-[#dfbe91] text-[#0c0d10] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Confirm Allocation Priority
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#99ff00]/15 border border-[#99ff00]/40 flex items-center justify-center mx-auto text-[#99ff00]">
              <Check className="w-7 h-7" />
            </div>
            <div className="font-mono text-xs text-[#c8a97e] uppercase tracking-widest">
              Allocation Confirmed
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-[#fbf8f2]">
              BIENVENUE, {name.toUpperCase() || 'COLLECTOR'}
            </h3>
            <p className="text-xs text-[#cfc5b5] max-w-sm mx-auto font-light leading-relaxed">
              Your bespoke allocation for Chronos V Aeternus Serial N° 0{serialSlot}/500 has been registered. A personal atelier concierge will reach out to {email || 'your email'} with the certified documentation package.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#fbf8f2] text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Return To Showcase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
