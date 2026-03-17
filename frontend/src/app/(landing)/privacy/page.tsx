'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Comprehensive Privacy Policy</h1>
            <p className="text-purple-400 font-medium">Last Updated: February 21, 2026</p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            
            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">1.1</span> Introduction and Scope
              </h2>
              <p>
                EventLK ("the Platform") is a smart event management system. This policy outlines our commitment to the Sri Lanka Personal Data Protection Act (PDPA) No. 9 of 2022 and international data standards. It applies to all data collected through our Android application, web interface, and backend services.
              </p>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">1.2</span> Information Collection and Origin
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-white">User-Provided Data:</strong> This includes registration details (name, verified email, phone number) and event-specific parameters (budget constraints, headcount, event nature, and aesthetic preferences).
                </p>
                <p>
                  <strong className="text-white">Automatically Collected Data:</strong> We collect metadata including device identifiers, IP addresses, and interaction logs (e.g., which venue suggestions were clicked) to refine our recommendation engine.
                </p>
                <p>
                  <strong className="text-white">Financial Data Persistence:</strong> We store expense logs and budget allocations locally and on our cloud servers. We do not process or store raw payment card data; all transactions are routed through encrypted, PCI-DSS compliant third-party gateways.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">1.3</span> Algorithmic Processing and Machine Learning
              </h2>
              <p className="mb-4">EventLK utilizes automated processing to enhance the planning experience:</p>
              <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                <p>
                  <strong className="text-white">Predictive Modeling:</strong> We use XGBoost and Random Forest classifiers to analyze historical data trends. These models predict venue suitability and budget distributions based on user inputs.
                </p>
                <p>
                  <strong className="text-white">Human Intervention:</strong> Users have the right to contest or override any automated suggestion provided by the AI. The models are assistive, not deterministic.
                </p>
                <p>
                  <strong className="text-white">Data Minimization:</strong> We apply "feature selection" to ensure our models only process the minimum data points necessary to generate an accurate prediction.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-500">1.4</span> Data Retention and Deletion
              </h2>
              <p>
                Data is retained only as long as the user account remains active. Upon a "Delete Account" request, all personally identifiable information (PII) is purged from our production databases within 30 days, though anonymized event metrics may be retained to improve global ML model accuracy.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}