'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SecurityPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Detailed Security Statement</h1>
            <p className="text-purple-400 font-medium">Last Updated: February 21, 2026</p>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            
            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-500">3.1</span> Network and Transport Security
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-white">End-to-End Encryption:</strong> All traffic between our mobile clients and the centralized server is forced over HTTPS using TLS 1.3 protocols with strong cipher suites.
                </p>
                <p>
                  <strong className="text-white">API Security:</strong> Our RESTful API utilizes JSON Web Tokens (JWT) for stateless authentication, ensuring that every request is validated against a secure user session.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-500">3.2</span> Application and Data Security
              </h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                <p>
                  <strong className="text-white">Database Isolation:</strong> We employ a client-server architecture where the database is not directly accessible from the public internet. All queries must pass through a secured API layer.
                </p>
                <p>
                  <strong className="text-white">Hashing Standards:</strong> We use the Argon2 or BCrypt hashing algorithms for password storage, ensuring that even in the event of a data leak, raw passwords remain unreadable.
                </p>
                <p>
                  <strong className="text-white">Injection Prevention:</strong> We utilize Parameterized Queries and Object-Relational Mapping (ORM) to eliminate the risk of SQL Injection.
                </p>
              </div>
            </section>

            <section className="bg-[#0F0F12] border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-500">3.3</span> Mobile-Specific Protections (Android)
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-white">Code Obfuscation:</strong> We utilize R8/ProGuard to shrink and obfuscate our Kotlin code, making it significantly harder for malicious actors to reverse-engineer our logic.
                </p>
                <p>
                  <strong className="text-white">Secure Storage:</strong> Sensitive session tokens are stored in the Android Keystore System, which provides hardware-backed security for cryptographic keys.
                </p>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}