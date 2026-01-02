import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

// --- Utility: Copy to Clipboard ---
const copyToClipboard = (text) => {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

// --- Performance Optimized Cursor & Spotlight ---
const SovereignHero = ({ isReady }) => {
  const mouseX = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const mouseY = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const containerRef = useRef(null);
  
  const { scrollY } = useScroll();
  const yTranslate = useTransform(scrollY, [0, 500], [0, 200]);

  const updatePosition = (clientX, clientY) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    mouseX.set(((clientX - left) / width) * 100);
    mouseY.set(((clientY - top) / height) * 100);
  };

  const handleMouseMove = (e) => updatePosition(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const maskImage = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `circle(18vw at ${x}% ${y}%)`
  );

  const outlineX = useTransform(mouseX, [0, 100], [-10, 10]);
  const outlineY = useTransform(mouseY, [0, 100], [-5, 5]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center cursor-none touch-none"
    >
      <motion.div style={{ y: yTranslate }} className="absolute inset-0 z-0">
        {/* Softened Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black z-10" />
        <img 
          src="bg.jpg" 
          alt="Atmosphere" 
          className="w-full h-full object-cover grayscale brightness-[0.45] contrast-[1.1]"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1598970434722-5c4c442eea74?q=80&w=2070&auto=format&fit=crop'; }}
        />
      </motion.div>

      <div className="relative z-20 text-center select-none pointer-events-none px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white/60 text-[10px] uppercase mb-12 font-mono tracking-[0.8em]"
        >
          Sovereignty • 2026 Cycle
        </motion.div>

        <div className="relative inline-block w-full">
          {/* Layer 1: The Outlined Shadow - Always Visible */}
          <motion.h1 
            style={{ 
              x: outlineX, 
              y: outlineY, 
              WebkitTextStroke: '1.5px rgba(255,255,255,0.25)' 
            }}
            className="text-[18vw] md:text-[16vw] font-serif font-black uppercase leading-none tracking-tighter text-transparent opacity-40" 
          >
            The Horse
          </motion.h1>
          
          {/* Layer 2: The Spotlight Reveal */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ clipPath: maskImage }}
          >
            <h1 className="text-[18vw] md:text-[16vw] font-serif font-black uppercase leading-none tracking-tighter text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.5)]">
              The Horse
            </h1>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="mt-16 space-y-6"
        >
          <p className="text-white/80 text-2xl md:text-4xl font-serif italic tracking-[0.2em]">Take the Reign.</p>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto" />
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 text-[9px] font-mono text-white/30 uppercase tracking-[0.6em] flex flex-col gap-2">
        <span>Momentum: Absolute</span>
        <span>Lead: Community</span>
      </div>
    </section>
  );
};

// --- Kinetic Timeline Section ---
const KineticCycle = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const xTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const cycles = [
    { year: "1906", title: "THE SPARK", desc: "A world in transition. The first gallop of the modern age.", img: "1906.jpg" },
    { year: "1966", title: "THE REVOLUTION", desc: "The old guard falls. Tradition shatters. Momentum becomes absolute.", img: "1966.jpg" },
    { year: "2026", title: "THE SOVEREIGN", desc: "The individual takes the reign. The sixty-year silence is over.", img: "2026.jpg" },
  ];

  return (
    <section ref={containerRef} id="cycle" className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x: xTranslate }} className="flex gap-0">
          <div className="min-w-[50vw] h-screen flex flex-col justify-center px-10 md:px-20 border-r border-white/5 bg-black">
            <h2 className="text-white/5 text-[25vw] font-serif font-black uppercase italic leading-none">Cycle</h2>
            <div className="relative -mt-10 md:-mt-20">
              <span className="text-white/40 text-[10px] tracking-[1em] uppercase block mb-6 font-mono">Chronology</span>
              <p className="text-white/60 text-xl md:text-3xl font-serif font-light leading-relaxed max-w-md">
                60 years of momentum.
              </p>
            </div>
          </div>

          {cycles.map((item, i) => (
            <div key={i} className="min-w-[100vw] md:min-w-[90vw] h-screen flex items-center justify-center px-6 md:px-10 border-r border-white/5 bg-black">
              <div className="relative w-full max-w-6xl h-[75vh] flex flex-col md:flex-row items-center gap-10 md:gap-16 group bg-zinc-950/20 p-4 md:p-8 rounded-sm">
                <div className="w-full md:w-3/5 overflow-hidden h-1/2 md:h-full grayscale brightness-50 group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-1000 border border-white/5">
                  <img 
                    src={item.img} 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2.5s]" 
                    alt={item.year} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=1000'; }}
                  />
                </div>
                <div className="w-full md:w-2/5 flex flex-col justify-center">
                  <div className="text-[12vw] md:text-[8vw] font-serif font-black text-white leading-none mb-4 opacity-10 group-hover:opacity-100 transition-opacity duration-1000">
                    {item.year}
                  </div>
                  <h3 className="text-white text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest mb-6">{item.title}</h3>
                  <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const SovereignTriptych = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-60 bg-black overflow-hidden flex flex-col items-center">
      <motion.div style={{ opacity }} className="relative w-full max-w-7xl px-8 min-h-[80vh] grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
        {[
          { id: "image1.jpg", label: "Vision", y: y1 },
          { id: "image2.jpg", label: "Momentum", y: y2 },
          { id: "image3.jpg", label: "Detail", y: y3 }
        ].map((pillar, idx) => (
          <motion.div 
            key={pillar.id}
            className={`relative h-[50vh] md:h-full flex flex-col gap-6 ${idx === 1 ? 'md:mt-40' : idx === 2 ? 'md:-mt-20' : ''}`}
            style={{ y: isMobile ? 0 : pillar.y }}
          >
            <div className="flex-1 overflow-hidden grayscale border border-white/5 bg-zinc-900 group shadow-2xl">
              <img 
                src={pillar.id} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
                alt={pillar.label} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1598970434722-5c4c442eea74?auto=format&fit=crop&q=80&w=1000'; }}
              />
            </div>
            <div className="h-16 border-l-2 border-white/20 pl-6">
              <span className="block text-[10px] uppercase tracking-[0.5em] text-white/30 mb-2 font-mono">Pillar 0{idx + 1}</span>
              <span className="text-white font-serif font-bold tracking-widest uppercase text-base">{pillar.label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

const ContractCTA = () => {
  const [copied, setCopied] = useState(false);
  const ca = "0x000000000000000000000000000000000000dead";

  const handleCopy = () => {
    copyToClipboard(ca);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="ca" className="py-32 bg-black border-y border-white/5 flex flex-col items-center">
      <motion.div whileInView={{ opacity: [0, 1], y: [20, 0] }} className="text-center px-4">
        <span className="text-white/20 text-[10px] uppercase tracking-[1em] block mb-10 font-mono">Verification</span>
        <div 
          onClick={handleCopy}
          className="relative group cursor-pointer border border-white/10 hover:border-white/40 px-6 md:px-12 py-6 rounded-sm bg-zinc-950/50 transition-all active:scale-95"
        >
          <p className="text-white/80 font-mono text-[10px] md:text-xl tracking-tight pr-10 overflow-hidden text-ellipsis">{ca}</p>
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
            <svg width="20" height="20" fill="white" viewBox="0 0 256 256"><path d="M216,40H88a16,16,0,0,0-16,16V72H56A16,16,0,0,0,40,88V216a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,216H56V88H184V216Zm32-32H200V88a16,16,0,0,0-16-16H88V56H216V184Z"></path></svg>
          </div>
          <AnimatePresence>
            {copied && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-4 py-1 uppercase"
              >
                Copied
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

const Manifesto = () => (
  <section id="manifesto" className="py-40 md:py-72 bg-black flex justify-center px-8 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 pointer-events-none">
       <div className="absolute top-1/4 left-1/4 w-full h-full max-w-[500px] max-h-[500px] bg-white/5 rounded-full blur-[150px]" />
    </div>
    <div className="max-w-6xl w-full relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <div className="w-full lg:w-1/2 lg:sticky lg:top-40 h-auto">
          <h2 className="text-white text-6xl md:text-9xl font-serif font-black uppercase leading-[0.85] tracking-tighter">
            The<br/>Manifesto
          </h2>
        </div>
        
        <div className="w-full lg:w-1/2 space-y-16 md:space-y-24 py-10 lg:py-20 border-l border-white/5 pl-8 md:pl-20">
          <p className="text-white text-3xl md:text-5xl font-serif font-light leading-snug tracking-tight">
            The market is not a chart. It is a <span className="font-bold italic underline decoration-white/20 underline-offset-8">race</span>. And in every race, there are those who follow the dust, and those who kick it up.
          </p>
          <div className="space-y-12">
            <p className="text-white/70 text-xl md:text-2xl font-light leading-relaxed">
              <span className="text-white font-bold">$HORSE</span> is not a meme. It is a cultural marker. Built for the sprint, sustained for the marathon. We are the digital vessel for the 2026 cycle.
            </p>
            <div className="h-px w-24 bg-white/20" />
            <p className="text-white/50 text-base md:text-lg uppercase tracking-[0.5em] leading-loose font-mono">
              Power in silence.<br/>Presence in motion.<br/>No noise.<br/>Just the inevitable gallop.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef(null);

  const handleEnter = () => {
    setIsReady(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      audioRef.current.volume = 0.3;
    }
  };

  return (
    <div className="bg-black text-white font-sans selection:bg-white selection:text-black min-h-screen">
      <audio ref={audioRef} loop preload="auto" src="bgmusic.mp3" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
        .font-serif { font-family: 'Playfair Display', ui-serif, Georgia, serif; }
        html { scroll-behavior: smooth; }
      `}} />

      <AnimatePresence>
        {!isReady && (
          <motion.div 
            exit={{ opacity: 0, y: -20 }}
            onClick={handleEnter}
            className="fixed inset-0 z-[5000] bg-black flex items-center justify-center cursor-pointer overflow-hidden"
          >
            {/* Background for the Entry Gate */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img 
                src="bg2.jpg" 
                alt="" 
                className="w-full h-full object-cover grayscale brightness-[0.6]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="relative z-10 text-center">
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-auto mb-10" />
              <p className="text-white text-[11px] tracking-[1.5em] uppercase font-bold opacity-60">Enter the Stable</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isReady ? "opacity-100 transition-opacity duration-[2s]" : "opacity-0 invisible h-0 overflow-hidden"}>
        <nav className="fixed top-0 w-full p-6 md:p-8 z-[100] flex justify-between items-center mix-blend-difference">
          <div className="flex items-center gap-4">
            <img src="logo.png" className="w-8 h-8 invert grayscale brightness-200" alt="Logo" onError={(e) => e.target.style.display='none'} />
            <span className="font-serif font-black tracking-[0.4em] uppercase text-xs">The Horse</span>
          </div>
          <div className="hidden md:flex gap-12 text-[10px] font-mono font-black uppercase tracking-[0.4em]">
            <a href="#cycle" className="hover:text-white/50 transition-colors">History</a>
            <a href="#ca" className="hover:text-white/50 transition-colors">Contract</a>
            <a href="#manifesto" className="hover:text-white/50 transition-colors">Manifesto</a>
          </div>
        </nav>

        <SovereignHero isReady={isReady} />
        
        <section className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
           <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover opacity-[0.15] grayscale scale-110 pointer-events-none">
             <source src="video.mp4" type="video/mp4" />
           </video>
           <div className="relative z-10 text-center max-w-5xl px-8">
              <motion.h2 whileInView={{ opacity: [0, 1], scale: [0.95, 1] }} className="text-[14vw] font-serif font-black uppercase tracking-tighter leading-none italic mb-12 opacity-80">
                UNBRIDLED
              </motion.h2>
              <p className="text-white/40 text-xl md:text-3xl font-serif font-light tracking-wide leading-relaxed max-w-4xl mx-auto">
                While the herd reacts to the news, <span className="text-white">$HORSE</span> anticipates the cycle. This is the culmination of sixty years of silence.
              </p>
           </div>
        </section>

        <KineticCycle />
        <ContractCTA />
        <Manifesto />
        <SovereignTriptych />

        <footer className="relative bg-black pt-40 pb-20 px-8 md:px-10 overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[35vw] font-serif font-black text-white/[0.02] uppercase select-none tracking-tighter">HORSE</span>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 items-start">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <img src="logo.png" className="w-14 h-14 grayscale brightness-200 invert" alt="Logo" onError={(e) => e.target.style.display='none'} />
                  <span className="text-3xl font-serif font-black tracking-[0.3em] uppercase text-white">The Horse</span>
                </div>
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Status: Unconquered // Cycle: 2026</div>
              </div>

              <div className="flex flex-col gap-6 border-l border-white/10 pl-10">
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.4em] leading-relaxed">Established for the 2026 cycle.</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.4em] leading-relaxed">Owned by the community.</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.4em] leading-relaxed">Led by the spirit of the race.</p>
              </div>

              <div className="flex gap-16 md:justify-end items-center py-4">
                {[
                  { label: 'Buy', url: '#' },
                  { label: 'X', url: 'https://x.com' }
                ].map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="group relative inline-block text-[11px] font-black uppercase tracking-[0.8em] transition-all">
                    <span className="relative z-10 group-hover:text-white text-white/40 transition-colors">{link.label}</span>
                    <motion.div className="absolute bottom-[-10px] left-0 w-full h-[1px] bg-white/10 overflow-hidden">
                      <motion.div initial={{ x: "-100%" }} whileHover={{ x: "0%" }} transition={{ duration: 0.4, ease: "circOut" }} className="w-full h-full bg-white" />
                    </motion.div>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-[11px] text-white/10 uppercase tracking-[0.6em] font-mono">© 2026 THE HORSE • BEYOND THE HERD</span>
              <div className="flex gap-10 text-[9px] text-white/5 uppercase tracking-[0.5em] font-mono">
                <span>Signal: Prime</span>
                <span>Momentum: 100%</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-100" />
    </div>
  );
}