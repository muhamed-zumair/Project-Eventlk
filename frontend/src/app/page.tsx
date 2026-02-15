'use client';

import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { 
  Sparkles, 
  LayoutList, 
  DollarSign, 
  QrCode, 
  BrainCircuit, 
  Users, 
  ArrowRight,
  Check
} from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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

export default function HomePage() {
  //CURSOR LOGIC 
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation so the glow drags slightly behind cursor
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      
      {/*BACKGROUND EFFECTS*/}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      </div>

     {/* HERO SECTION*/}
      <section 
        onMouseMove={handleMouseMove} 
        className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center px-6 z-10 group"
      >
        
        {/* THE CURSOR GLOW */}
        <motion.div 
          style={{ 
            x: springX, 
            y: springY,
            translateX: "-50%", 
            translateY: "-50%" 
          }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen z-0"
        />


        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto relative z-10"
        >
          <motion.p variants={fadeInUp} className="font-cursive text-2xl md:text-3xl text-purple-300 mb-6 italic tracking-wide" style={{ fontFamily: 'cursive' }}>
            Dream To Reality
          </motion.p>
          
          <motion.h1 
            variants={fadeInUp} 
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-white drop-shadow-2xl leading-snug"
          >
            PLAN SMARTER <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              EXECUTE FASTER
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-loose">
            Everything You Need To Create Flawless Events—Centralized, Automated, And Powered By AI.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            
            <Link href="/contact" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full hover:border-white/40 transition-all"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm sm:text-base text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Grid Floor Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] w-full z-0 overflow-hidden perspective-[1000px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)] origin-top h-[200%] w-full animate-grid-flow"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent h-full"></div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1, y: [0, 10, 0] }} 
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-[30px] h-[50px] border-2 border-white/20 rounded-full flex justify-center p-2 backdrop-blur-sm">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]"
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-center mb-16"
          >
            Powerful Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 relative z-10 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-3xl md:text-5xl font-bold text-center mb-20"
          >
            How It Works
          </motion.h2>

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
            
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-[#111] border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.15)] group-hover:shadow-[0_0_50px_rgba(147,51,234,0.4)] group-hover:border-purple-500/50 transition-all duration-500">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-blue-400">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -10 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="p-8 rounded-2xl bg-[#0F0F12] border border-white/5 hover:border-purple-500/30 group transition-colors relative overflow-hidden"
  >
    {/* Glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
      {feature.icon}
    </div>
    
    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
  </motion.div>
);

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Smart Event Plan & Management",
    desc: "Let AI suggest the perfect timeline, vendors, and budget allocation for your event.",
    color: "bg-purple-600"
  },
  {
    icon: <LayoutList className="w-6 h-6" />,
    title: "Timeline & Tasks",
    desc: "Visual Gantt charts and task boards to keep your team aligned and on schedule.",
    color: "bg-blue-600"
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Budget Tracking",
    desc: "Track every expense in Sri Lankan Rupees with real-time budget insights.",
    color: "bg-indigo-600"
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR Attendance",
    desc: "Generate and scan QR codes for seamless event check-in and registration.",
    color: "bg-pink-600"
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI Recommendations",
    desc: "Get AI-powered vendor recommendations based on your event needs.",
    color: "bg-violet-600"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Workspace",
    desc: "Collaborate in real-time with your team, vendors, and stakeholders.",
    color: "bg-cyan-600"
  }
];

const steps = [
  { number: "1", title: "Create Event", desc: "Set up your event details" },
  { number: "2", title: "Plan Tasks", desc: "Build your timeline" },
  { number: "3", title: "Track Everything", desc: "Monitor progress in real-time" }
];