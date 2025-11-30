import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Twitter, ArrowUpRight, Trophy, Zap, MessageCircle, Heart, Repeat, Ban, TrendingUp, AlertTriangle, X as XIcon, Terminal, Power, Copy, Check, ScanLine } from 'lucide-react';

/* --- 1. GLOBAL STYLES & ANIMATIONS --- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Cinzel:wght@900&family=Comic+Neue:wght@700&family=Jacquard+12&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

    :root {
      --bg-color: #050505;
      --text-color: #eeeeee;
      --accent: #ccff00; /* Acid Green */
      --secondary: #ff00ff; /* Hot Magenta */
      --alert: #ff3333;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      overflow-x: hidden;
      cursor: crosshair;
      user-select: none;
    }

    ::-webkit-scrollbar { width: 4px; background: #111; }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

    .font-anton { font-family: 'Anton', sans-serif; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-mono { font-family: 'Space Mono', monospace; }
    .font-comic { font-family: 'Comic Neue', cursive; }
    .font-gothic { font-family: 'Jacquard 12', cursive; }

    /* Noise Overlay */
    .noise {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none; z-index: 50; opacity: 0.05;
      background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
    }

    /* Main Background Drifters - Strong Physics */
    @keyframes slow-drift {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
        50% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0.05; }
        100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
    }
    .w-drifter {
        animation: slow-drift var(--duration) linear infinite;
        will-change: transform, opacity;
    }

    /* Glitch Animation */
    .hover-glitch:hover {
      animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
      color: var(--accent);
      text-shadow: 4px 4px 0px var(--secondary);
    }
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-4px, 4px); }
      40% { transform: translate(-4px, -4px); }
      60% { transform: translate(4px, 4px); }
      80% { transform: translate(4px, -4px); }
      100% { transform: translate(0); }
    }

    /* Elastic Scroll Effect */
    .elastic-content {
      transition: transform 0.1s cubic-bezier(0.1, 0.7, 1.0, 0.1);
      will-change: transform;
    }

    /* Tweet Cards */
    .tweet-card {
      transition: all 0.3s ease;
      transform-style: preserve-3d;
      background: #0a0a0a;
    }
    .tweet-card:hover {
      transform: scale(1.02) rotateZ(-1deg);
      box-shadow: 8px 8px 0px var(--accent) !important;
      z-index: 10;
      background: #111;
      border-color: var(--accent) !important;
    }

    /* Click Explosion */
    @keyframes pop-fade {
      0% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2.5) rotate(var(--rot)); opacity: 0; }
    }
    .click-w {
      position: fixed; pointer-events: none; z-index: 100;
      animation: pop-fade 0.6s ease-out forwards;
      font-weight: 900; text-shadow: 0 0 10px var(--accent);
    }

    /* Victory Flash */
    @keyframes flash-screen {
      0% { filter: invert(0); } 10% { filter: invert(1); } 30% { filter: invert(0); } 50% { filter: invert(1); } 100% { filter: invert(0); }
    }
    .victory-mode { animation: flash-screen 0.5s ease-out; }

    /* Cursor Trail */
    .trail-w {
      position: fixed; pointer-events: none; z-index: 9999;
      font-weight: bold; color: var(--accent);
      font-family: 'Space Mono', monospace;
      animation: trail-fade 0.8s forwards;
    }
    @keyframes trail-fade {
      0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
      100% { opacity: 0; transform: scale(0.2) rotate(180deg); }
    }

    /* --- SPECIAL EFFECTS FOR "ENTER THE ARENA" BUTTON --- */
    @keyframes scanline-sweep {
      0% { top: -100%; opacity: 0; }
      50% { opacity: 1; }
      100% { top: 200%; opacity: 0; }
    }
    .group:hover .scanline {
      animation: scanline-sweep 1s linear infinite;
    }
  `}</style>
);

/* --- 2. SOUND ENGINE --- */
const SoundEngine = {
    ctx: null,
    arenaOsc: null,
    arenaGain: null,
    init: () => {
        if (!SoundEngine.ctx) SoundEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (SoundEngine.ctx && SoundEngine.ctx.state === 'suspended') SoundEngine.ctx.resume().catch(() => {});
    },
    playTone: (freq, type, duration, vol = 0.1) => {
        if (!SoundEngine.ctx) return;
        const osc = SoundEngine.ctx.createOscillator();
        const gain = SoundEngine.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, SoundEngine.ctx.currentTime);
        gain.gain.setValueAtTime(vol, SoundEngine.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, SoundEngine.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(SoundEngine.ctx.destination);
        osc.start();
        osc.stop(SoundEngine.ctx.currentTime + duration);
    },
    click: () => {
        SoundEngine.init();
        SoundEngine.playTone(150, 'square', 0.1);
        SoundEngine.playTone(100, 'sawtooth', 0.15);
    },
    startArenaLoop: () => {
        SoundEngine.init();
        if (!SoundEngine.ctx) return;
        if (SoundEngine.arenaOsc) SoundEngine.stopArenaLoop();
        const osc = SoundEngine.ctx.createOscillator();
        const gain = SoundEngine.ctx.createGain();
        osc.frequency.setValueAtTime(60, SoundEngine.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, SoundEngine.ctx.currentTime + 15);
        gain.gain.setValueAtTime(0.2, SoundEngine.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, SoundEngine.ctx.currentTime + 15);
        osc.connect(gain);
        gain.connect(SoundEngine.ctx.destination);
        osc.start();
        SoundEngine.arenaOsc = osc;
        SoundEngine.arenaGain = gain;
    },
    stopArenaLoop: () => {
        if (SoundEngine.arenaOsc && SoundEngine.ctx) {
            const now = SoundEngine.ctx.currentTime;
            SoundEngine.arenaGain.gain.cancelScheduledValues(now);
            SoundEngine.arenaGain.gain.setValueAtTime(SoundEngine.arenaGain.gain.value, now);
            SoundEngine.arenaGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            SoundEngine.arenaOsc.stop(now + 0.1);
            SoundEngine.arenaOsc = null;
            SoundEngine.arenaGain = null;
        }
    }
};

/* --- 3. DATA & CONFIG --- */
const MOCK_TWEETS = [
  // --- BATCH 1 ---
   {
    id: 1,
    handle: "@Jeremybtc",
    pfp: "/pfp1.jpg", // Changed to .jpg
    comments: "2",
    content: "Manifesting big W’s in november 🙏",
    likes: "9", retweets: "1", 
    rotation: "rotate-1",
    url: "https://x.com/Jeremybtc/status/1983924895927996450?s=20" 
  },
  {
    id: 2,
    handle: "@a1lon9",
    pfp: "/pfp2.jpg",
    comments: "8",
    content: "W Shadow",
    likes: "189", retweets: "11", 
    rotation: "-rotate-2",
    url: "https://x.com/a1lon9/status/1963049475858985395?s=20" 
  },
  {
    id: 3,
    handle: "@_Shadow36",
    pfp: "/pfp3.jpg",
    comments: "5",
    content: "W",
    likes: "33", retweets: "13", 
    rotation: "rotate-3", highlight: true,
    url: "https://x.com/_Shadow36/status/1991230419971273111?s=20" 
  },
  {
    id: 4,
    handle: "@_Shadow36",
    pfp: "/pfp3.jpg",
    comments: "10",
    content: "Absolute w",
    likes: "117", retweets: "24", 
    rotation: "-rotate-1",
    url: "https://x.com/_Shadow36/status/1983657988532666614?s=20" 
  },
  {
    id: 5,
    handle: "@Dior100x",
    pfp: "/pfp4.jpg",
    comments: "4",
    content: "W intern",
    likes: "21", retweets: "4", 
    rotation: "rotate-2",
    url: "https://x.com/Dior100x/status/1983623701963927984?s=20" 
  },

  // --- BATCH 2 ---
  {
    id: 6,
    handle: "@Pumpfun",
    pfp: "/pfp5.jpg",
    comments: "12",
    content: "W's in the chat",
    likes: "95", retweets: "8", 
    rotation: "rotate-1",
    url: "https://x.com/Pumpfun/status/1968806240667959415?s=20" 
  },
  {
    id: 7,
    handle: "@moonshot",
    pfp: "/pfp6.jpg",
    comments: "6",
    content: "Major W",
    likes: "28", retweets: "2", 
    rotation: "-rotate-2",
    url: "https://x.com/moonshot/status/1979269684269846813?s=20" 
  },
  {
    id: 8,
    handle: "@Pumpfun",
    pfp: "/pfp5.jpg",
    comments: "9",
    content: "W",
    likes: "41", retweets: "3", 
    rotation: "rotate-3",
    url: "https://x.com/Pumpfun/status/1969085770590794031?s=20" 
  },
  {
    id: 9,
    handle: "@solana",
    pfp: "/pfp7.jpg",
    comments: "15",
    content: "big W.\n\ncongrats on the raise!",
    likes: "34", retweets: "1", 
    rotation: "-rotate-1",
    url: "https://x.com/solana/status/1953492788353618245?s=20" 
  },
  {
    id: 10,
    handle: "@its_braz",
    pfp: "/pfp8.jpg",
    comments: "3",
    content: "W stream ❤️",
    likes: "45", retweets: "2", 
    rotation: "rotate-2",
    url: "https://x.com/its_braz/status/1992617053535326502?s=20" 
  },
  {
    id: 11,
    handle: "@solana",
    pfp: "/pfp7.jpg",
    comments: "22",
    content: "W\nW\nW\nW\nW\n\nam I doing this right",
    likes: "75", retweets: "6", 
    rotation: "-rotate-3",
    url: "https://x.com/solana/status/1955997644729540673?s=20" 
  },
  {
    id: 13,
    handle: "@_Shadow36",
    pfp: "/pfp3.jpg",
    comments: "14",
    content: "Huge W",
    likes: "56", retweets: "3", 
    rotation: "-rotate-2",
    url: " https://x.com/_Shadow36/status/1993741950634127705?s=20 " 
  },
  {
    id: 14,
    handle: "@_Shadow36",
    pfp: "/pfp3.jpg",
    comments: "28",
    content: "Fuckin W",
    likes: "108", retweets: "4", 
    rotation: "rotate-2",
    url: " https://x.com/_Shadow36/status/1993104819092156824?s=20 " 
  }

];

const DID_YOU_KNOW_FACTS = [
    "Winning is 10% luck, 20% skill, and 70% holding $W until your hands turn into diamonds.",
    "Scientists have confirmed that the shape of the letter 'W' is aerodynamically incapable of losing.",
    "If you type 'W' 10,000 times, your portfolio automatically goes up. (Not financial advice).",
    "The letter 'L' was invented by the government to keep you humble. Reject it.",
    "In ancient Rome, gladiators didn't say 'goodbye', they whispered 'W' and walked away backwards.",
    "Your keyboard has a W key for a reason. Use it or lose it.",
    "Gravity is just the earth trying to give you an L. Jump to assert dominance.",
    "A double U is literally twice the value of a single U. Do the math.",
    "This website consumes 0% electricity and 100% pure adrenaline.",
    "Fact: 99% of people who don't buy $W eventually regret it in the metaverse."
];

/* --- 4. SUB-COMPONENTS --- */

// SCROLL PROGRESS BAR
const ScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setProgress(Number(scroll));
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <div className="fixed top-0 left-0 h-1 bg-[var(--accent)] z-[100] transition-all duration-100 ease-out shadow-[0_0_10px_var(--accent)]" style={{ width: `${progress * 100}%` }} />
    );
};

// CONTRACT ADDRESS
const ContractAddress = () => {
    const [copied, setCopied] = useState(false);
    const ca = "0xW000000000000000000000000000000000000000"; 
    const handleCopy = (e) => {
        e.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ca).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
        }
    };
    return (
        <div className="group relative flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-4 py-2 mt-8 mb-4 font-mono text-xs md:text-sm text-neutral-400 hover:border-[var(--accent)] hover:text-white transition-all cursor-pointer select-none overflow-hidden" onClick={handleCopy}>
            <span className="text-[var(--accent)] font-bold">CA:</span>
            <span className="truncate max-w-[150px] md:max-w-xs">{ca}</span>
            <div className="ml-2 w-px h-4 bg-neutral-700 group-hover:bg-[var(--accent)]"></div>
            {copied ? <Check size={16} className="text-[var(--accent)]" /> : <Copy size={16} />}
            {copied && <div className="absolute inset-0 bg-[var(--accent)] text-black flex items-center justify-center font-bold tracking-widest animate-in slide-in-from-bottom duration-200">COPIED</div>}
        </div>
    );
};

// DOMINANCE INDEX
const DominanceIndex = ({ score }) => (
  <div className="fixed bottom-4 right-4 z-[9000] bg-black border border-[var(--accent)] p-3 font-mono text-xs md:text-sm text-[var(--accent)] uppercase tracking-wider select-none shadow-[0_0_10px_rgba(204,255,0,0.3)]">
    <span className="animate-pulse mr-2">●</span>
    Dominance Index: <span className="font-bold text-white">{score}</span> Ws
  </div>
);

// CURSOR TRAIL
const CursorTrail = () => {
  const [trail, setTrail] = useState([]);
  useEffect(() => {
    const handleMove = (e) => {
      if (Math.random() > 0.7) {
        const id = Date.now();
        setTrail(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setTrail(prev => prev.filter(p => p.id !== id)), 800);
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return <>{trail.map(p => (<div key={p.id} className="trail-w text-sm" style={{ left: p.x, top: p.y }}>W</div>))}</>;
};

// FLOATING BACKGROUND W'S (STRONG PHYSICS RESTORED)
const FloatingWs = () => {
  const [elements, setElements] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const fonts = ['font-anton', 'font-cinzel', 'font-mono', 'font-comic', 'font-gothic'];
    setElements(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.2 + 0.05,
      duration: `${Math.random() * 40 + 60}s`,
      dx: `${Math.random() * 200 - 100}px`, 
      dy: `${Math.random() * 200 - 100}px`,
      rot: `${Math.random() * 90 - 45}deg`
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
      {elements.map(el => (
        <div key={el.id} className={`absolute text-white select-none w-drifter ${el.font}`} style={{ left: `${el.x}%`, top: `${el.y}%`, fontSize: `${el.size}rem`, '--duration': el.duration, '--dx': el.dx, '--dy': el.dy, '--rot': el.rot, opacity: el.opacity }}>W</div>
      ))}
    </div>
  );
};

// VELOCITY MARQUEE
const VelocityMarquee = () => {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef();
  const lastScrollY = useRef(0);
  const phrases = ["NO Ls ALLOWED", "OMEGA WIN", "W IS THE CODE"]; 
  const animate = useCallback(() => {
    const currentScrollY = window.scrollY;
    const velocity = Math.abs(currentScrollY - lastScrollY.current);
    lastScrollY.current = currentScrollY;
    const speed = 2 + (velocity * 0.5); 
    setOffset(prev => (prev - speed) % 1000); 
    rafRef.current = requestAnimationFrame(animate);
  }, []);
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);
  return (
    <div className="relative w-full overflow-hidden bg-[var(--accent)] py-2 md:py-4 -rotate-2 scale-110 z-10 border-y-4 border-black mb-12">
      <div className="whitespace-nowrap font-black font-mono text-1xl md:text-2xl text-black flex items-center gap-8" style={{ transform: `translateX(${offset}px)` }}>
        {[...Array(20)].map((_, i) => <span key={i} className="flex items-center gap-8">{phrases[i % phrases.length]} <Ban size={32} strokeWidth={4} /></span>)}
      </div>
    </div>
  );
};

// TWEET CARD
const TweetCard = ({ tweet }) => {
    const { comments, url, rotation, isAlert, handle, highlight, code, retweets, likes, pfp } = tweet;
    return (
        <div className={`tweet-card w-full max-w-md mx-auto border border-neutral-800 p-6 mb-8 cursor-pointer relative overflow-hidden group ${rotation}`} onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--accent)] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 group-hover:border-[var(--accent)] transition-colors">
                        {pfp ? <img src={pfp} alt={handle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('fallback-w'); }} /> : null}
                        <div className={`w-full h-full items-center justify-center bg-neutral-800 text-[var(--accent)] font-bold hidden ${!pfp ? '!flex' : ''} fallback-w-content`}>W</div>
                        <style>{`.fallback-w .fallback-w-content { display: flex !important; }`}</style>
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-bold font-mono group-hover:text-[var(--accent)] ${isAlert ? 'text-red-500' : 'text-neutral-200'}`}>{handle}</span>
                        <span className="text-xs text-neutral-500 font-mono">@project_w</span>
                    </div>
                </div>
                <Twitter className="w-5 h-5 text-neutral-600 group-hover:text-blue-400 transition-colors" />
            </div>
            {code ? <div className="bg-black p-3 rounded border border-neutral-800 mb-4 font-mono text-xs text-green-400">{tweet.content}</div> : <p className={`text-xl mb-6 text-neutral-100 leading-snug font-mono ${highlight ? 'text-[var(--accent)]' : ''}`}>{tweet.content}</p>}
            <div className="flex justify-between text-neutral-500 text-sm font-mono relative z-10">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 hover:text-pink-500 transition-colors"><MessageCircle size={14} /> {comments}</span> 
                    <span className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat size={14} /> {retweets}</span>
                    <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={14} /> {likes}</span>
                </div>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">VIEW <ArrowUpRight size={14} /></span>
            </div>
        </div>
    );
};

// LIVE CHART
const LiveChartSection = () => (
    <div className="break-inside-avoid w-full border-4 border-[var(--accent)] bg-black mb-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 bg-[var(--accent)] text-black font-mono text-xs font-bold px-2 py-1 z-20">LIVE MARKET DATA // $W</div>
        <div className="w-full h-[400px] flex items-center justify-center bg-neutral-900 text-neutral-500 font-mono text-center p-8">
             <div className="flex flex-col items-center animate-pulse"><TrendingUp size={48} className="mb-4 text-[var(--accent)]"/><p>CHART FEED INITIALIZING...</p></div>
        </div>
    </div>
);

// DID YOU KNOW BOX
const DidYouKnowBox = () => {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const handleNext = (e) => { e.stopPropagation(); setAnimating(false); setTimeout(() => { setIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length); setAnimating(true); }, 10); };
    return (
        <div className="break-inside-avoid p-8 bg-[var(--accent)] text-black mb-8 transform rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer select-none relative overflow-hidden group" onClick={handleNext}>
             <div className="absolute top-2 right-2 opacity-50"><Repeat size={16}/></div>
             <h3 className="font-anton text-4xl uppercase mb-2">Did you know?</h3>
             <p className={`font-mono text-sm leading-relaxed ${animating ? 'fact-slide' : ''}`} key={index}>{DID_YOU_KNOW_FACTS[index]}</p>
             <p className="text-[10px] font-bold mt-4 opacity-60 uppercase tracking-widest">TAP FOR MORE TRUTH</p>
        </div>
    );
};

// ARENA MODE

const ArenaOverlay = ({ onExit }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    
    // UI State for Score
    // currentImpacts: How many walls hit in THIS throw
    const [currentImpacts, setCurrentImpacts] = useState(0);
    // bestImpacts: The record for a single throw
    const [bestImpacts, setBestImpacts] = useState(0);
    const [status, setStatus] = useState("IDLE");

    // Mutable Physics & Game State
    const state = useRef({
        // POSITION
        pos: { x: 0, y: 0 },
        // VELOCITY
        vel: { x: 0, y: 0 },
        // ROTATION
        rot: { x: 0, y: 0, z: 0 },
        rotVel: { x: 0.01, y: 0.02 },

        // INPUT
        mouse: { x: 0, y: 0 },
        prevMouse: { x: 0, y: 0 },
        isDragging: false,
        
        // VISUALS
        trail: [], 
        particles: [], 
        floatingTexts: [], 
        shake: 0, 
        
        frame: 0
    });

    const audioRef = useRef(null);

    // --- 3D MATH HELPER ---
    const project = (x, y, z, width, height, offsetX, offsetY) => {
        const scale = 500 / (500 + z); 
        const x2d = (x * scale) + (width / 2) + offsetX;
        const y2d = (y * scale) + (height / 2) + offsetY;
        return { x: x2d, y: y2d };
    };

    const rotateX = (x, y, z, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY = (x, y, z, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return { x: x * cos - z * sin, y, z: x * sin + z * cos };
    };

    // --- AUDIO SYSTEM ---
    const initAudio = () => {
        if (!audioRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            gain.gain.value = 0;

            const impactGain = ctx.createGain();
            impactGain.connect(ctx.destination);
            impactGain.gain.value = 0.5;

            audioRef.current = { ctx, osc, gain, impactGain };
        } else if (audioRef.current.ctx.state === 'suspended') {
            audioRef.current.ctx.resume();
        }
    };

    const playBounce = (intensity) => {
        if (!audioRef.current) return;
        const { ctx, impactGain } = audioRef.current;
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        osc.connect(impactGain);
        
        // Pitch goes up slightly with impact count to build tension? 
        // Or just consistent physics sound. Let's keep it consistent physics.
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        
        impactGain.gain.setValueAtTime(Math.min(intensity * 0.5, 0.5), t);
        impactGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
    };

    const updateAudio = (speed) => {
        if (!audioRef.current) return;
        const { ctx, osc, gain } = audioRef.current;
        const t = ctx.currentTime;
        const vol = Math.min(0.1, speed * 0.005); 
        gain.gain.setTargetAtTime(vol, t, 0.1);
        osc.frequency.setTargetAtTime(60 + (speed * 5), t, 0.1);
    };

    // --- VISUAL FX HELPERS ---
    const spawnParticles = (x, y, color, count, speed) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;
            state.current.particles.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    };

    const spawnFloatingText = (x, y, text, color) => {
        state.current.floatingTexts.push({
            x, y, text, color, life: 1.0, dy: -2
        });
    };

    // --- MAIN GAME LOOP ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // W GEOMETRY
        const baseW = 120;
        const h = 120;
        const d = 40; 
        const vRaw = [
            { x: -1.0, y: -0.8 }, { x: -0.8, y: -0.8 }, { x: -0.5, y: 0.5 },
            { x: 0.0, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: -0.8 },
            { x: 1.0, y: -0.8 }, { x: 0.6, y: 0.8 }, { x: 0.0, y: -0.2 },
            { x: -0.6, y: 0.8 }
        ];
        const vertices = [];
        vRaw.forEach(v => vertices.push({ x: v.x * baseW, y: v.y * h, z: -d }));
        vRaw.forEach(v => vertices.push({ x: v.x * baseW, y: v.y * h, z: d }));
        const edges = [
            [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,0],
            [10,11], [11,12], [12,13], [13,14], [14,15], [15,16], [16,17], [17,18], [18,19], [19,10],
            [0,10], [1,11], [2,12], [3,13], [4,14], [5,15], [6,16], [7,17], [8,18], [9,19]
        ];

        // --- INPUT HANDLING ---
        const handleStart = (x, y) => {
            if(!audioRef.current) initAudio();
            
            const cx = (canvas.width / 2) + state.current.pos.x;
            const cy = (canvas.height / 2) + state.current.pos.y;
            const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            
            if (dist < 150) {
                state.current.isDragging = true;
                state.current.prevMouse = { x, y };
                state.current.vel = { x: 0, y: 0 };
                state.current.rotVel = { x: 0, y: 0 };
                
                // RESET CURRENT THROW STATS
                setCurrentImpacts(0);
                setStatus("AIMING");
            }
        };

        const handleMove = (x, y) => {
            if (state.current.isDragging) {
                const dx = x - state.current.prevMouse.x;
                const dy = y - state.current.prevMouse.y;
                
                state.current.pos.x += dx;
                state.current.pos.y += dy;
                state.current.rot.y += dx * 0.005;
                state.current.rot.x -= dy * 0.005;
                
                state.current.vel = { x: dx, y: dy };
                state.current.rotVel = { x: dy * 0.002, y: -dx * 0.002 };

                state.current.prevMouse = { x, y };
            }
        };

        const handleEnd = () => {
            if (state.current.isDragging) {
                state.current.isDragging = false;
                setStatus("IN FLIGHT");
            }
        };

        window.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchstart', e => handleStart(e.touches[0].clientX, e.touches[0].clientY), {passive: false});
        canvas.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
        canvas.addEventListener('touchend', handleEnd);

        // --- RENDER & PHYSICS LOOP ---
        const render = () => {
            const { width, height } = canvas;
            state.current.frame++;
            
            // 1. UPDATE PHYSICS
            let hitWall = false;
            let impactPos = { x: 0, y: 0 };
            let currentSpeed = 0;

            if (!state.current.isDragging) {
                // Velocity
                state.current.pos.x += state.current.vel.x;
                state.current.pos.y += state.current.vel.y;
                
                // Friction (Air resistance)
                state.current.vel.x *= 0.995; // Very slight friction to allow bounces
                state.current.vel.y *= 0.995;
                state.current.rotVel.x *= 0.98;
                state.current.rotVel.y *= 0.98;

                // Rotation
                state.current.rot.x += state.current.rotVel.x;
                state.current.rot.y += state.current.rotVel.y;
                state.current.rot.y += 0.005; // Idle spin

                // Collision Bounds
                const boundsX = width / 2 - 100;
                const boundsY = height / 2 - 100;

                // --- WALL COLLISION CHECK ---

                // Check X (Left/Right)
                if (state.current.pos.x > boundsX) {
                    hitWall = true;
                    state.current.pos.x = boundsX;
                    state.current.vel.x *= -0.85; 
                    impactPos = { x: width, y: height/2 + state.current.pos.y };
                    state.current.rotVel.y += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.x);
                } else if (state.current.pos.x < -boundsX) {
                    hitWall = true;
                    state.current.pos.x = -boundsX;
                    state.current.vel.x *= -0.85;
                    impactPos = { x: 0, y: height/2 + state.current.pos.y };
                    state.current.rotVel.y += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.x);
                }
                
                // Check Y (Top/Bottom)
                if (state.current.pos.y > boundsY) {
                    hitWall = true;
                    state.current.pos.y = boundsY;
                    state.current.vel.y *= -0.85;
                    impactPos = { x: width/2 + state.current.pos.x, y: height };
                    state.current.rotVel.x += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.y);
                } else if (state.current.pos.y < -boundsY) {
                    hitWall = true;
                    state.current.pos.y = -boundsY;
                    state.current.vel.y *= -0.85;
                    impactPos = { x: width/2 + state.current.pos.x, y: 0 };
                    state.current.rotVel.x += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.y);
                }
            }

            // 2. HANDLE SCORING & IMPACTS
            if (hitWall && currentSpeed > 0.5) {
                // Increment impacts for this throw
                setCurrentImpacts(prev => {
                    const next = prev + 1;
                    // Check High Score
                    setBestImpacts(currBest => Math.max(currBest, next));
                    return next;
                });

                setStatus("IMPACT");
                playBounce(currentSpeed);
                
                // FX: Screen Shake
                state.current.shake = 5 + currentSpeed;

                // FX: Particles
                spawnParticles(impactPos.x, impactPos.y, '#ccff00', 15, 5 + currentSpeed);
                
                // FX: Floating Number
                spawnFloatingText(impactPos.x, impactPos.y, "+1", '#ccff00');
            }

            // Audio engine update
            const totalSpeed = Math.abs(state.current.vel.x) + Math.abs(state.current.vel.y);
            updateAudio(totalSpeed);

            // 3. DRAWING
            // Apply Screen Shake
            let shakeX = 0;
            let shakeY = 0;
            if (state.current.shake > 0) {
                shakeX = (Math.random() - 0.5) * state.current.shake;
                shakeY = (Math.random() - 0.5) * state.current.shake;
                state.current.shake *= 0.9; 
                if(state.current.shake < 0.5) state.current.shake = 0;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Clear
            ctx.fillStyle = '#050505';
            ctx.fillRect(-50, -50, width+100, height+100);

            // --- DRAW GRID ---
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1;
            
            const paraX = -state.current.pos.x * 0.1;
            const paraY = -state.current.pos.y * 0.1;
            const gridSize = 50;
            const gridOffsetX = (paraX % gridSize);
            const gridOffsetY = (paraY % gridSize);

            ctx.beginPath();
            for (let x = gridOffsetX; x < width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, height);
            }
            for (let y = gridOffsetY; y < height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(width, y);
            }
            ctx.stroke();

            // --- DRAW PARTICLES ---
            state.current.particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                p.size *= 0.95;
                if (p.life > 0) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                } else {
                    state.current.particles.splice(i, 1);
                }
            });

            // --- DRAW FLOATING TEXTS ---
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            state.current.floatingTexts.forEach((t, i) => {
                t.y += t.dy;
                t.life -= 0.02;
                t.dy *= 0.95;
                if (t.life > 0) {
                    ctx.fillStyle = t.color;
                    ctx.globalAlpha = t.life;
                    ctx.fillText(t.text, t.x, t.y);
                    ctx.globalAlpha = 1.0;
                } else {
                    state.current.floatingTexts.splice(i, 1);
                }
            });

            // --- DRAW 3D OBJECT ---
            const projectedPoints = vertices.map(v => {
                let r = rotateX(v.x, v.y, v.z, state.current.rot.x);
                r = rotateY(r.x, r.y, r.z, state.current.rot.y);
                return project(r.x, r.y, r.z, width, height, state.current.pos.x, state.current.pos.y);
            });

            if(state.current.frame % 2 === 0) {
                state.current.trail.push(projectedPoints);
                if (state.current.trail.length > 8) state.current.trail.shift();
            }

            state.current.trail.forEach((framePoints, index) => {
                ctx.strokeStyle = `rgba(204, 255, 0, ${index * 0.05})`; 
                ctx.lineWidth = 1;
                ctx.beginPath();
                edges.forEach(edge => {
                    const p1 = framePoints[edge[0]];
                    const p2 = framePoints[edge[1]];
                    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                });
                ctx.stroke();
            });

            ctx.strokeStyle = state.current.isDragging ? '#ffffff' : '#ccff00';
            ctx.lineWidth = 2;
            ctx.shadowBlur = state.current.isDragging ? 30 : 10;
            ctx.shadowColor = state.current.isDragging ? '#ffffff' : '#ccff00';

            ctx.beginPath();
            edges.forEach(edge => {
                const p1 = projectedPoints[edge[0]];
                const p2 = projectedPoints[edge[1]];
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            });
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            projectedPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
            });

            ctx.restore();
            requestRef.current = requestAnimationFrame(render);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        requestRef.current = requestAnimationFrame(render);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            if (audioRef.current && audioRef.current.ctx) audioRef.current.ctx.close();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-black cursor-grab active:cursor-grabbing overflow-hidden font-mono select-none touch-none text-[#ccff00]">
            <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
            
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none z-20">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-50 text-white">Hyper-Object_V4</h1>
                    
                    <div className="flex items-end gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-white/60">Current Impacts</span>
                            <span className="text-5xl font-black leading-none text-[#ccff00]">{currentImpacts}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-white/60">Session Best</span>
                            <span className="text-3xl font-bold leading-none text-white">{bestImpacts}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs border border-[#ccff00] px-2 py-1 inline-block bg-black/50 backdrop-blur">
                        STATUS: {status}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                 <button 
                    onClick={onExit} 
                    className="pointer-events-auto border border-white/20 bg-black/50 backdrop-blur px-8 py-2 hover:bg-[#ccff00] hover:text-black transition-all uppercase text-xs tracking-widest text-white/50"
                >
                    [ DISCONNECT ]
                </button>
            </div>
        </div>
    );
};

/* --- 5. MAIN APP --- */
const App = () => {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isVictoryMode, setIsVictoryMode] = useState(false);
  const [claimText, setClaimText] = useState("Claim Victory");
  const [dominanceScore, setDominanceScore] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [inArena, setInArena] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const lastScrollY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY.current;
      setScrollVelocity(v => v * 0.9 + velocity * 0.1);
      lastScrollY.current = currentScrollY;
      setScrolled(currentScrollY > 50); // TRIGGER FOR LOGO CHANGE
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { setScrollVelocity(v => { if (Math.abs(v) < 0.1) return 0; return v * 0.8; }); }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fonts = ['font-anton', 'font-cinzel', 'font-mono', 'font-comic', 'font-gothic'];
    const handleClick = (e) => {
      SoundEngine.init(); SoundEngine.click(); setDominanceScore(prev => prev + 1); 
      const id = Date.now();
      const newClick = { id, x: e.clientX, y: e.clientY, rot: Math.random() * 90 - 45 + 'deg', font: fonts[Math.floor(Math.random() * fonts.length)], color: Math.random() > 0.5 ? 'var(--accent)' : '#fff' };
      setClicks(prev => [...prev, newClick]);
      setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 700);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleClaimVictory = (e) => { e.stopPropagation(); setIsVictoryMode(true); setClaimText("WINNER DETECTED"); setTimeout(() => setIsVictoryMode(false), 600); setTimeout(() => setClaimText("Claim Victory"), 3000); };
  const skewAmount = Math.min(Math.max(scrollVelocity * 0.2, -10), 10);

  useEffect(() => { const timer = setTimeout(() => setHeroVisible(true), 300); return () => clearTimeout(timer); }, []);

  if (inArena) return <><GlobalStyles /><ArenaOverlay onExit={() => setInArena(false)} /></>;

  return (
    <div className={`min-h-screen bg-black text-white overflow-x-hidden selection:bg-[var(--accent)] selection:text-black ${isVictoryMode ? 'victory-mode' : ''}`}>
      <GlobalStyles />
      <div className="noise" />
      <ScrollProgress />
      <FloatingWs />
      <CursorTrail />
      <DominanceIndex score={dominanceScore} />

      {/* CLICKS */}
      {clicks.map(c => (<div key={c.id} className={`click-w text-4xl ${c.font}`} style={{ left: c.x, top: c.y, '--rot': c.rot, color: c.color }}>W</div>))}

      {/* REACTIVE LOGO HUD */}
      <div 
        className={`fixed top-0 left-0 p-6 z-50 transition-all duration-500 ease-out ${scrolled ? 'scale-75 backdrop-blur-md border-b border-[var(--accent)] bg-black/50' : ''}`}
        style={{ width: scrolled ? 'auto' : '100%', borderRadius: scrolled ? '0 0 20px 0' : '0' }}
      >
        <div className="hover:scale-110 transition-transform cursor-pointer flex items-center gap-4">
            <img 
                src="/logo.png" 
                alt="Project W Logo" 
                className={`h-12 md:h-16 w-auto object-contain transition-all ${scrolled ? 'logo-alive' : ''}`}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                onClick={(e) => e.stopPropagation()} 
            />
            <div className="hidden text-4xl font-black font-anton tracking-tighter" onClick={(e) => e.stopPropagation()}>W</div>
            
            {/* Scrolled Data Stream Effect */}
            <div className={`overflow-hidden transition-all duration-500 ${scrolled ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                 <div className="font-mono text-[10px] text-[var(--accent)] leading-none whitespace-nowrap">
                    SYSTEM: ONLINE<br/>
                    TARGET: MOON<br/>
                    VIBE: IMMACULATE
                 </div>
            </div>
        </div>
      </div>

      {/* ACQUIRE BUTTON (FIXED TOP RIGHT) */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          className="border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-2 md:px-8 md:py-2 rounded-full font-mono text-xs md:text-sm bg-black hover:bg-[var(--accent)] hover:text-black transition-all hover:scale-105 hover:rotate-2 uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
          onClick={(e) => { e.stopPropagation(); window.open('https://app.uniswap.org/', '_blank'); }}
        >
          <span>ACQUIRE $W</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-4 z-10">
        <div className="elastic-content text-center flex flex-col items-center" style={{ transform: `skewY(${skewAmount}deg)` }}>
          <div className="mb-4 text-[var(--accent)] font-mono text-sm tracking-[0.5em] animate-bounce">TICKER: $W</div>
          
          <div className="text-[15vw] leading-[0.8] font-black font-anton uppercase mb-4 cursor-default select-none hover-glitch mix-blend-screen transition-transform duration-100 hover:scale-110 hover:skew-x-12" onClick={(e) => {}}>
             JUST<br />WIN
          </div>

          <ContractAddress />

          <p className="max-w-xl text-center text-neutral-400 font-mono text-lg md:text-xl leading-relaxed mb-12 mix-blend-exclusion select-none px-4">
            Not a project. A state of being. The ticker is $W. The vibe is absolute victory. Welcome to the winner's circle.
          </p>

          {/* THE NEW "ENTER THE ARENA" CYBER-BUTTON */}
          <div className={`transition-opacity duration-1000 delay-300 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                className="group relative px-10 py-4 bg-transparent border-2 border-dashed border-[var(--accent)] text-[var(--accent)] font-mono text-lg uppercase tracking-[0.2em] overflow-hidden hover:border-solid hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
                onClick={(e) => { e.stopPropagation(); setInArena(true); }}
              >
                <span className="relative z-10 font-bold flex items-center gap-2">
                    Hyper Object <ScanLine className="hidden group-hover:block animate-spin" size={11}/>
                </span>
                {/* Scanline Effect */}
                <div className="scanline absolute left-0 w-full h-[2px] bg-white opacity-50 z-0 pointer-events-none" />
              </button>
          </div>
        </div>
      </section>

      <VelocityMarquee />

      {/* FEED */}
      <section className="relative z-20 pb-24 px-4 md:px-12 bg-black/50 backdrop-blur-sm">
        <div className="mb-24 text-center">
          <h2 className="text-6xl md:text-8xl font-anton text-white mb-4 transform -rotate-2 select-none">THE FEED</h2>
          <div className="w-24 h-2 bg-[var(--accent)] mx-auto animate-pulse" />
        </div>

        <div ref={containerRef} className="elastic-content max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8" style={{ transform: `skewY(${skewAmount * 0.5}deg)` }}>
          <LiveChartSection />
          {MOCK_TWEETS.map((tweet) => ( <div key={tweet.id} className="break-inside-avoid"><TweetCard tweet={tweet} /></div> ))}
          <DidYouKnowBox />
          <div className={`break-inside-avoid p-12 border-4 ${claimText === 'WINNER DETECTED' ? 'border-[var(--accent)] bg-[var(--accent)] text-black scale-110' : 'border-white text-white hover:bg-white hover:text-black'} mb-8 text-center transition-all duration-100 cursor-pointer group select-none`} onClick={handleClaimVictory}>
            <Trophy size={64} className={`mx-auto mb-4 ${claimText === 'WINNER DETECTED' ? 'animate-bounce' : 'group-hover:animate-spin'}`} />
            <h3 className="font-cinzel text-2xl font-bold">{claimText}</h3>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 py-24 bg-[var(--accent)] text-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           {Array.from({length: 10}).map((_, i) => (
             <div key={i} className="absolute text-9xl font-black" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: `rotate(${Math.random() * 360}deg) translateY(${scrollVelocity * 0.5}px)` }}>W</div>
           ))}
        </div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-end">
          <div>
            <h2 className="text-9xl font-black font-anton leading-none tracking-tighter mb-4 select-none">KEEP<br/>WINNING</h2>
            <div className="flex gap-4 font-mono text-sm uppercase font-bold tracking-widest">
              <a href="#" className="hover:underline decoration-4">X</a>
              <a href="#" className="hover:underline decoration-4">Community</a>
              <a href="#" className="hover:underline decoration-4">Chart</a>
            </div>
          </div>
          <div className="mt-12 md:mt-0 text-right"><p className="font-mono text-xs max-w-xs ml-auto mb-4 font-bold">Paper hands are a myth. We only know diamond grips and green candles. This is financial advice: Win.</p><div className="text-4xl font-gothic animate-pulse">© 2025</div></div>
        </div>
      </footer>
    </div>
  );
};

export default App;