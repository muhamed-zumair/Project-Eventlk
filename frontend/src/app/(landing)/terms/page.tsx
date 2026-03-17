'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Terms and Conditions of Service (T&C)</h1>
            <p className="text-purple-400 font-medium">Last Updated: February 21, 2026</p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            
            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">2.1</span> The Service Agreement
              </h2>
              <p>
                By accessing EventLK, you enter into a legally binding agreement. EventLK provides a digital framework for event coordination; it does not act as a vendor, venue owner, or physical event planner.
              </p>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">2.2</span> User Conduct and Data Integrity
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-white">Accuracy Guarantee:</strong> The efficacy of our smart planning tools depends entirely on the integrity of user input. EventLK is not liable for failed planning outcomes resulting from inaccurate budget or headcount data.
                </p>
                <p>
                  <strong className="text-white">Prohibited Use:</strong> Users may not attempt to reverse-engineer the platform's predictive algorithms or use the service to log fraudulent financial data.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">2.3</span> Limitation of Liability and Disclaimers
              </h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                <p>
                  <strong className="text-white">Third-Party Vendors:</strong> EventLK suggests venues and services. Any subsequent contract signed between a user and a vendor is independent of EventLK. We are not liable for vendor cancellations or service failures.
                </p>
                <p>
                  <strong className="text-white">Predictive Accuracy:</strong> Our AI models provide estimates. Actual costs may vary based on market inflation, seasonal demand, and vendor-specific negotiations.
                </p>
                <p>
                  <strong className="text-white">"As-Is" Provision:</strong> The platform is provided "as-is" without warranties of uninterrupted service, though we maintain a 99.5% uptime goal.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">2.4</span> Intellectual Property Rights
              </h2>
              <p>
                All source code (Kotlin/Jetpack Compose), UI/UX designs, database schemas, and the proprietary weightings of our ML models are the exclusive intellectual property of the EventLK Development Team.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}