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
  Check,
  RefreshCw,
  Target,
  CheckCircle2,
  Rocket
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

const marqueeItems = [
  { text: "LKR Budget Tracking", icon: <DollarSign className="w-4 h-4" /> },
  { text: "Seamless QR Check-in", icon: <QrCode className="w-4 h-4" /> },
  { text: "Collaborative Team Workspace", icon: <Users className="w-4 h-4" /> },
  { text: "AI-Powered Recommedation", icon: <BrainCircuit className="w-4 h-4" /> },
  { text: "End-to-End Event Planning", icon: <LayoutList className="w-4 h-4" /> },
  { text: "Live Progress Sync", icon: <RefreshCw className="w-4 h-4" /> }
];

export default function HomePage() {
  //CURSOR LOGIC 
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      
      {/*BACKGROUND EFFECTS*/}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      </div>

     {/* HERO SECTION*/}
      <section 
        onMouseMove={handleMouseMove} 
        className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-40 text-center px-6 z-10 group overflow-hidden"
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
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-white drop-shadow-2xl leading-[1.1]"
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
            
            <Link href="#features" className="w-full sm:w-auto">
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
        <div className="absolute bottom-0 left-0 right-0 h-[300px] w-full z-0 overflow-hidden perspective-[1000px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)] origin-top h-[200%] w-full animate-grid-flow"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent h-full"></div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1, y: [0, 10, 0] }} 
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <div className="w-[20px] h-[35px] border-2 border-white/20 rounded-full flex justify-center p-1 backdrop-blur-sm">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1.5 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"
            />
          </div>
        </motion.div>
      </section>

      {/* GLASSPHORPHISM MARQUEE */}
      <div className="relative z-20 py-6 border-y border-white/5 bg-white/[0.03] backdrop-blur-lg overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1500] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 items-center"
        >
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <span className="text-purple-400 opacity-70">
                {item.icon}
              </span>
              <span className="text-sm md:text-base font-semibold tracking-widest text-white/60 uppercase">
                {item.text}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20 ml-10" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 px-6">
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

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 max-w-7xl mx-auto">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-purple-700 via-blue-500 to-purple-700 z-0"></div>
            
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Icon Number */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-8 h-8 rounded-full bg-[#050505] border border-gray-500 flex items-center justify-center z-20">
                    <span className="text-xs font-semibold text-gray-300">{step.number}</span>
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-medium mb-4 text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-[260px]">{step.desc}</p>
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
  { 
    number: "1", 
    title: "Tell Us Your Vision", 
    desc: "Share your event details and goals. Our AI understands your requirements and starts planning instantly.",
    icon: <Sparkles className="w-10 h-10 text-white" />
  },
  { 
    number: "2", 
    title: "AI Creates Your Plan", 
    desc: "Get a complete event plan with timelines, budgets, vendor suggestions, and task lists in minutes.",
    icon: <Target className="w-10 h-10 text-white" />
  },
  { 
    number: "3", 
    title: "Collaborate & Refine", 
    desc: "Work with your team, make adjustments, and let AI handle the coordination and scheduling.",
    icon: <CheckCircle2 className="w-10 h-10 text-white" />
  },
  { 
    number: "4", 
    title: "Execute Flawlessly", 
    desc: "Launch your event with confidence. Monitor everything in real-time and let automation handle the rest.",
    icon: <Rocket className="w-10 h-10 text-white" />
  }
];