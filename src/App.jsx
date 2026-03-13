import { useState, useEffect, useRef } from "react";

const SECTIONS = ["Home","About","Experience","Projects","Skills","Publications","Contact"];

// ──── HOOKS ────
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) setActive(x.target.id); }), { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return active;
}

function FadeIn({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("fi-visible"); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`fi ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const s = performance.now(), n = parseFloat(String(end).replace(/[^0-9.]/g, ""));
        const step = now => { const t = Math.min((now - s) / 2000, 1); setVal((1 - Math.pow(1 - t, 3)) * n); if (t < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{String(end).includes(".") ? val.toFixed(2) : Math.round(val)}{suffix}</span>;
}

// ──── NEURAL NETWORK + DIGITAL RAIN CANVAS ────
function NeuralRain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
      r: Math.random() * 2 + 1, col: Math.random() > .5 ? [6,182,212] : [16,185,129],
      pulse: Math.random() * Math.PI * 2
    }));
    const fontSize = 12;
    const cols = Math.ceil(c.width / fontSize);
    const drops = Array.from({ length: cols }, () => -Math.random() * 100);
    const chars = "01アイウエオカキクケコ∑∫∂∇λσμ";
    const draw = () => {
      ctx.fillStyle = "rgba(3,3,6,.06)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > .97) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize, y = drops[i] * fontSize;
          const alpha = .08 + Math.random() * .06;
          ctx.fillStyle = Math.random() > .5 ? `rgba(6,182,212,${alpha})` : `rgba(16,185,129,${alpha})`;
          ctx.fillText(char, x, y);
        }
        drops[i] += .3;
        if (drops[i] * fontSize > c.height && Math.random() > .99) drops[i] = 0;
      }
      const now = Date.now() * .001;
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = c.width; if (n.x > c.width) n.x = 0;
        if (n.y < 0) n.y = c.height; if (n.y > c.height) n.y = 0;
        const pulse = .4 + Math.sin(now * 1.5 + n.pulse) * .2;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.col.join(",")},${pulse * .15})`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.col.join(",")},${pulse})`; ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = n.x - nodes[j].x, dy = n.y - nodes[j].y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const progress = ((now * 30 + i * 50) % 100) / 100;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${n.col.join(",")},${.1 * (1 - dist / 160)})`; ctx.lineWidth = .5; ctx.stroke();
            if (dist < 100 && Math.random() > .98) {
              const px = n.x + (nodes[j].x - n.x) * progress, py = n.y + (nodes[j].y - n.y) * progress;
              ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${n.col.join(",")},.6)`; ctx.fill();
            }
          }
        }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: .8 }} />;
}

function TypeWriter({ words, className }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[idx];
    const t = setTimeout(() => {
      if (!del) { setText(w.slice(0, text.length + 1)); if (text.length + 1 === w.length) setTimeout(() => setDel(true), 2200); }
      else { setText(w.slice(0, text.length - 1)); if (!text.length) { setDel(false); setIdx((idx + 1) % words.length); } }
    }, del ? 30 : 60);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);
  return <span className={className}>{text}<span className="cursor-blink text-cyan-400 ml-0.5">▊</span></span>;
}

function CursorGlow() {
  const [p, setP] = useState({ x: -999, y: -999 });
  useEffect(() => { const fn = e => setP({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", fn); return () => window.removeEventListener("mousemove", fn); }, []);
  return <div className="fixed pointer-events-none z-30 hidden lg:block" style={{ left: p.x - 220, top: p.y - 220, width: 440, height: 440, background: "radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 65%)", transition: "left .08s ease-out, top .08s ease-out" }} />;
}

function MBtn({ children, className, href, ...props }) {
  const ref = useRef(null);
  const [o, setO] = useState({ x: 0, y: 0 });
  const move = e => { const r = ref.current.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * .15, y: (e.clientY - r.top - r.height / 2) * .15 }); };
  const Tag = href ? "a" : "button";
  return <Tag ref={ref} href={href} className={`clickable ${className}`} onMouseMove={move} onMouseLeave={() => setO({ x: 0, y: 0 })} style={{ transform: `translate(${o.x}px,${o.y}px)`, transition: "transform .3s cubic-bezier(.23,1,.32,1)" }} {...props}>{children}</Tag>;
}

// ──── BOOT SEQUENCE ────
function BootSequence() {
  const [visible, setVisible] = useState(true);
  const [lines, setLines] = useState([]);
  const bootLines = [
    "[SYS] Initializing neural subsystems...",
    "[GPU] CUDA cores allocated: 8,192",
    "[DATA] Loading 41.29M patient records...",
    "[BMS] Connecting to battery telemetry...",
    "[MODEL] AUC validation: 0.8534 ✓",
    "[SYS] Portfolio rendering complete.",
    "[SYS] Welcome."
  ];
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) { setLines(prev => [...prev, bootLines[i]]); i++; }
      else { clearInterval(interval); setTimeout(() => setVisible(false), 600); }
    }, 180);
    return () => clearInterval(interval);
  }, []);
  if (!visible) return null;
  return (
    <div className={`fixed inset-0 z-[100] bg-[#030306] flex items-center justify-center transition-opacity duration-500 ${lines.length >= bootLines.length ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <div className="max-w-lg w-full px-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-[#030306] font-black text-[10px]" style={{ fontFamily: "Syne, sans-serif" }}>SR</div>
          <span className="text-white/40 text-xs font-mono font-bold tracking-wider">SYSTEM BOOT v3.2.1</span>
        </div>
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <div key={i} className="font-mono text-xs tracking-wide" style={{ color: line.includes("✓") ? "#10b981" : line.includes("Welcome") ? "#06b6d4" : "rgba(255,255,255,.45)" }}>{line}</div>
          ))}
          {lines.length < bootLines.length && <span className="inline-block w-2 h-3 bg-cyan-400 animate-pulse" />}
        </div>
        <div className="mt-6 h-1 bg-white/[.06] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(lines.length / bootLines.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ──── ANOMALY GRAPH ────
function AnomalyGraph() {
  const [hov, setHov] = useState(false);
  const [anom, setAnom] = useState(false);
  const cRef = useRef(null);
  useEffect(() => {
    const c = cRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = 300, H = 95;
    c.width = W * 2; c.height = H * 2; c.style.width = W + "px"; c.style.height = H + "px"; ctx.scale(2, 2);
    let t = 0, id;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(6,182,212,.05)"; ctx.lineWidth = .5;
      for (let y = 0; y < H; y += 15) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (let x = 0; x < W; x += 15) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.beginPath(); ctx.strokeStyle = anom ? "rgba(239,68,68,.8)" : "rgba(6,182,212,.7)"; ctx.lineWidth = 1.5;
      for (let x = 0; x < W; x++) { const n = Math.sin((x+t)*.04)*12+Math.sin((x+t)*.08)*6; const spike = anom && x>W*.55 && x<W*.7 ? Math.sin((x-W*.55)*.15)*28:0; const y=H/2+n+spike+Math.random()*1.5; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
      ctx.stroke();
      ctx.beginPath(); ctx.strokeStyle = anom ? "rgba(251,191,36,.6)" : "rgba(16,185,129,.5)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x++) { const y=H/2+8+Math.sin((x+t)*.03+1)*8+Math.cos((x+t)*.07)*4+(anom&&x>W*.6?15:0); x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
      ctx.stroke();
      t += hov ? 2.5 : 1; id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [hov, anom]);
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[.08] bg-black/40 cursor-crosshair group"
      onMouseEnter={() => { setHov(true); setTimeout(() => setAnom(true), 600); }}
      onMouseLeave={() => { setHov(false); setAnom(false); }}>
      <div className="absolute top-2.5 left-3 flex items-center gap-2 z-10">
        <span className={`w-2 h-2 rounded-full ${anom ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`} />
        <span className={`text-[9px] font-mono font-bold tracking-wider ${anom ? "text-red-400/80" : "text-white/45"}`}>{anom ? "⚠ ANOMALY DETECTED" : "CELL VOLTAGE MONITOR"}</span>
      </div>
      <div className="absolute top-2.5 right-3 z-10"><span className={`text-[9px] font-mono font-bold ${anom ? "text-red-400" : "text-emerald-400/70"}`}>{anom ? "THERMAL RISK" : "NOMINAL"}</span></div>
      <canvas ref={cRef} className="block" />
      {anom && <div className="absolute bottom-2 left-3 right-3 bg-red-500/10 border border-red-500/25 rounded px-2 py-1 animate-pulse"><span className="text-red-400 text-[9px] font-mono font-bold">Imbalance detected 180s before failure → Preventive shutdown initiated</span></div>}
    </div>
  );
}

function ECGLine() {
  return (
    <div className="relative h-6 overflow-hidden opacity-30">
      <svg viewBox="0 0 200 30" className="w-full h-full ecg-anim" preserveAspectRatio="none">
        <path d="M0,15 L30,15 L35,15 L40,5 L45,25 L50,10 L55,20 L60,15 L90,15 L95,15 L100,5 L105,25 L110,10 L115,20 L120,15 L150,15 L155,15 L160,5 L165,25 L170,10 L175,20 L180,15 L200,15" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function StatusTicker() {
  const items = ["SYS.STATUS: ONLINE","EPOCH 847/1000","LOSS: 0.0019","AUC: 0.8534","BATTERY TEMP: 23.4°C","SOH: 94.2%","RUL: 2847 CYCLES","RECORDS: 41,293,847","PIPELINE: ACTIVE","INFERENCE: 12ms"];
  return (
    <div className="overflow-hidden border-t border-b border-white/[.05] py-2 bg-black/30">
      <div className="flex ticker-scroll whitespace-nowrap">
        {[...items,...items,...items].map((t,i) => <span key={i} className="mx-4 text-[10px] font-mono text-emerald-500/40 tracking-wider font-bold shrink-0">{t}<span className="mx-4 text-cyan-500/20">│</span></span>)}
      </div>
    </div>
  );
}

function Marquee() {
  const items = ["Healthcare AI","Battery Analytics","Deep Learning","Data Engineering","Causal Inference","BMS Systems","Cancer Prediction","ETL Pipelines","LLM / RAG","Anomaly Detection"];
  return (
    <div className="overflow-hidden py-5 border-y border-white/[.05]">
      <div className="flex marquee-scroll whitespace-nowrap">
        {[...items,...items,...items].map((t,i) => <span key={i} className="mx-6 text-white/[.08] text-base font-black uppercase tracking-[.25em] shrink-0">{t}<span className="mx-6 text-cyan-500/20">◆</span></span>)}
      </div>
    </div>
  );
}

function EnergyBar() {
  const [p, setP] = useState(0);
  useEffect(() => { const fn = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setP(h > 0 ? (window.scrollY / h) * 100 : 0); }; window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-2">
      <span className="text-[8px] font-mono text-white/30 tracking-wider font-bold" style={{ writingMode: "vertical-rl" }}>SCROLL</span>
      <div className="w-[3px] h-32 bg-white/[.06] rounded-full overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-emerald-500 rounded-full transition-all duration-200" style={{ height: `${p}%` }} />
      </div>
      <span className="text-[8px] font-mono text-cyan-500/60 font-bold">{Math.round(p)}%</span>
    </div>
  );
}

// ──── NAV ────
function Nav({ active }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => { const fn = () => { setScrolled(window.scrollY > 60); const h = document.documentElement.scrollHeight - window.innerHeight; setProgress(h > 0 ? (window.scrollY / h) * 100 : 0); }; window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#030306]/92 backdrop-blur-2xl border-b border-white/[.05]" : "bg-transparent"}`}>
      <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#Home" className="clickable flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-[#030306] font-black text-sm tracking-tighter group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/25" style={{ fontFamily: "Syne, sans-serif" }}>SR<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" /></div>
          <span className="text-white font-extrabold tracking-tight text-base hidden sm:inline" style={{ fontFamily: "Syne, sans-serif" }}>Srii Rohit Prakash</span>
        </a>
        <div className="hidden md:flex items-center gap-0.5">
          {SECTIONS.map(s => (
            <a key={s} href={`#${s}`} className={`clickable relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${active === s ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              {s}{active === s && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 mr-30">
          <MBtn href="mailto:sprakash1@binghamton.edu" className="hidden sm:flex px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#030306] text-xs font-black shadow-lg shadow-cyan-500/30 items-center gap-2 tracking-wide">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-[#030306]/50" /><span className="relative rounded-full h-2 w-2 bg-[#030306]" /></span>
            OPEN TO WORK
          </MBtn>
          <button onClick={() => setOpen(!open)} className="clickable md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5">
            <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${open ? "rotate-45 translate-y-1" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${open ? "-rotate-45 -translate-y-1" : ""}`} />
          </button>
        </div>
      </div>
      {open && <div className="md:hidden bg-[#030306]/95 backdrop-blur-2xl border-t border-white/5 pb-6">{SECTIONS.map(s => <a key={s} href={`#${s}`} onClick={() => setOpen(false)} className="clickable block px-8 py-3 text-white/60 hover:text-white text-sm font-bold">{s}</a>)}</div>}
    </nav>
  );
}

// ──── HERO ────
function Hero() {
  return (
    <section id="Home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none scanline-overlay" />
      <div className="absolute inset-0 opacity-[.015]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-[.06]" style={{ background: "radial-gradient(circle, rgba(6,182,212,.4), transparent 55%)", animation: "pulse-slow 6s ease-in-out infinite" }} />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-8 w-full">
        <FadeIn>
          <div className="flex flex-wrap gap-3 mb-8">
            {[["HEALTHCARE AI","bg-cyan-500/15 border-cyan-500/30 text-cyan-300"],["BATTERY & ENERGY","bg-emerald-500/15 border-emerald-500/30 text-emerald-300"],["DATA SCIENCE","bg-violet-500/15 border-violet-500/30 text-violet-300"]].map(([t,c]) => (
              <span key={t} className={`px-3.5 py-1.5 rounded-full border text-[10px] font-black tracking-[.2em] ${c}`}>{t}</span>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <h1 className="hero-title text-6xl sm:text-8xl lg:text-[8rem] text-white leading-[.85] tracking-tighter">
            <span className="glitch-text" data-text="Srii Rohit">Srii Rohit</span><br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Prakash</span>
              <svg className="absolute -bottom-3 left-0 w-full" height="10" viewBox="0 0 400 10" fill="none"><path d="M0 7C100 1 300 1 400 7" stroke="url(#ug)" strokeWidth="4" strokeLinecap="round"/><defs><linearGradient id="ug" x1="0" x2="400"><stop stopColor="#06b6d4"/><stop offset="1" stopColor="#10b981"/></linearGradient></defs></svg>
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-10 max-w-2xl">
            <TypeWriter words={["AI/ML Engineer & Data Scientist","Healthcare AI Researcher","Battery Analytics Engineer","Full-Stack AI Developer"]} className="text-white font-extrabold text-xl sm:text-2xl" />
            <p className="text-white/65 text-lg sm:text-xl leading-relaxed mt-4 font-semibold">
              Building <span className="text-cyan-400 font-bold">life-critical predictive systems</span> in healthcare and <span className="text-emerald-400 font-bold">intelligent energy storage</span> solutions.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="mt-12 flex flex-wrap gap-4">
            <MBtn href="#Projects" className="group px-8 py-4 rounded-full bg-white text-[#030306] text-sm font-black tracking-wide shadow-xl shadow-white/10 flex items-center gap-2 hover:shadow-white/25 transition-shadow">
              VIEW PROJECTS<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </MBtn>
            <MBtn href="#Experience" className="px-8 py-4 rounded-full border-2 border-white/20 text-white/75 text-sm font-bold tracking-wide hover:bg-white/5 hover:border-white/35 transition-all">MY EXPERIENCE</MBtn>
          </div>
        </FadeIn>
        <FadeIn delay={450}>
          <div className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-white/[.07] pt-10">
            {[{ end:"40",suf:"M+",label:"Patient Records Analyzed" },{ end:"1.78",suf:"M+",label:"Battery Records Processed" },{ end:"0.85",suf:"",label:"AUC Cancer Prediction" },{ end:"4",suf:"",label:"Publications" }].map((s,i) => (
              <div key={i} className="group cursor-default">
                <div className="text-4xl sm:text-5xl font-black font-mono bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left"><Counter end={s.end} suffix={s.suf} /></div>
                <div className="text-white/45 text-xs mt-2 font-bold tracking-wider uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
      <div className="absolute bottom-0 left-0 w-full z-10"><StatusTicker /></div>
    </section>
  );
}

// ──── ABOUT ────
function About() {
  return (
    <section id="About" className="relative py-28 overflow-hidden z-10">
      <Marquee />
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <FadeIn><div className="flex items-center gap-3 mb-4"><div className="w-14 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500" /><span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// ABOUT</span></div></FadeIn>
        <div className="grid lg:grid-cols-5 gap-12">
          <FadeIn className="lg:col-span-3">
            <h2 className="section-heading text-3xl sm:text-5xl text-white leading-tight mb-8">
              Bridging <span className="text-cyan-400">life-critical reliability</span> and <span className="text-emerald-400">high-density power engineering</span>
            </h2>
            <div className="space-y-5 text-white/70 leading-relaxed text-base font-medium">
              <p>I apply rigorous data science and AI/ML across two of the most demanding domains. In healthcare, I build neural network frameworks analyzing <strong className="text-white font-bold">40M+ patient records</strong> to predict cancer metastasis. In energy, I architect end-to-end pipelines processing <strong className="text-white font-bold">1.78M+ battery telemetry records</strong> for predictive health monitoring.</p>
              <p>My philosophy: AI in safety-critical domains must be <strong className="text-cyan-400 font-bold">explainable</strong>, <strong className="text-emerald-400 font-bold">reliable</strong>, and built on solid data engineering.</p>
            </div>
            <ECGLine />
          </FadeIn>
          <FadeIn delay={150} className="lg:col-span-2 space-y-5">
            <div className="relative bg-white/[.035] border border-white/[.08] rounded-2xl p-6 overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="relative text-white font-black text-sm tracking-wider mb-5 flex items-center gap-2 uppercase"><span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-[8px] text-[#030306] font-black">✦</span><span className="font-mono">SYS.INFO</span></h3>
              {[["Education","MS CS (AI), SUNY Binghamton"],["GPA","3.66 / 4.00"],["Focus","Healthcare AI, Battery Analytics"],["Awards","Clark Fellowship, SPIR GA"],["Location","New York, NY"]].map(([k,v],i) => (
                <div key={i} className="relative flex gap-3 text-sm py-3 border-t border-white/[.05] first:border-0">
                  <span className="text-cyan-400/60 font-mono font-bold w-20 shrink-0 text-[11px] uppercase">{k}</span>
                  <span className="text-white/80 font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ school:"SUNY Binghamton",deg:"MS CS (AI)",yr:"2024-2026",gpa:"3.66" },{ school:"Bharathiar Univ.",deg:"BSc CS+DA",yr:"2020-2023",gpa:"8.2/10" }].map((e,i) => (
                <div key={i} className="bg-white/[.035] border border-white/[.08] rounded-xl p-4 hover:bg-white/[.07] hover:border-white/20 transition-all duration-500 group">
                  <p className="text-white/85 text-xs font-bold">{e.school}</p>
                  <p className="text-white/50 text-[10px] mt-0.5 font-mono font-bold">{e.deg}</p>
                  <div className="mt-3 flex justify-between items-end">
                    <span className="text-white/30 text-[10px] font-mono font-bold">{e.yr}</span>
                    <span className="text-cyan-400 font-black text-lg font-mono group-hover:scale-110 transition-transform">{e.gpa}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ──── EXPERIENCE ────
const exps = [
  { title:"Graduate Assistant, Data Science Intern",company:"Bridge Green Upcycle",period:"Jul 2025 - Feb 2026",tag:"energy",tagLabel:"ENERGY",points:["Built end-to-end data pipeline with Airflow and pandas, processing 1.78M+ battery records through custom ETL into PostgreSQL at 223K rows/minute.","Developed deep learning model on 399,000+ cycles across 205 cells and 5 chemistries for second-life battery classification.","Built anomaly detection detecting battery imbalance up to 180 seconds before failure.","Engineered predictive ML models for SoH and RUL estimation using real-time Powin Centipede BMS telemetry."] },
  { title:"AI/ML Intern",company:"Uplifty AI",period:"May 2025 - Jul 2025",tag:"ai",tagLabel:"AI/ML",points:["Built AI personalization features driving 76% adoption and 1.3x viral growth.","Fine-tuned LLaMA 3.1 with LoRA, reducing latency 4% and cloud costs 78%.","Full-stack with React Native, FastAPI, Supabase, GCP, improving retention 15%."] },
  { title:"Data Analyst Intern",company:"Prompt Infotech",period:"Jun 2023 - Dec 2023",tag:"data",tagLabel:"DATA",points:["End-to-end data cleaning and transformation using SQL, Python, Excel supporting 3+ strategic decisions.","Built 5+ interactive Power BI dashboards with trend analysis, cohort segmentation, and KPI tracking."] },
];
const tagT = { energy:{ pill:"bg-emerald-500/15 text-emerald-300 border-emerald-500/30",dot:"border-emerald-400 bg-emerald-400/40 shadow-emerald-500/50",b:"text-emerald-400/70" },ai:{ pill:"bg-violet-500/15 text-violet-300 border-violet-500/30",dot:"border-violet-400 bg-violet-400/40 shadow-violet-500/50",b:"text-violet-400/70" },data:{ pill:"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",dot:"border-cyan-400 bg-cyan-400/40 shadow-cyan-500/50",b:"text-cyan-400/70" } };

function Experience() {
  return (
    <section id="Experience" className="relative py-28 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn><div className="flex items-center gap-3 mb-4"><div className="w-14 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500" /><span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// EXPERIENCE</span></div>
        <h2 className="section-heading text-3xl sm:text-5xl text-white mb-12">Where I've Made Impact</h2></FadeIn>
        <FadeIn delay={50}><div className="mb-12 max-w-sm"><p className="text-white/40 text-[10px] font-mono mb-2 tracking-wider uppercase font-bold">LIVE DEMO: HOVER TO TRIGGER ANOMALY</p><AnomalyGraph /></div></FadeIn>
        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/60 via-emerald-500/30 to-transparent" />
          <div className="space-y-10">
            {exps.map((exp,i) => { const t = tagT[exp.tag]; return (
              <FadeIn key={i} delay={i * 120}>
                <div className="relative pl-12 md:pl-20 group">
                  <div className={`absolute left-[10px] md:left-[26px] top-2 w-3 h-3 rounded-full border-2 shadow-lg ${t.dot} group-hover:scale-[2] transition-transform duration-500`} />
                  <div className="bg-white/[.03] border border-white/[.07] rounded-2xl p-6 sm:p-8 hover:bg-white/[.06] hover:border-white/20 transition-all duration-500 group-hover:translate-x-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                      <div><h3 className="text-xl font-extrabold text-white">{exp.title}</h3><p className="text-white/55 text-sm font-bold mt-0.5">{exp.company}</p></div>
                      <div className="flex items-center gap-2"><span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[.15em] border ${t.pill}`}>{exp.tagLabel}</span><span className="text-white/35 text-xs font-mono font-bold">{exp.period}</span></div>
                    </div>
                    <ul className="space-y-3">{exp.points.map((p,j) => <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-3 font-medium"><span className={`${t.b} mt-1.5 shrink-0 text-[6px]`}>●</span>{p}</li>)}</ul>
                  </div>
                </div>
              </FadeIn>
            ); })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ──── PROJECTS ────
const projects = [
  { title:"Cancer Metastasis Prediction",tag:"healthcare",tagLabel:"HEALTHCARE AI",desc:"Neural network analyzing 40M+ NIS records predicting colon cancer metastasis. AUC 0.85 with causal inference (PSM, IPW).",tech:["PyTorch","Pandas","SQL","Causal Inference"],metric:"AUC 0.85",icon:"🔬",overlay:{ acc:"85.3%",inf:"34ms",data:"40.2M rows",f1:"0.81" },live:null },
  { title:"Smart Battery Analytics",tag:"energy",tagLabel:"BATTERY TECH",desc:"Pipeline processing 1.78M+ records via Airflow ETL. Deep learning on 399K+ cycles. Anomaly detection 180s before failure.",tech:["Airflow","PostgreSQL","Deep Learning","Python"],metric:"1.78M+",icon:"🔋",overlay:{ acc:"97.1%",inf:"8ms",data:"1.78M rows",f1:"0.94" },live:null },
  { title:"Budget Brain",tag:"ai",tagLabel:"FULL-STACK AI",desc:"AI ad budget optimizer with Monte Carlo simulating CPM/CTR/CVR. P10-P90 confidence intervals across 4 platforms.",tech:["FastAPI","React","Gemini API","Monte Carlo"],metric:"4 Platforms",icon:"💡",overlay:{ acc:"92.7%",inf:"120ms",data:"48K sims",f1:"N/A" },live:"https://budget-brain-djxl.vercel.app/" },
  { title:"HopeLink RAG System",tag:"healthcare",tagLabel:"HEALTHCARE AI",desc:"Retrieval-Augmented LLM for patient-centered cancer info. Bridges oncology research with accessible communication.",tech:["LangChain","RAG","NLP","Python"],metric:"Submitted",icon:"🩺",overlay:{ acc:"91.4%",inf:"1.2s",data:"12K docs",f1:"0.88" },live:"https://huggingface.co/spaces/Srii07/WebExp" },
  { title:"Graph Course Recommender",tag:"ai",tagLabel:"EXPLAINABLE AI",desc:"Heterogeneous academic graph (1K+ students, 200+ courses) with XAI for interpretable recommendations.",tech:["PyTorch Geometric","NetworkX","MongoDB"],metric:"1K+ Nodes",icon:"🕸️",overlay:{ acc:"89.6%",inf:"22ms",data:"1.2K nodes",f1:"0.83" },live:"https://dsscourserecommendation.streamlit.app/" },
  { title:"SmartFinancial AI",tag:"ai",tagLabel:"LLM + LSTM",desc:"AI stock advisor with LSTM + LangChain + GPT-4 generating Buy/Sell/Hold through a conversational dashboard.",tech:["LSTM","LangChain","GPT-4","React"],metric:"Real-Time",icon:"📈",overlay:{ acc:"76.8%",inf:"45ms",data:"5Y OHLCV",f1:"0.72" },live:null },
];
const pTheme = { healthcare:"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",energy:"bg-emerald-500/15 text-emerald-300 border-emerald-500/30",ai:"bg-violet-500/15 text-violet-300 border-violet-500/30" };
const pGlow = { healthcare:"bg-cyan-500",energy:"bg-emerald-500",ai:"bg-violet-500" };

function ProjectCard({ p }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="group relative bg-white/[.03] border border-white/[.07] rounded-2xl p-6 hover:bg-white/[.07] hover:border-white/20 transition-all duration-500 h-full flex flex-col overflow-hidden cursor-crosshair"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-700 ${pGlow[p.tag]}`} />

      {/* DATA OVERLAY on hover */}
      {hov && (
        <div className="absolute inset-0 bg-[#030306]/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl data-overlay-in">
          <div className="text-center">
            <p className="text-white/30 text-[9px] font-mono font-bold tracking-[.2em] mb-4">MODEL DIAGNOSTICS</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[["ACCURACY", p.overlay.acc],["INFERENCE", p.overlay.inf],["DATASET", p.overlay.data],["F1-SCORE", p.overlay.f1]].map(([k,v]) => (
                <div key={k}>
                  <p className="text-white/30 text-[8px] font-mono font-bold tracking-wider">{k}</p>
                  <p className="text-cyan-400 text-lg font-black font-mono">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/80 text-[9px] font-mono font-bold tracking-wider">SYSTEM NOMINAL</span>
            </div>
            {/* LIVE SITE BUTTON inside overlay */}
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer"
                className="clickable inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#030306] text-[10px] font-black tracking-wider hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-[#030306]/40" /><span className="relative rounded-full h-1.5 w-1.5 bg-[#030306]" /></span>
                VIEW LIVE SITE
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{p.icon}</span>
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-[.15em] border ${pTheme[p.tag]}`}>{p.tagLabel}</span>
          {/* Live badge on card face */}
          {p.live && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-[8px] font-mono font-black tracking-wider">LIVE</span>
            </span>
          )}
        </div>
        <span className="text-white/30 text-[10px] font-mono font-black bg-white/[.05] px-2 py-1 rounded">{p.metric}</span>
      </div>
      <h3 className="relative text-white font-extrabold text-lg mb-3 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">{p.title}</h3>
      <p className="relative text-white/55 text-sm leading-relaxed mb-5 flex-1 font-medium">{p.desc}</p>
      <div className="relative flex flex-wrap gap-1.5">
        {p.tech.map(t => <span key={t} className="px-2.5 py-1 bg-white/[.05] border border-white/[.06] text-white/45 rounded-md text-[10px] font-mono font-bold hover:bg-white/[.12] hover:text-white/70 transition-all">{t}</span>)}
      </div>
    </div>
  );
}

function Projects() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? projects : projects.filter(p => p.tag === filter);
  return (
    <section id="Projects" className="relative py-28 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn><div className="flex items-center gap-3 mb-4"><div className="w-14 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500" /><span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// PROJECTS</span></div>
        <h2 className="section-heading text-3xl sm:text-5xl text-white mb-3">Featured Work</h2>
        <p className="text-white/35 text-sm font-mono font-bold mb-8 tracking-wide">HOVER ANY CARD FOR MODEL DIAGNOSTICS</p></FadeIn>
        <FadeIn delay={100}>
          <div className="flex flex-wrap gap-2 mb-12">
            {[["all","ALL"],["healthcare","HEALTHCARE"],["energy","BATTERY TECH"],["ai","AI/ML"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`clickable px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${filter === v ? "bg-white text-[#030306] shadow-lg shadow-white/15" : "bg-white/[.05] text-white/50 hover:bg-white/[.1] border border-white/[.07]"}`}>{l}</button>
            ))}
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p,i) => <FadeIn key={p.title} delay={i * 80}><ProjectCard p={p} /></FadeIn>)}
        </div>
      </div>
    </section>
  );
}

// ──── BENTO SKILLS (fixed id to "Skills") ────
const skills = [
  { title:"Programming",icon:"⌨️",items:["Python","SQL","JavaScript","Java","C++"],size:"col-span-1" },
  { title:"ML & AI",icon:"🧠",items:["PyTorch","PyTorch Geometric","Scikit-learn","Hugging Face","LangChain","RAG","LSTM"],size:"md:col-span-2" },
  { title:"Data Engineering",icon:"⚡",items:["Apache Airflow","ETL Pipelines","PostgreSQL","MongoDB","MySQL","Snowflake"],size:"col-span-1" },
  { title:"Data Science",icon:"📊",items:["Pandas","NumPy","Power BI","Tableau","Matplotlib","Seaborn","Streamlit"],size:"md:col-span-2" },
  { title:"Frameworks",icon:"☁️",items:["FastAPI","React.js","Express.js","React Native","GCP","Supabase"],size:"col-span-1" },
  { title:"Domain",icon:"🔬",items:["Healthcare AI","Battery Analytics","BMS","Anomaly Detection","Causal Inference","NIS/SEER"],size:"col-span-1" },
];

function Skills() {
  const [hov, setHov] = useState(null);
  return (
    <section id="Skills" className="relative py-28 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="flex items-center gap-3 mb-4"><div className="w-14 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500" /><span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// SKILLS</span></div>
          <h2 className="section-heading text-3xl sm:text-5xl text-white mb-16">Tools & Technologies</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((g, i) => (
            <FadeIn key={i} delay={i * 80} className={g.size || ""}>
              <div className={`relative bg-white/[.03] border border-white/[.08] rounded-2xl p-6 transition-all duration-500 cursor-default overflow-hidden group ${hov === i ? "bg-white/[.07] border-white/25 scale-[1.01]" : ""}`}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
                <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/[.05] to-emerald-500/[.05] transition-opacity duration-500 ${hov === i ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><span className="text-xl">{g.icon}</span><h3 className="text-white font-extrabold text-sm font-mono tracking-wider uppercase">{g.title}</h3></div>
                    {hov === i && <span className="text-[9px] font-mono text-emerald-400/90 tracking-wider animate-pulse font-bold">STATUS: OPTIMAL</span>}
                  </div>
                  <div className="h-1 bg-white/[.06] rounded-full mb-4 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700 ${hov === i ? "w-full" : "w-0"}`} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((s, j) => (
                      <span key={s} className={`px-3 py-1.5 bg-white/[.05] border border-white/[.05] rounded-lg text-[11px] font-mono font-bold transition-all duration-300 ${hov === i ? "text-cyan-300 bg-cyan-500/[.1] border-cyan-500/15" : "text-white/55"}`} style={{ transitionDelay: hov === i ? `${j * 40}ms` : "0ms" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──── PUBLICATIONS ────
function Publications() {
  return (
    <section id="Publications" className="relative py-28 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn><div className="flex items-center gap-3 mb-4"><div className="w-14 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500" /><span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// PUBLICATIONS</span></div>
        <h2 className="section-heading text-3xl sm:text-5xl text-white mb-12">Research & Papers</h2></FadeIn>
        <div className="space-y-5">
          {[
            { title:"Older Age Does Not Increase Inpatient Length of Stay and Total Charges After Pancreatectomy",venue:"Cancer Treatment and Research Communications",status:"Under Review",tag:"healthcare" },
            { title:"HopeLink: Retrieval-Augmented LLM System for Patient-Centered Cancer Information",venue:"Journal of Clinical Medicine , IISE Annual Conference - 2026 ",status:"Submitted",tag:"healthcare" },
            {title : "AI Enabled SoH Modeling: A Novel Process for Second Life Li ion Battery Energy Storage",venue:"New York Battery and Energy Storage Technology Consortium - 2025",status:"Published",tag:"Battery" },
            { title:"Real-Time Detection of Denial of Service (DoS) Attacks",venue:"Futuristic Trends in Information Technology",status:"Published",tag:"security" },
          ].map((pub,i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="group bg-white/[.03] border border-white/[.07] rounded-2xl p-6 hover:bg-white/[.06] hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[.15em] border ${pub.tag === "healthcare" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30": pub.tag === "security"? "bg-amber-500/15 text-amber-300 border-amber-500/30": "bg-green-500/15 text-green-300 border-green-500/30"}`} > {pub.tag === "healthcare"? "HEALTHCARE": pub.tag === "security"? "SECURITY" : "ENERGY"} </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[.15em] border font-mono ${pub.status === "Published" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-white/[.06] text-white/45 border-white/[.1]"}`}>{pub.status.toUpperCase()}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1.5 leading-snug group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">{pub.title}</h3>
                <p className="text-white/45 text-sm italic font-mono font-bold">{pub.venue}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──── CONTACT (with real LinkedIn & GitHub links) ────
function Contact() {
  return (
    <section id="Contact" className="relative py-32 z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/[.06] to-emerald-500/[.06] blur-[100px]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-white/55 text-xs font-black tracking-[.3em] uppercase font-mono">// CONTACT</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            </div>
            <h2 className="section-heading text-4xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              Let's Build Something<br /><span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Extraordinary</span>
            </h2>
            <p className="text-white/60 text-lg mb-12 leading-relaxed font-semibold">Open to full-time roles, research collaborations, and innovative projects at the intersection of AI, healthcare, and energy.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
              <MBtn href="mailto:sprakash1@binghamton.edu" className="group px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#030306] font-black text-sm tracking-wide shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-2.5 hover:shadow-cyan-500/50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                sprakash1@binghamton.edu
              </MBtn>
              <MBtn href="tel:+16077747837" className="px-8 py-4 rounded-full border-2 border-white/20 text-white/65 font-mono font-bold text-sm hover:bg-white/5 hover:border-white/35 transition-all flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +1 (607) 774-7837
              </MBtn>
            </div>
            <div className="flex justify-center gap-5">
              <MBtn href="https://www.linkedin.com/in/sriirohit/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/[.05] border border-white/[.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[.12] hover:border-white/25 transition-all duration-300" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </MBtn>
              <MBtn href="https://github.com/sriirohit3107" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/[.05] border border-white/[.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[.12] hover:border-white/25 transition-all duration-300" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </MBtn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[.06]">
      <StatusTicker />
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-[7px] text-[#030306] font-black" style={{ fontFamily:"Syne" }}>SR</div>
          <p className="text-white/30 text-xs font-mono font-bold">&copy; 2026 Srii Rohit Prakash</p>
        </div>
        <p className="text-white/20 text-xs font-mono font-bold tracking-wider">HEALTHCARE AI • BATTERY TECH • DATA SCIENCE</p>
      </div>
    </footer>
  );
}

function GlobalStyles() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
    * { cursor: crosshair; }
    .clickable, .clickable * { cursor: pointer; }
    .clickable:hover { filter: drop-shadow(0 0 6px rgba(6,182,212,.25)); }
    .hero-title { font-family: 'Syne', sans-serif; font-weight: 800; }
    .section-heading { font-family: 'Syne', sans-serif; font-weight: 800; }
    @keyframes pulse-slow { 0%,100% { transform:translate(-50%,-50%) scale(1); opacity:.06; } 50% { transform:translate(-50%,-50%) scale(1.15); opacity:.12; } }
    @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }
    .marquee-scroll { animation: marquee 35s linear infinite; }
    @keyframes ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }
    .ticker-scroll { animation: ticker 25s linear infinite; }
    .scanline-overlay { background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,.012) 2px, rgba(6,182,212,.012) 4px); }
    .scanline-overlay::after { content:""; position:absolute; top:0; left:0; right:0; height:2px; background:rgba(6,182,212,.07); animation:scanline 8s linear infinite; }
    @keyframes scanline { 0% { top:-2px; } 100% { top:100%; } }
    .noise-overlay { opacity:.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .glitch-text { position:relative; }
    .glitch-text::before,.glitch-text::after { content:attr(data-text); position:absolute; top:0; left:0; opacity:0; }
    .glitch-text:hover::before { opacity:.5; color:#06b6d4; clip-path:inset(20% 0 40% 0); animation:glitch1 .3s linear; }
    .glitch-text:hover::after { opacity:.5; color:#10b981; clip-path:inset(60% 0 10% 0); animation:glitch2 .3s linear; }
    @keyframes glitch1 { 0%{transform:translate(0)} 25%{transform:translate(-3px,1px)} 50%{transform:translate(3px,-1px)} 75%{transform:translate(-1px,2px)} 100%{transform:translate(0)} }
    @keyframes glitch2 { 0%{transform:translate(0)} 25%{transform:translate(3px,-1px)} 50%{transform:translate(-3px,2px)} 75%{transform:translate(1px,-2px)} 100%{transform:translate(0)} }
    .ecg-anim { animation:ecg-scroll 3s linear infinite; }
    @keyframes ecg-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .fi { opacity:0; transform:translateY(2rem); transition:opacity .7s ease-out, transform .7s ease-out; }
    .fi-visible { opacity:1; transform:translateY(0); }
    .cursor-blink { animation:blink .8s step-end infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .data-overlay-in { animation:overlayIn .3s ease-out; }
    @keyframes overlayIn { 0%{opacity:0;backdrop-filter:blur(0)} 100%{opacity:1;backdrop-filter:blur(4px)} }
  `}</style>;
}

export default function Portfolio() {
  const active = useScrollSpy(SECTIONS);
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background:"linear-gradient(180deg,#030306 0%,#050810 25%,#040710 50%,#030306 75%,#040508 100%)", fontFamily:"'Outfit', system-ui, sans-serif" }}>
      <GlobalStyles />
      <BootSequence />
      <NeuralRain />
      <CursorGlow />
      <EnergyBar />
      <Nav active={active} />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Publications />
      <Contact />
      <Footer />
    </div>
  );
}