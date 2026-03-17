'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      
      {/* --- BACKGROUND DECOR (Consistent with Home) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-[#1A1A1E] text-purple-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/5"
          >
            Pricing Plans
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Choose Your Perfect Plan
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Flexible pricing options to match your event planning needs
          </motion.p>
        </div>

        {/* --- PRICING CARDS --- */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {plans.map((plan, index) => (
            <PriceCard key={index} plan={plan} />
          ))}
        </motion.div>

        {/* --- BOTTOM NOTE --- */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm mt-16"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const PriceCard = ({ plan }: { plan: any }) => {
  const isProfessional = plan.title === "Professional";

  return (
    <div className="relative group">
      {/* "Most Popular" Badge for Professional Plan */}
      {isProfessional && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-sm font-bold px-6 py-1.5 rounded-full z-20 shadow-lg">
          Most Popular
        </div>
      )}

      <motion.div
        variants={fadeInUp}
        whileHover={{ y: -10 }}
        className={`relative p-8 rounded-2xl border flex flex-col h-full transition-all duration-300
          ${isProfessional 
            ? 'bg-gradient-to-b from-[#7c3aed] to-[#3b82f6] border-purple-500 shadow-[0_0_40px_rgba(124,58,237,0.3)]' 
            : 'bg-[#0F0F12] border-white/10 hover:border-purple-500/30'
          }
        `}
      >
        {/* Plan Title */}
        <h3 className={`text-xl font-medium mb-2 ${isProfessional ? 'text-white' : 'text-white'}`}>
          {plan.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.period && <span className={`text-sm ${isProfessional ? 'text-purple-100' : 'text-gray-500'}`}>{plan.period}</span>}
        </div>

        {/* Description */}
        <p className={`text-sm mb-8 leading-relaxed ${isProfessional ? 'text-purple-100' : 'text-gray-400'}`}>
          {plan.desc}
        </p>

        {/* Features List */}
        <ul className="space-y-4 mb-8 flex-1">
          {plan.features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Check className={`w-5 h-5 shrink-0 ${isProfessional ? 'text-white' : 'text-purple-500'}`} />
              <span className={isProfessional ? 'text-white' : 'text-gray-300'}>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <Link href={plan.link} className="w-full">
          <button 
            className={`w-full py-3.5 rounded-lg font-bold transition-all shadow-lg
              ${isProfessional 
                ? 'bg-white text-purple-600 hover:bg-gray-100' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25'
              }
            `}
          >
            {plan.buttonText}
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

// --- DATA ---
const plans = [
  {
    title: "Starter",
    price: "Free",
    period: "forever",
    desc: "Perfect for small events and individual planners",
    buttonText: "Get Started",
    link: "/signup",
    features: [
      "Up to 5 events per month",
      "Basic AI recommendations",
      "QR attendance tracking",
      "Email support",
      "1 team member",
      "Basic analytics"
    ]
  },
  {
    title: "Professional",
    price: "$9.99",
    period: "per month",
    desc: "Ideal for professional event planners and agencies",
    buttonText: "Get Started",
    link: "/signup",
    features: [
      "Unlimited events",
      "Advanced AI recommendations",
      "QR attendance tracking",
      "Priority support",
      "Up to 10 team members",
      "Advanced analytics",
      "Budget tracking",
      "Custom branding"
    ]
  },
  {
    title: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "For large organizations with complex needs",
    buttonText: "Contact Sales",
    link: "/contact",
    features: [
      "Unlimited everything",
      "Premium AI features",
      "Dedicated account manager",
      "24/7 phone support",
      "Unlimited team members",
      "Custom integrations",
      "API access",
      "White-label options"
    ]
  }
];