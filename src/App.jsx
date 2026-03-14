import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── 🔑 SUPABASE CREDENTIALS ───────────────────────────────────────────────────
// Store in .env.local:  VITE_SUPABASE_URL=...  VITE_SUPABASE_ANON_KEY=...
// ⚠️  Enable RLS on all tables: profiles, journal_entries, custom_techniques,
//     game_plan, competitions — using (user_id = auth.uid())
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--openmat-bg,#f5f0eb);color:var(--openmat-text,#1e2d40);font-family:'Plus Jakarta Sans',sans-serif;overscroll-behavior:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#ede8e3;}
::-webkit-scrollbar-thumb{background:#3d7a96;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes popIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;}
.fullscreen-timer{position:fixed;inset:0;z-index:999;background:#0d1b2a;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.fullscreen-timer .fs-time{font-family:'DM Serif Display';font-size:22vw;color:#fff;line-height:1;letter-spacing:-2px;}
.fullscreen-timer .fs-label{font-family:'JetBrains Mono';font-size:4vw;letter-spacing:4px;text-transform:uppercase;margin-top:2vw;}
@media(orientation:portrait){.fullscreen-timer .fs-time{font-size:28vw;}.fullscreen-timer .fs-label{font-size:5vw;}}
`;

const LIGHT = {
  bg:"#f5f0eb", surface:"#ffffff", card:"#ffffff", cardAlt:"#faf7f4",
  border:"#e4ddd6", teal:"#3d7a96", tealLight:"#eaf3f7",
  orange:"#e07b39", orangeLight:"#fdf1e8", green:"#3a7d5e", greenLight:"#eaf5ef",
  text:"#1e2d40", muted:"#7a8a96", subtle:"#d4cdc6",
  shadow:"0 2px 12px rgba(30,45,64,0.08)",
};
const DARK = {
  bg:"#0d1b2a", surface:"#1b2838", card:"#1b2838", cardAlt:"#162232",
  border:"#2a3a4a", teal:"#4da3c4", tealLight:"#1a2e3d",
  orange:"#e8944e", orangeLight:"#2a2218", green:"#4daa7a", greenLight:"#1a2e24",
  text:"#e8e3dc", muted:"#8a9aaa", subtle:"#3a4a5a",
  shadow:"0 2px 12px rgba(0,0,0,0.3)",
};
let T = {...LIGHT};
const setTheme=(dark)=>{Object.assign(T, dark ? DARK : LIGHT);};

// ── Comprehensive Technique Library ──────────────────────────────────────────
const TECHNIQUES = {
  "Closed Guard":{
    Fundamentals:[
      "Armbar from Guard","Hip Bump Sweep","Scissor Sweep","Guillotine Choke",
      "Kimura from Guard","Flower Sweep","Cross Collar Choke","Basic Guard Break",
      "Pendulum Sweep","Sit-Up Sweep",
    ],
    Intermediate:[
      "Triangle Choke","Omoplata","Loop Choke","Arm Drag to Back",
      "Elevator Sweep","Balloon Sweep","Double Ankle Sweep","Overhook Armbar",
      "Bump & Roll to Mount","Mounted Triangle",
    ],
    Advanced:[
      "Gogoplata","Baratoplata","Cummerbund Control","Shaolin Sweep",
      "Electric Chair from Closed Guard","Inverted Armbar","Reverse Triangle",
      "Peruvian Necktie","Rubber Guard Entries","Twister from Guard",
    ],
  },
  "Open Guard":{
    Fundamentals:[
      "De La Riva Guard Basic","Spider Guard Basics","Collar Sleeve Guard",
      "Sit-Up Guard","Lasso Guard Entry","Basic Guard Recovery",
      "Sleeve Grip Bicep Sweep","Double Sleeve Sweep",
    ],
    Intermediate:[
      "X-Guard Entry","Single Leg X Entry","De La Riva Berimbolo",
      "De La Riva Sweep","Lasso Sweep","Spider Guard Sweep","Sickle Sweep",
      "Shin-to-Shin Guard","Tripod Sweep","Hook Sweep",
    ],
    Advanced:[
      "Worm Guard","Reverse De La Riva","Crab Ride","50/50 Guard",
      "Ashi Garami Entry","Squatting Guard","Inverted Guard",
      "Tornado Guard","Matrix Guard","Z-Guard",
    ],
  },
  "Half Guard":{
    Fundamentals:[
      "Knee Shield Half Guard","Dog Fight Position","Half Guard Underhook",
      "Basic Half Guard Sweep","Half Guard Pass (flat)","Getting Back to Guard",
    ],
    Intermediate:[
      "Old School Sweep","Kimura Trap from Half","Single Leg from Half",
      "Deep Half Guard Entry","Waiter Sweep","Granby from Half",
      "Half Guard Sit-Up Sweep","Back Take from Half",
    ],
    Advanced:[
      "Lockdown System","Electric Chair","Coyote Half Guard",
      "Reverse Half Guard","Z-Half Guard","Dogfight to Suplex",
      "Tornado Roll from Half","Waiter to Back",
    ],
  },
  "Mount":{
    Fundamentals:[
      "Americana from Mount","Cross Collar Choke","Trap & Roll Escape",
      "Elbow-Knee Escape","Maintaining Mount","Low Mount Basics",
      "Bridging Under Mount",
    ],
    Intermediate:[
      "Armbar from Mount","S-Mount Transition","High Mount Control",
      "Gift Wrap Setup","Arm Triangle from Mount","Mount to Back Take",
      "Mounted Guillotine","Baseball Bat Choke",
    ],
    Advanced:[
      "Ezekiel Choke","Arm Crush","Monoplata","Mounted Omoplata",
      "Gift Wrap Submission","Ten Finger Guillotine","Twister from Mount",
      "Crucifix from Mount",
    ],
  },
  "Side Control":{
    Fundamentals:[
      "Americana from Side Control","Kimura from Side Control",
      "Side Control Escape (frames)","Knee on Belly Basics",
      "Maintaining Side Control","Hip Escape from Side Control",
    ],
    Intermediate:[
      "Katagatame (Head & Arm Choke)","D'Arce Choke","Knee on Belly Attacks",
      "Side Control to Mount","Reverse Kesa Gatame","Far Side Armbar",
      "Brabo Choke","Cross-Face Control",
    ],
    Advanced:[
      "North-South Choke","Twister Side Control","Can Opener to Sub",
      "Peruvian Necktie","Ninja Choke","Reverse Armbar","Suloev Stretch",
      "Baratoplata from Side","Mir Lock",
    ],
  },
  "Back Control":{
    Fundamentals:[
      "Rear Naked Choke","Seatbelt Control","Back Escape (basic)",
      "Maintaining Back Control","Hook Insertion","Body Triangle Basics",
    ],
    Intermediate:[
      "Bow & Arrow Choke","Collar Choke from Back","Body Triangle Control",
      "Arm Trap RNC","Crucifix Position","Clock Choke",
      "Back Take from Turtle","Seat Belt Roll",
    ],
    Advanced:[
      "Harness Grip System","Truck Position","Trunk Squeeze",
      "Twister from Back","Mounted Crucifix","No-Arm Back Control",
      "Back to Leg Lock Entry","Inverted Back Take",
    ],
  },
  "Takedowns":{
    Fundamentals:[
      "Double Leg Takedown","Single Leg Takedown","Guard Pull","Ankle Pick",
      "Snap Down","Collar Tie Basics","Clinch Entry","Body Lock Takedown",
    ],
    Intermediate:[
      "Osoto Gari","Seoi Nage","Foot Sweep","Blast Double",
      "High Crotch","Arm Drag to Single","Fireman's Carry",
      "Lateral Drop","Kouchi Gari",
    ],
    Advanced:[
      "Uchi Mata","Harai Goshi","Sacrifice Throw (Tomoe Nage)",
      "Suplex","Kata Guruma","Tai Otoshi","Yoko Tomoe Nage",
      "Sumi Gaeshi","Kouchi into Double",
    ],
  },
  "Leg Locks":{
    Fundamentals:[
      "Straight Ankle Lock","Basic Ashi Garami","Inside Heel Hook (basics)",
      "Defending Heel Hooks (toes up)","Knee Bar Basics","Leg Entanglement Concepts",
    ],
    Intermediate:[
      "Toe Hold","Calf Slicer","Saddle/Inside Sankaku","50/50 Position",
      "Outside Heel Hook","Ankle Lock to Knee Bar","Leg Drag to Leg Lock",
      "Outside Ashi","Single Leg X to Heel Hook",
    ],
    Advanced:[
      "Inside Heel Hook (advanced)","Reaping Entries","Honey Hole / Saddle Advanced",
      "Truck to Heel Hook","Back Step Counter","Cross Ashi","411 Position",
      "Matrix Leg Lock","Estima Lock","Bicep Slicer",
    ],
  },
  "Guard Passing":{
    Fundamentals:[
      "Knee Slice Pass","Stack Pass","X-Pass","Torreando Pass",
      "Double Under Pass","Over-Under Pass","Basic Pressure Pass",
    ],
    Intermediate:[
      "Leg Drag Pass","Smash Pass","Long Step Pass","Body Lock Pass",
      "Headquarters Position","Knee Cut to Back Step","Folding Pass",
      "Torreando to Knee Slice Combo",
    ],
    Advanced:[
      "Pressure Passing System","Matador Pass","Wrist Lock Pass",
      "Back Step to Leg Lock","Floating Pass","Reverse De La Riva Pass",
      "Spin Under Pass","Crab Ride Pass","Cartwheel Pass",
    ],
  },
  "Turtle & Turtle Attacks":{
    Fundamentals:[
      "Turtle Position Basics","Seat Belt from Turtle","Clock Choke Entry",
      "Getting Back to Guard from Turtle","Granby Roll",
    ],
    Intermediate:[
      "Back Take from Turtle","Clock Choke","Crucifix Entry",
      "Bow & Arrow from Turtle","Ankle Pick from Turtle","Rolling Back Take",
    ],
    Advanced:[
      "Truck Position from Turtle","Darce from Turtle","Twister Entry",
      "Crab Ride from Turtle","Leg Lock from Turtle Drag",
      "Electric Chair from Turtle",
    ],
  },
  "Escapes":{
    Fundamentals:[
      "Elbow-Knee Escape (Mount)","Trap & Roll (Mount)","Frame & Shrimp (Side)",
      "Underhook Escape (Side)","Chin Tuck (Back)","Bridge and Roll",
    ],
    Intermediate:[
      "Running Escape (Side)","Leg Weave Escape (Mount)","Hip Escape Chain",
      "Back Escape to Half Guard","Guard Recovery Chain","Ghost Escape",
      "Granby Roll Escape",
    ],
    Advanced:[
      "Inversion Escape","Matrix Escape","Back Escape (advanced)",
      "Leg Lock Escape (toes up system)","Kimura Escape","Straight Jacket Escape",
      "Mounted Triangle Escape",
    ],
  },
  "Clinch & Wrestling":{
    Fundamentals:[
      "Collar Tie","Underhook Control","Overhook Control","Snap Down",
      "Level Change","Sprawl Defence","Inside Trip",
    ],
    Intermediate:[
      "Body Lock Trips","Arm Drag","Underhook to Back","Duck Under",
      "Slide-by","Kouchi from Clinch","Whizzer Counter",
    ],
    Advanced:[
      "Arm Drag System","Bear Hug Throws","Headlock to Suplex",
      "Hip Toss Series","Front Headlock System","Single Leg Finish Series",
      "Blast Double from Clinch",
    ],
  },
};

const LEVEL_COLORS = {
  Fundamentals:{color:"#3a7d5e",bg:"#eaf5ef"},
  Intermediate:{color:"#3d7a96",bg:"#eaf3f7"},
  Advanced:{color:"#e07b39",bg:"#fdf1e8"},
};

// Category tile emojis
const CAT_ICONS = {
  "Closed Guard":"🛡️","Open Guard":"🦾","Half Guard":"⚡","Mount":"👑",
  "Side Control":"🔒","Back Control":"🎯","Takedowns":"💥","Leg Locks":"🦵",
  "Guard Passing":"⚔️","Turtle & Turtle Attacks":"🐢","Escapes":"🚪","Clinch & Wrestling":"🤼",
};

const CORE_POSITIONS = [
  {id:"standing",   label:"Standing / Grips",   icon:"🤼", color:"#6366f1"},
  {id:"guard",      label:"Guard (Bottom)",      icon:"🛡️", color:"#3d7a96"},
  {id:"halfguard",  label:"Half Guard",          icon:"⚡", color:"#7c3aed"},
  {id:"passing",    label:"Guard Passing (Top)", icon:"⚔️", color:"#0891b2"},
  {id:"sidecontrol",label:"Side Control (Top)",  icon:"🔒", color:"#b45309"},
  {id:"mount",      label:"Mount (Top)",         icon:"👑", color:"#e07b39"},
  {id:"backcontrol",label:"Back Control",        icon:"🎯", color:"#3a7d5e"},
  {id:"turtle",     label:"Turtle",              icon:"🐢", color:"#64748b"},
  {id:"leglocks",   label:"Leg Locks",           icon:"🦵", color:"#dc2626"},
];
const MENTAL_FIELDS = [
  {key:"points",   label:"Points Strategy",       ph:"e.g. Pull guard early, hunt sweeps, avoid giving guard pass..."},
  {key:"winning",  label:"If Winning on Points",  ph:"e.g. Maintain top pressure, avoid risky submissions..."},
  {key:"losing",   label:"If Losing on Points",   ph:"e.g. Go for the submission, pull guard for attacks..."},
];

const IBJJF_ILLEGAL_MOVES = [
  {id:1,move:"Submission techniques stretching legs apart",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:2,move:"Choke with spinal lock",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:3,move:"Straight foot lock",levels:["4-12","13-15"]},
  {id:4,move:"Forearm choke using the sleeve (Ezequiel choke)",levels:["4-12","13-15"]},
  {id:5,move:"Frontal guillotine choke",levels:["4-12","13-15"]},
  {id:6,move:"Omoplata",levels:["4-12","13-15"]},
  {id:7,move:"Triangle (pulling head)",levels:["4-12","13-15"]},
  {id:8,move:"Arm triangle",levels:["4-12","13-15"]},
  {id:9,move:"Lock inside closed guard with legs compressing kidneys or ribs",levels:["4-12","13-15","16-17"]},
  {id:10,move:"Wrist lock",levels:["4-12","13-15"]},
  {id:11,move:"Single leg takedown while attacker's head is outside opponent's body",levels:["4-12","13-15","16-17"]},
  {id:12,move:"Bicep slicer",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple"]},
  {id:13,move:"Calf slicer",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple"]},
  {id:14,move:"Knee bar",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple"]},
  {id:15,move:"Toe hold",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple"]},
  {id:16,move:"Heel hook",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack"]},
  {id:17,move:"Locks twisting the knees",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack"]},
  {id:18,move:"Knee Reaping",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack"]},
  {id:19,move:"In straight foot lock, turning in direction of foot not under attack",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack"]},
  {id:20,move:"In toe hold, applying outward pressure on the foot",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack"]},
  {id:21,move:"Slam",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:22,move:"Spinal lock without choke",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:23,move:"Scissor Takedown",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:24,move:"Bending fingers backwards",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:25,move:"Grab belt & throw to floor on head when defending single leg",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
  {id:26,move:"Suplex landing with opponent's head or neck on ground",levels:["4-12","13-15","16-17","Adult-Master7-BluePurple","Adult-Master7-BrownBlack","Adult-BrownBlack-NoGi"]},
];
const BELT_LEVEL_MAP = {"White / Blue":"Adult-Master7-BluePurple","Purple":"Adult-Master7-BluePurple","Brown / Black":"Adult-Master7-BrownBlack","Brown / Black (No-Gi)":"Adult-BrownBlack-NoGi","16-17 yrs":"16-17","13-15 yrs":"13-15","4-12 yrs":"4-12"};
const BELT_COLORS = {"White":"#e8e3dc","Blue":"#2563eb","Purple":"#7c3aed","Brown":"#92400e","Black":"#1e2d40"};
const BELT_TEXT   = {"White":"#1e2d40","Blue":"#ffffff","Purple":"#ffffff","Brown":"#ffffff","Black":"#ffffff"};
const fmtTime = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const todayStr = ()=>new Date().toISOString().split("T")[0];
const dayName  = d=>new Date(d).toLocaleDateString("en",{weekday:"short"});
const isDatePast = (dateStr)=>{ if(!dateStr) return false; return new Date(dateStr+"T23:59:59") < new Date(); };

// ── Audio ─────────────────────────────────────────────────────────────────────
function useAudio(volume=0.7){
  const ctx=useRef(null);
  const getCtx=()=>{
    if(!ctx.current) ctx.current=new(window.AudioContext||window.webkitAudioContext)();
    return ctx.current;
  };
  // Call this on a direct user tap to unlock iOS audio
  const unlockAudio=useCallback(()=>{
    try{ const ac=getCtx(); if(ac.state==="suspended") ac.resume(); }catch(e){}
  },[]);
  const playBeep=useCallback((freq,startTime,dur,vol=volume)=>{
    try{
      const ac=getCtx();
      if(ac.state==="suspended") ac.resume();
      const osc=ac.createOscillator(),gain=ac.createGain();
      osc.connect(gain);gain.connect(ac.destination);
      osc.type="square";osc.frequency.value=freq;
      gain.gain.setValueAtTime(0,startTime);
      gain.gain.linearRampToValueAtTime(vol,startTime+0.005);
      gain.gain.setValueAtTime(vol,startTime+dur-0.01);
      gain.gain.linearRampToValueAtTime(0,startTime+dur);
      osc.start(startTime);osc.stop(startTime+dur+0.02);
    }catch(e){}
  },[volume]);
  // Three sharp loud beeps — like a referee whistle
  const ringRoundEnd=useCallback(()=>{
    const ac=getCtx(); if(ac.state==="suspended") ac.resume();
    const t=ac.currentTime;
    playBeep(900,t,0.12,Math.min(volume*1.4,1));
    playBeep(900,t+0.18,0.12,Math.min(volume*1.4,1));
    playBeep(900,t+0.36,0.18,Math.min(volume*1.4,1));
  },[playBeep,volume]);
  // Two quick ascending beeps for round start
  const ringRoundStart=useCallback(()=>{
    const ac=getCtx(); if(ac.state==="suspended") ac.resume();
    const t=ac.currentTime;
    playBeep(700,t,0.1,Math.min(volume*1.2,1));
    playBeep(1050,t+0.15,0.15,Math.min(volume*1.2,1));
  },[playBeep,volume]);
  return{ringRoundEnd,ringRoundStart,unlockAudio};
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card=({children,style={},onClick})=>(
  <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px",marginBottom:10,boxShadow:T.shadow,cursor:onClick?"pointer":"default",...style}}>{children}</div>
);
const SectionTitle=({children,sub})=>(
  <div style={{marginBottom:18,marginTop:4}}>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:28,color:T.text,lineHeight:1.1}}>{children}</div>
    {sub&&<div style={{fontSize:13,color:T.muted,marginTop:4}}>{sub}</div>}
  </div>
);
const Pill=({label,color=T.teal,bg=T.tealLight})=>(
  <span style={{background:bg,color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{label}</span>
);
const StatBox=({label,value,icon,color=T.teal,bg=T.tealLight})=>(
  <div style={{background:bg,borderRadius:14,padding:"14px 10px",flex:1,textAlign:"center",border:`1px solid ${color}22`}}>
    <div style={{fontSize:20}}>{icon}</div>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:30,color,lineHeight:1,marginTop:2}}>{value}</div>
    <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginTop:3,fontWeight:600}}>{label}</div>
  </div>
);
const Btn=({children,onClick,variant="primary",style={},disabled=false})=>{
  const base={borderRadius:12,padding:"12px 20px",fontFamily:"'Plus Jakarta Sans'",fontWeight:700,fontSize:14,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.15s",opacity:disabled?0.6:1,...style};
  const v={primary:{background:T.teal,color:"#fff",boxShadow:`0 2px 8px ${T.teal}44`},secondary:{background:T.surface,color:T.teal,border:`1.5px solid ${T.teal}`},ghost:{background:"none",color:T.muted,border:`1px solid ${T.border}`}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...v[variant]}}>{children}</button>;
};
const Spinner=({size=20,color=T.teal})=>(
  <div style={{width:size,height:size,border:`2.5px solid ${color}33`,borderTop:`2.5px solid ${color}`,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
);

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen(){
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const handle=async()=>{
    setError("");setMessage("");setLoading(true);
    if(mode==="signup"){const{error:e}=await supabase.auth.signUp({email,password});if(e)setError(e.message);else setMessage("Check your email to confirm your account!");}
    else{const{error:e}=await supabase.auth.signInWithPassword({email,password});if(e)setError(e.message);}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,background:T.teal,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px",boxShadow:`0 6px 24px ${T.teal}44`}}>🥋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,color:T.text}}>Open<span style={{color:T.teal}}>mat</span></div>
          <div style={{fontSize:13,color:T.muted,marginTop:4}}>Your personal jiu-jitsu companion</div>
        </div>
        <Card style={{padding:"24px 20px"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:20}}>{mode==="signin"?"Welcome back":"Create account"}</div>
          {[{l:"Email",k:"email",t:"email",v:email,s:setEmail,p:"you@email.com"},{l:"Password",k:"pw",t:"password",v:password,s:setPassword,p:mode==="signup"?"At least 6 characters":""}].map(f=>(
            <div key={f.k} style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
              <input type={f.t} value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"11px 14px",color:T.text,fontSize:14,outline:"none"}}/>
            </div>
          ))}
          {error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:14}}>{error}</div>}
          {message&&<div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.green,marginBottom:14}}>{message}</div>}
          <Btn onClick={handle} disabled={loading||!email||!password} style={{width:"100%",padding:"14px",fontSize:15}}>
            {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/>{mode==="signin"?"Signing in...":"Creating..."}</span>:mode==="signin"?"Sign In →":"Create Account →"}
          </Btn>
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>
            {mode==="signin"?"Don't have an account?":"Already have an account?"}{" "}
            <button onClick={()=>{setMode(mode==="signin"?"signup":"signin");setError("");setMessage("");}} style={{background:"none",border:"none",color:T.teal,fontWeight:700,cursor:"pointer",fontSize:13}}>
              {mode==="signin"?"Sign up":"Sign in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TIMER ─────────────────────────────────────────────────────────────────────
function TimerScreen(){
  const [roundLen,setRoundLen]=useState(300);
  const [restLen,setRestLen]=useState(60);
  const [rounds,setRounds]=useState(5);
  const [currentRound,setCurrentRound]=useState(1);
  const [timeLeft,setTimeLeft]=useState(300);
  const [isRest,setIsRest]=useState(false);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [showSetup,setShowSetup]=useState(true);
  const [fullscreen,setFullscreen]=useState(false);
  const [volume,setVolume]=useState(0.7);
  const interval=useRef(null);
  const wakeLock=useRef(null);
  const{ringRoundEnd,ringRoundStart,unlockAudio}=useAudio(volume);
  const requestWakeLock=async()=>{try{if("wakeLock" in navigator){wakeLock.current=await navigator.wakeLock.request("screen");}}catch(e){}};
  const releaseWakeLock=()=>{try{if(wakeLock.current){wakeLock.current.release();wakeLock.current=null;}}catch(e){}};
  const reset=()=>{clearInterval(interval.current);releaseWakeLock();setRunning(false);setCurrentRound(1);setIsRest(false);setTimeLeft(roundLen);setDone(false);setShowSetup(true);setFullscreen(false);};
  const start=()=>{unlockAudio();requestWakeLock();setShowSetup(false);setTimeLeft(roundLen);setRunning(true);};
  useEffect(()=>{
    if(!running){clearInterval(interval.current);return;}
    interval.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          setIsRest(r=>{
            if(!r){ringRoundEnd();setCurrentRound(cr=>{if(cr>=rounds){setRunning(false);setDone(true);releaseWakeLock();clearInterval(interval.current);return cr;}return cr+1;});setTimeout(()=>setTimeLeft(restLen),0);return true;}
            else{setTimeout(()=>{setTimeLeft(roundLen);ringRoundStart();},0);return false;}
          });return 0;
        }return t-1;
      });
    },1000);
    return()=>clearInterval(interval.current);
  },[running,rounds,roundLen,restLen,ringRoundEnd,ringRoundStart]);
  const pct=isRest?(timeLeft/restLen)*100:(timeLeft/roundLen)*100;
  const r=80,circ=2*Math.PI*r;
  if(fullscreen&&!showSetup){
    const fsColor=isRest?T.orange:T.teal;
    return(
      <div className="fullscreen-timer" onClick={()=>setRunning(rv=>!rv)}>
        <div style={{fontSize:"3vw",fontFamily:"'JetBrains Mono'",color:"rgba(255,255,255,0.4)",letterSpacing:3,textTransform:"uppercase",marginBottom:"2vw"}}>{isRest?"Rest":`Round ${currentRound} / ${rounds}`}</div>
        <div className="fs-time" style={{color:timeLeft<=5&&running?"#e07b39":"#fff",animation:timeLeft<=5&&running?"blink 0.5s infinite":"none"}}>{fmtTime(timeLeft)}</div>
        <div className="fs-label" style={{color:fsColor}}>{isRest?"😮‍💨 Rest Period":"🥋 Rolling"}</div>
        <div style={{marginTop:"4vw",fontSize:"2.5vw",color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono'"}}>TAP TO {running?"PAUSE":"RESUME"}</div>
        <button onClick={e=>{e.stopPropagation();setFullscreen(false);}} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,padding:"10px 18px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:700}}>Exit ✕</button>
        <div style={{position:"absolute",bottom:40,display:"flex",gap:10}}>
          {Array.from({length:rounds}).map((_,i)=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:i<currentRound-1?fsColor:i===currentRound-1?(isRest?T.orange:fsColor):"rgba(255,255,255,0.2)",opacity:i<currentRound-1?0.5:1}}/>)}
        </div>
      </div>
    );
  }
  if(showSetup) return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Configure your sparring session">Sparring Timer</SectionTitle>
      {[{label:"Round Length",val:roundLen,set:setRoundLen,opts:[60,120,180,240,300,360,420,480,600]},{label:"Rest Period",val:restLen,set:setRestLen,opts:[15,30,45,60,90,120]},{label:"Number of Rounds",val:rounds,set:setRounds,opts:[1,2,3,4,5,6,8,10]}].map(({label,val,set,opts})=>(
        <Card key={label}>
          <div style={{fontSize:12,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>{label}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {opts.map(o=><button key={o} onClick={()=>set(o)} style={{background:val===o?T.teal:T.cardAlt,color:val===o?"#fff":T.muted,border:`1.5px solid ${val===o?T.teal:T.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontFamily:"'JetBrains Mono'",cursor:"pointer",fontWeight:600}}>{label==="Number of Rounds"?o:fmtTime(o)}</button>)}
          </div>
        </Card>
      ))}
      <Card>
        <div style={{fontSize:12,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>🔔 Round Bell Volume</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:16}}>{volume===0?"🔇":volume<0.4?"🔈":volume<0.75?"🔉":"🔊"}</span>
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e=>setVolume(Number(e.target.value))} style={{flex:1,accentColor:T.teal,height:4,cursor:"pointer"}}/>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,color:T.teal,minWidth:32}}>{Math.round(volume*100)}%</span>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:8}}>Deep bell = round ends · Bright ding = round starts</div>
      </Card>
      <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:T.muted}}>Total session time</span><span style={{fontFamily:"'JetBrains Mono'",fontWeight:600,color:T.teal}}>{fmtTime(rounds*roundLen+(rounds-1)*restLen)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.muted}}>Active rolling time</span><span style={{fontFamily:"'JetBrains Mono'",fontWeight:600,color:T.orange}}>{fmtTime(rounds*roundLen)}</span></div>
      </Card>
      <Btn onClick={start} style={{width:"100%",padding:"16px",fontSize:16,marginTop:4}}>Start Session →</Btn>
    </div>
  );
  return(
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",animation:"fadeUp 0.3s ease"}}>
      <div style={{marginBottom:18,marginTop:4,textAlign:"center"}}><div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:T.text}}>{isRest?"Rest Time 😮‍💨":`Round ${currentRound} of ${rounds} 🥋`}</div></div>
      <div style={{position:"relative",width:200,height:200,marginBottom:24}}>
        <svg width={200} height={200} style={{transform:"rotate(-90deg)"}}>
          <circle cx={100} cy={100} r={r} fill="none" stroke={T.border} strokeWidth={10}/>
          <circle cx={100} cy={100} r={r} fill="none" stroke={isRest?T.orange:T.teal} strokeWidth={10} strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:50,color:T.text,lineHeight:1,animation:timeLeft<=5&&running?"blink 0.5s infinite":"none"}}>{fmtTime(timeLeft)}</div>
          <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginTop:2}}>{isRest?"Rest":"Roll"}</div>
        </div>
      </div>
      {done?(<div style={{textAlign:"center",animation:"popIn 0.4s ease"}}><div style={{fontSize:48,marginBottom:8}}>🏅</div><div style={{fontFamily:"'DM Serif Display'",fontSize:32,color:T.teal,marginBottom:4}}>Session Complete!</div><div style={{color:T.muted,marginBottom:20,fontSize:14}}>{rounds} rounds · {fmtTime(rounds*roundLen)} rolling</div><Btn onClick={reset}>Start New Session</Btn></div>):(
        <>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <Btn onClick={()=>setRunning(rv=>!rv)} variant={running?"secondary":"primary"} style={{minWidth:120}}>{running?"⏸  Pause":"▶  Resume"}</Btn>
            <Btn onClick={()=>setFullscreen(true)} variant="secondary" style={{minWidth:50}}>⛶</Btn>
            <Btn onClick={reset} variant="ghost">Reset</Btn>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{Array.from({length:rounds}).map((_,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<currentRound-1?T.teal:i===currentRound-1?(isRest?T.orange:T.teal):T.border,opacity:i<currentRound-1?0.4:1}}/>)}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <span style={{fontSize:13}}>{volume===0?"🔇":volume<0.75?"🔉":"🔊"}</span>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e=>setVolume(Number(e.target.value))} style={{width:100,accentColor:T.teal,cursor:"pointer"}}/>
          </div>
        </>
      )}
    </div>
  );
}

// ── TECHNIQUES ────────────────────────────────────────────────────────────────
function TechniqueScreen({user}){
  const [activePos,setActivePos]=useState(Object.keys(TECHNIQUES)[0]);
  const [activeLevel,setActiveLevel]=useState("All");
  const [expanded,setExpanded]=useState(null);
  const [customTab,setCustomTab]=useState("library");

  // My Library state
  const [myTechs,setMyTechs]=useState([]);           // all custom_techniques rows
  const [myCategories,setMyCategories]=useState([]);  // unique categories
  const [selectedCat,setSelectedCat]=useState(null);  // drill-in view
  const [addingCat,setAddingCat]=useState(false);
  const [newCatName,setNewCatName]=useState("");
  const [addingTech,setAddingTech]=useState(false);
  const [techForm,setTechForm]=useState({title:"",category:"",level:"Fundamentals",url:"",notes:""});
  const [techLoading,setTechLoading]=useState(false);
  const [viewTech,setViewTech]=useState(null);        // detail modal
  const [confirmRemove,setConfirmRemove]=useState(null); // tech name pending removal

  useEffect(()=>{
    supabase.from("custom_techniques").select("*").eq("user_id",user.id).order("created_at",{ascending:false})
      .then(({data})=>{
        if(data){
          setMyTechs(data);
          const cats=[...new Set(data.map(t=>t.category).filter(Boolean))];
          setMyCategories(cats);
        }
      });
  },[user.id]);

  // Add technique from standard library → My Library (silent, no popup)
  const addFromLibrary=async(techName,category,level)=>{
    const already=myTechs.find(t=>t.title===techName);
    if(already){
      if(confirmRemove===techName){
        // Second tap — remove it
        const{error}=await supabase.from("custom_techniques").delete().eq("id",already.id);
        if(!error) setMyTechs(p=>p.filter(t=>t.id!==already.id));
        setConfirmRemove(null);
      } else {
        // First tap — show confirm state
        setConfirmRemove(techName);
        setTimeout(()=>setConfirmRemove(null),3000); // auto-cancel after 3s
      }
      return;
    }
    setConfirmRemove(null);
    const ytUrl=`https://www.youtube.com/results?search_query=${encodeURIComponent("BJJ "+techName+" tutorial")}`;
    const row={user_id:user.id,title:techName,category,level,url:ytUrl,notes:""};
    const{data}=await supabase.from("custom_techniques").insert(row).select().single();
    if(data){
      setMyTechs(p=>[data,...p]);
      setMyCategories(prev=>[...new Set([...prev,category])]);
    }
  };

  const saveNewTech=async()=>{
    if(!techForm.title.trim()){return;}
    setTechLoading(true);
    const{data,error}=await supabase.from("custom_techniques").insert({user_id:user.id,...techForm}).select().single();
    if(error){console.error("Failed to save technique:",error.message);setTechLoading(false);return;}
    if(data){
      setMyTechs(p=>[data,...p]);
      if(techForm.category&&!myCategories.includes(techForm.category))
        setMyCategories(p=>[...p,techForm.category]);
    }
    setAddingTech(false);setTechForm({title:"",category:"",level:"Fundamentals",url:"",notes:""});setTechLoading(false);
  };

  const saveEditTech=async(id,updated)=>{
    const{error}=await supabase.from("custom_techniques").update(updated).eq("id",id);
    if(error){console.error("Failed to update technique:",error.message);return;}
    setMyTechs(p=>{
      const next=p.map(t=>t.id===id?{...t,...updated}:t);
      setMyCategories([...new Set(next.map(t=>t.category).filter(Boolean))]);
      return next;
    });
    setViewTech(t=>({...t,...updated}));
  };

  const delTech=async(id)=>{
    const{error}=await supabase.from("custom_techniques").delete().eq("id",id);
    if(error){console.error("Failed to delete technique:",error.message);return;}
    const remaining=myTechs.filter(t=>t.id!==id);
    setMyTechs(remaining);
    setMyCategories([...new Set(remaining.map(t=>t.category).filter(Boolean))]);
    setViewTech(null);
  };

  const addCategory=()=>{
    const n=newCatName.trim();
    if(n&&!myCategories.includes(n)){setMyCategories(p=>[...p,n]);}
    setNewCatName("");setAddingCat(false);
  };

  const getLinkIcon=(url="")=>{
    if(url.includes("youtube")||url.includes("youtu.be")) return "▶️ YouTube";
    if(url.includes("instagram")) return "📸 Instagram";
    return "🔗 Link";
  };

  const levelKeys=["Fundamentals","Intermediate","Advanced"];
  const techsForPos=TECHNIQUES[activePos]||{};
  const filteredTechs=activeLevel==="All"
    ? levelKeys.flatMap(l=>(techsForPos[l]||[]).map(t=>({tech:t,level:l})))
    : (techsForPos[activeLevel]||[]).map(t=>({tech:t,level:activeLevel}));

  const catTechs=selectedCat?myTechs.filter(t=>t.category===selectedCat):[];

  const channels=[
    {name:"Chewjitsu",url:"https://www.youtube.com/@Chewjitsu",tag:"All levels"},
    {name:"Bernardo Faria BJJ",url:"https://www.youtube.com/@BernardoFariaBJJ",tag:"Competition"},
    {name:"Knight Jiu-Jitsu",url:"https://www.youtube.com/@KnightJiuJitsu",tag:"Beginner"},
    {name:"John Danaher",url:"https://www.youtube.com/results?search_query=John+Danaher+BJJ+tutorial",tag:"Systems"},
    {name:"Gordon Ryan",url:"https://www.youtube.com/results?search_query=Gordon+Ryan+BJJ+technique",tag:"Advanced"},
  ];

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Browse techniques & build your personal library">Technique Library</SectionTitle>

      {/* Tab toggle */}
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["library","📚 Library"],["custom","⭐ My Library"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setCustomTab(t);setSelectedCat(null);}} style={{flex:1,padding:"9px 0",background:customTab===t?T.teal:"none",color:customTab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {/* ── STANDARD LIBRARY ── */}
      {customTab==="library"&&(
        <>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:10,scrollbarWidth:"none"}}>
            {Object.keys(TECHNIQUES).map(p=>(
              <button key={p} onClick={()=>{setActivePos(p);setExpanded(null);}} style={{background:activePos===p?T.teal:T.surface,color:activePos===p?"#fff":T.muted,border:`1.5px solid ${activePos===p?T.teal:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontWeight:700}}>{p}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {["All",...levelKeys].map(l=>{
              const lc=l==="All"?{color:T.teal,bg:T.tealLight}:LEVEL_COLORS[l];
              const isActive=activeLevel===l;
              return <button key={l} onClick={()=>setActiveLevel(l)} style={{background:isActive?(l==="All"?T.teal:lc.color):"none",color:isActive?"#fff":lc?.color||T.muted,border:`1.5px solid ${lc?.color||T.teal}`,borderRadius:20,padding:"5px 13px",fontSize:11,cursor:"pointer",fontWeight:700,transition:"all 0.15s"}}>{l}</button>;
            })}
          </div>
          {filteredTechs.map(({tech,level})=>{
            const inMyLib=myTechs.some(t=>t.title===tech);
            return(
              <Card key={tech} onClick={()=>setExpanded(expanded===tech?null:tech)} style={{borderColor:expanded===tech?T.teal:T.border,background:expanded===tech?T.tealLight:T.card,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{tech}</div>
                    <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}>
                      <span style={{fontSize:10,color:T.muted}}>{activePos}</span>
                      <Pill label={level} color={LEVEL_COLORS[level].color} bg={LEVEL_COLORS[level].bg}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {/* Add to My Library */}
                    <button onClick={e=>{e.stopPropagation();addFromLibrary(tech,activePos,level);}}
                      title={inMyLib?confirmRemove===tech?"Tap again to remove":"Remove from My Library":"Add to My Library"}
                      style={{background:confirmRemove===tech?"#fee2e2":inMyLib?T.orangeLight:"none",border:`1.5px solid ${confirmRemove===tech?"#fca5a5":inMyLib?T.orange:T.border}`,borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:12,color:confirmRemove===tech?"#dc2626":inMyLib?T.orange:T.muted,fontWeight:700,transition:"all 0.15s"}}>
                      {confirmRemove===tech?"Remove?":inMyLib?"★ Saved":"☆ Save"}
                    </button>
                    <span style={{color:T.muted,fontSize:13}}>{expanded===tech?"▲":"▼"}</span>
                  </div>
                </div>
                {expanded===tech&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.teal}33`,animation:"fadeUp 0.2s ease"}}>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent("BJJ "+tech+" tutorial")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:10,background:"#fee2e244",border:"1.5px solid #fca5a544",borderRadius:12,padding:"12px 14px",textDecoration:"none",marginBottom:12}}>
                      <span style={{fontSize:26}}>▶️</span>
                      <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>Search "{tech}" on YouTube</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>Opens YouTube · BJJ tutorials</div></div>
                      <span style={{marginLeft:"auto",color:T.muted,fontSize:14}}>→</span>
                    </a>
                    <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>🎓 Recommended Channels</div>
                    {channels.map(ch=>(
                      <a key={ch.name} href={ch.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,textDecoration:"none",background:T.surface,border:`1px solid ${T.border}`,marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{ch.name}</span><Pill label={ch.tag}/>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* ── MY LIBRARY ── */}
      {customTab==="custom"&&(
        <>
          {/* Category drill-in */}
          {selectedCat?(
            <>
              <button onClick={()=>setSelectedCat(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.teal,fontWeight:700,fontSize:13,marginBottom:14}}>
                ← Back to categories
              </button>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text,marginBottom:4}}>{selectedCat}</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:14}}>{catTechs.length} technique{catTechs.length!==1?"s":""} saved</div>
              <Btn onClick={()=>{setTechForm(f=>({...f,category:selectedCat}));setAddingTech(true);}} style={{width:"100%",padding:"12px",fontSize:14,marginBottom:14}}>+ Add Technique to {selectedCat}</Btn>
              {catTechs.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:36,marginBottom:8}}>📭</div><div style={{fontSize:14}}>No techniques yet — add one above</div></div>}
              {catTechs.map(ct=>(
                <Card key={ct.id} onClick={()=>setViewTech(ct)} style={{cursor:"pointer",borderLeft:`4px solid ${LEVEL_COLORS[ct.level]?.color||T.teal}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:4}}>{ct.title}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <Pill label={ct.level||"—"} color={LEVEL_COLORS[ct.level]?.color||T.teal} bg={LEVEL_COLORS[ct.level]?.bg||T.tealLight}/>
                        {ct.url&&<Pill label={getLinkIcon(ct.url)} color={T.orange} bg={T.orangeLight}/>}
                      </div>
                      {ct.notes&&<div style={{fontSize:12,color:T.muted,marginTop:6,fontStyle:"italic",lineHeight:1.5}}>{ct.notes.slice(0,80)}{ct.notes.length>80?"...":""}</div>}
                    </div>
                    <span style={{color:T.muted,fontSize:13}}>→</span>
                  </div>
                </Card>
              ))}
            </>
          ):(
            <>
              {/* Recently Added */}
              {myTechs.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>🕐 Recently Added</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
                    {myTechs.slice(0,3).map(ct=>(
                      <button key={ct.id} onClick={()=>setViewTech(ct)}
                        style={{flexShrink:0,width:148,background:T.surface,border:`1.5px solid ${LEVEL_COLORS[ct.level]?.color||T.teal}55`,borderRadius:12,padding:"12px",textAlign:"left",cursor:"pointer",boxShadow:T.shadow,transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=LEVEL_COLORS[ct.level]?.color||T.teal;e.currentTarget.style.background=LEVEL_COLORS[ct.level]?.bg||T.tealLight;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=`${LEVEL_COLORS[ct.level]?.color||T.teal}55`;e.currentTarget.style.background=T.surface;}}>
                        <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:6,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ct.title}</div>
                        <Pill label={ct.level||"—"} color={LEVEL_COLORS[ct.level]?.color||T.teal} bg={LEVEL_COLORS[ct.level]?.bg||T.tealLight}/>
                        <div style={{fontSize:10,color:T.muted,marginTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ct.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                {myCategories.map(cat=>{
                  const count=myTechs.filter(t=>t.category===cat).length;
                  const icon=CAT_ICONS[cat]||"📂";
                  return(
                    <button key={cat} onClick={()=>setSelectedCat(cat)} style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",boxShadow:T.shadow}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.background=T.tealLight;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                      <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                      <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:2}}>{cat}</div>
                      <div style={{fontSize:11,color:T.muted}}>{count} technique{count!==1?"s":""}</div>
                    </button>
                  );
                })}
                {/* Add category tile */}
                <button onClick={()=>setAddingCat(true)} style={{background:"none",border:`1.5px dashed ${T.border}`,borderRadius:14,padding:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}>
                  <div style={{fontSize:28,marginBottom:8}}>➕</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.muted}}>New Category</div>
                </button>
              </div>

              {myCategories.length===0&&!addingCat&&(
                <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}>
                  <div style={{fontSize:40,marginBottom:10}}>📚</div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>Your library is empty</div>
                  <div style={{fontSize:13,marginBottom:16}}>Save techniques from the Library tab, or create your own categories</div>
                </div>
              )}

              {/* Add category inline */}
              {addingCat&&(
                <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight,marginBottom:4}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.teal,marginBottom:8}}>New Category Name</div>
                  <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="e.g. Rubber Guard, Leg Lock System..." autoFocus
                    onKeyDown={e=>{if(e.key==="Enter")addCategory();if(e.key==="Escape")setAddingCat(false);}}
                    style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:10}}/>
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={addCategory} disabled={!newCatName.trim()} style={{flex:1,padding:"10px"}}>Add</Btn>
                    <Btn onClick={()=>{setAddingCat(false);setNewCatName("");}} variant="ghost" style={{flex:1,padding:"10px"}}>Cancel</Btn>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* ── Add technique modal ── */}
      {addingTech&&(
        <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22}}>Add Technique</div>
              <button onClick={()=>setAddingTech(false)} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
            </div>
            {[{l:"Technique Name *",k:"title",ph:"e.g. Berimbolo, Outside Heel Hook..."},{l:"Category",k:"category",ph:"e.g. Open Guard, Leg Locks..."},{l:"Video / Link URL",k:"url",ph:"https://youtube.com/..."}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <input value={techForm[f.k]} onChange={e=>setTechForm({...techForm,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Level</div>
              <div style={{display:"flex",gap:6}}>
                {levelKeys.map(l=><button key={l} onClick={()=>setTechForm({...techForm,level:l})} style={{background:techForm.level===l?LEVEL_COLORS[l].color:T.surface,color:techForm.level===l?"#fff":T.muted,border:`1.5px solid ${techForm.level===l?LEVEL_COLORS[l].color:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{l}</button>)}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Key Notes</div>
              <textarea value={techForm.notes} onChange={e=>setTechForm({...techForm,notes:e.target.value})} rows={3} placeholder="Key details, cues, when to use, common mistakes..."
                style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <Btn onClick={saveNewTech} disabled={techLoading||!techForm.title} style={{width:"100%",padding:"14px",fontSize:15}}>
              {techLoading?<Spinner size={16} color="#fff"/>:"Save Technique ✓"}
            </Btn>
          </div>
        </div>
      )}

      {/* ── Technique detail modal ── */}
      {viewTech&&(
        <TechDetailModal tech={viewTech} onClose={()=>setViewTech(null)} onSave={saveEditTech} onDelete={delTech} levelKeys={levelKeys} getLinkIcon={getLinkIcon}/>
      )}
    </div>
  );
}

// Separate component to avoid hooks-in-callback issue
function TechDetailModal({tech,onClose,onSave,onDelete,levelKeys,getLinkIcon}){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({title:tech.title,category:tech.category,level:tech.level,url:tech.url||"",notes:tech.notes||""});
  const handleSave=()=>{onSave(tech.id,form);setEditing(false);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",maxHeight:"88vh",overflowY:"auto",animation:"slideUp 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div style={{flex:1}}>
            {editing?<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text,background:"none",border:`1.5px solid ${T.border}`,borderRadius:8,padding:"4px 8px",width:"100%",outline:"none"}}/>
              :<div style={{fontFamily:"'DM Serif Display'",fontSize:24,color:T.text}}>{tech.title}</div>}
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              <Pill label={form.level||"—"} color={LEVEL_COLORS[form.level]?.color||T.teal} bg={LEVEL_COLORS[form.level]?.bg||T.tealLight}/>
              {form.category&&<Pill label={form.category}/>}
            </div>
          </div>
          <button onClick={onClose} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted,flexShrink:0,marginLeft:10}}>✕</button>
        </div>

        {editing?(
          <>
            {[{l:"Category",k:"category",ph:"e.g. Open Guard"},{l:"Video / Link URL",k:"url",ph:"https://..."}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Level</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {levelKeys.map(l=><button key={l} onClick={()=>setForm({...form,level:l})} style={{background:form.level===l?LEVEL_COLORS[l].color:T.surface,color:form.level===l?"#fff":T.muted,border:`1.5px solid ${form.level===l?LEVEL_COLORS[l].color:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{l}</button>)}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Key Notes</div>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={4} maxLength={1000} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <Btn onClick={handleSave} style={{flex:1,padding:"12px"}}>Save Changes</Btn>
              <Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn>
            </div>
          </>
        ):(
          <>
            {form.url&&(
              <a href={form.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:T.orangeLight,border:`1.5px solid ${T.orange}33`,borderRadius:12,padding:"12px 14px",textDecoration:"none",marginBottom:14}}>
                <span style={{fontSize:22}}>▶️</span>
                <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>{getLinkIcon(form.url)}</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>{form.url.slice(0,50)}{form.url.length>50?"...":""}</div></div>
                <span style={{marginLeft:"auto",color:T.muted,fontSize:14}}>→</span>
              </a>
            )}
            {form.notes?(
              <Card style={{background:T.tealLight,border:`1px solid ${T.teal}33`,marginBottom:14}}>
                <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>📝 Key Notes</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.notes}</div>
              </Card>
            ):(
              <div style={{textAlign:"center",color:T.muted,padding:"16px 0",fontSize:13,fontStyle:"italic"}}>No notes yet — tap Edit to add some</div>
            )}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <Btn onClick={()=>setEditing(true)} variant="secondary" style={{flex:1,padding:"12px"}}>✏️ Edit</Btn>
              <button onClick={()=>onDelete(tech.id)} style={{flex:1,padding:"12px",background:"none",border:`1px solid #fca5a5`,borderRadius:12,color:"#dc2626",fontSize:13,fontWeight:700,cursor:"pointer"}}>🗑 Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── JOURNAL ENTRY MODAL ───────────────────────────────────────────────────────
function JournalEntryModal({entry,onClose,onSave,onDelete,confirmDel}){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({
    date:entry.date,duration:entry.duration,type:entry.type,
    techniques:entry.techniques||"",notes:entry.notes||"",learnings:entry.learnings||""
  });
  const [saving,setSaving]=useState(false);

  const handleSave=async()=>{
    setSaving(true);
    await onSave(entry.id,{...form,duration:Number(form.duration)});
    setSaving(false);
    setEditing(false);
  };

  const SESSION_TYPES=["Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:22}}>{editing?"Edit Session":"Session Details"}</div>
          <button onClick={onClose} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
        </div>

        {editing?(
          <>
            {/* Date + Duration */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Date</div>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Duration (min)</div>
                <input type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            </div>
            {/* Session type */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Session Type</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {SESSION_TYPES.map(t=><button key={t} onClick={()=>setForm({...form,type:t})} style={{background:form.type===t?(t==="Workout"?T.green:T.teal):T.surface,color:form.type===t?"#fff":T.muted,border:`1.5px solid ${form.type===t?(t==="Workout"?T.green:T.teal):T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t}</button>)}
              </div>
            </div>
            {/* Key Learnings */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>💡 Key Learnings</div>
              <textarea value={form.learnings} onChange={e=>setForm({...form,learnings:e.target.value})} rows={4} maxLength={1000} placeholder="What clicked today?" style={{width:"100%",background:T.tealLight,border:`1.5px solid ${T.teal}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            {/* Techniques drilled */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Techniques Drilled</div>
              <input value={form.techniques} onChange={e=>setForm({...form,techniques:e.target.value})} placeholder="e.g. Armbar, Triangle, Back take..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
            </div>
            {/* Notes */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Notes</div>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} maxLength={500} placeholder="Anything else..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={handleSave} disabled={saving} style={{flex:1,padding:"12px"}}>
                {saving?<Spinner size={16} color="#fff"/>:"Save Changes ✓"}
              </Btn>
              <Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn>
            </div>
          </>
        ):(
          <>
            {/* View mode */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <Pill label={entry.type}/>
              <Pill label={`${entry.duration} min`} color={T.orange} bg={T.orangeLight}/>
              <Pill label={entry.date} color={T.muted} bg={T.cardAlt}/>
            </div>
            {form.learnings?(
              <Card style={{background:T.tealLight,border:`1px solid ${T.teal}33`,marginBottom:10}}>
                <div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>💡 Key Learnings</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.learnings}</div>
              </Card>
            ):null}
            {form.techniques?(
              <Card style={{marginBottom:10}}>
                <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>🥋 Techniques Drilled</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{form.techniques}</div>
              </Card>
            ):null}
            {form.notes?(
              <Card style={{marginBottom:10}}>
                <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>📝 Notes</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.notes}</div>
              </Card>
            ):null}
            {!form.learnings&&!form.techniques&&!form.notes&&(
              <div style={{textAlign:"center",color:T.muted,padding:"20px 0",fontSize:13,fontStyle:"italic"}}>No details recorded — tap Edit to add some.</div>
            )}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <Btn onClick={()=>setEditing(true)} variant="secondary" style={{flex:1,padding:"12px"}}>✏️ Edit</Btn>
              <button onClick={()=>onDelete(entry.id)}
                style={{flex:1,padding:"12px",background:confirmDel===entry.id?"#fee2e2":"none",border:`1px solid ${confirmDel===entry.id?"#fca5a5":"#fca5a5"}`,borderRadius:12,color:"#dc2626",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                {confirmDel===entry.id?"Tap again to confirm":"🗑 Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SCHEDULE (merged Journal + Calendar) ─────────────────────────────────────
function ScheduleScreen({user}){
  const [subTab,setSubTab]=useState("journal"); // "journal" | "calendar"
  const [entries,setEntries]=useState([]);
  const [comps,setComps]=useState([]);
  const [loading,setLoading]=useState(true);
  const [adding,setAdding]=useState(false);
  const [saving,setSaving]=useState(false);
  const [showExtra,setShowExtra]=useState(false);
  const [form,setForm]=useState({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  // Search & filter
  const [searchText,setSearchText]=useState("");
  const [filterType,setFilterType]=useState("All");
  // Technique autocomplete
  const [myTechNames,setMyTechNames]=useState([]);
  const [showSuggestions,setShowSuggestions]=useState(false);
  // Journal-specific
  const [streak,setStreak]=useState(0);
  const [weeklyGoal,setWeeklyGoal]=useState(3);
  const [goalInput,setGoalInput]=useState(3);
  const [savingGoal,setSavingGoal]=useState(false);
  const [editingGoal,setEditingGoal]=useState(false);
  const [confirmDelEntry,setConfirmDelEntry]=useState(null);
  const [viewEntry,setViewEntry]=useState(null);
  // Calendar-specific
  const today=new Date();
  const [viewDate,setViewDate]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [selectedDay,setSelectedDay]=useState(null);

  const getWeekKey=(dateStr)=>{
    const d=new Date(dateStr+"T12:00:00");
    const dow=d.getDay();
    const diffToMon=(dow===0?-6:1-dow);
    const mon=new Date(d);mon.setDate(d.getDate()+diffToMon);
    return mon.toISOString().split("T")[0];
  };

  const calcStreak=(entryList,goal)=>{
    if(!goal||goal<=0) return 0;
    const weekCounts={};
    entryList.forEach(e=>{
      const wk=getWeekKey(e.date);
      weekCounts[wk]=(weekCounts[wk]||0)+1;
    });
    const thisWeekKey=getWeekKey(todayStr());
    let s=0;
    let cursor=new Date(thisWeekKey+"T12:00:00");
    for(let i=0;i<200;i++){
      const key=cursor.toISOString().split("T")[0];
      if(weekCounts[key]&&weekCounts[key]>=goal){
        s++;
        cursor.setDate(cursor.getDate()-7);
      } else if(key===thisWeekKey){
        cursor.setDate(cursor.getDate()-7);
        continue;
      } else {
        break;
      }
    }
    return s;
  };

  const fetchData=async()=>{
    const[{data:j},{data:c},{data:p},{data:techs}]=await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id",user.id).order("date",{ascending:false}).order("created_at",{ascending:false}),
      supabase.from("competitions").select("*").eq("user_id",user.id),
      supabase.from("profiles").select("weekly_goal").eq("id",user.id).single(),
      supabase.from("custom_techniques").select("title").eq("user_id",user.id),
    ]);
    const goal=(p?.weekly_goal)||3;
    if(j){
      setEntries(j);
      setStreak(calcStreak(j,goal));
    }
    if(c)setComps(c);
    if(techs)setMyTechNames([...new Set(techs.map(t=>t.title))]);
    setWeeklyGoal(goal);
    setGoalInput(goal);
    setLoading(false);
  };
  useEffect(()=>{fetchData();},[user.id]);

  const saveGoal=async()=>{
    setSavingGoal(true);
    await supabase.from("profiles").upsert({id:user.id,weekly_goal:Number(goalInput),updated_at:new Date().toISOString()});
    setWeeklyGoal(Number(goalInput));
    setStreak(calcStreak(entries,Number(goalInput)));
    setEditingGoal(false);setSavingGoal(false);
  };

  const saveEntry=async()=>{
    setSaving(true);
    const{data,error}=await supabase.from("journal_entries").insert({user_id:user.id,...form,duration:Number(form.duration)}).select().single();
    if(error){console.error("Failed to save entry:",error.message);setSaving(false);return;}
    if(data){
      const updated=[data,...entries];
      setEntries(updated);
      setStreak(calcStreak(updated,weeklyGoal));
    }
    setSaving(false);setAdding(false);setShowExtra(false);
    setForm({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  };

  const delEntry=async(id)=>{
    if(confirmDelEntry!==id){
      setConfirmDelEntry(id);
      setTimeout(()=>setConfirmDelEntry(null),3000);
      return;
    }
    const{error}=await supabase.from("journal_entries").delete().eq("id",id);
    if(error){console.error("Failed to delete entry:",error.message);return;}
    const updated=entries.filter(x=>x.id!==id);
    setEntries(updated);
    setStreak(calcStreak(updated,weeklyGoal));
    setConfirmDelEntry(null);
    setViewEntry(null);
  };

  const updateEntry=async(id,fields)=>{
    const{error}=await supabase.from("journal_entries").update(fields).eq("id",id);
    if(error){console.error("Failed to update entry:",error.message);return;}
    const updated=entries.map(x=>x.id===id?{...x,...fields}:x);
    setEntries(updated);
    setViewEntry(v=>v&&v.id===id?{...v,...fields}:v);
  };

  // Journal helpers
  const thisWeekKey=getWeekKey(todayStr());
  const sessionsThisWeek=entries.filter(e=>getWeekKey(e.date)===thisWeekKey).length;
  const goalHit=sessionsThisWeek>=weeklyGoal;
  const last7=Array.from({length:7}).map((_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const key=d.toISOString().split("T")[0];
    return{key,label:dayName(key),trained:entries.some(e=>e.date===key)};
  });
  const totalMins=entries.reduce((a,e)=>a+Number(e.duration||0),0);

  // Calendar helpers
  const year=viewDate.getFullYear(),month=viewDate.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthName=viewDate.toLocaleDateString("en",{month:"long",year:"numeric"});
  const prevMonth=()=>setViewDate(new Date(year,month-1,1));
  const nextMonth=()=>setViewDate(new Date(year,month+1,1));
  const getDayData=(day)=>{
    const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return{dateStr,trained:entries.filter(e=>e.date===dateStr),comp:comps.find(c=>c.date===dateStr)};
  };
  const selectedData=selectedDay?getDayData(selectedDay):null;

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Log sessions and track your training">Schedule</SectionTitle>

      {/* Sub-tab toggle */}
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["journal","📓 Journal"],["calendar","📅 Calendar"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setSubTab(t);setSelectedDay(null);}} style={{flex:1,padding:"9px 0",background:subTab===t?T.teal:"none",color:subTab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {/* ── JOURNAL SUB-TAB ── */}
      {subTab==="journal"&&(
        <>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <StatBox label="Wk Streak" value={streak} icon="🔥" color={T.orange} bg={T.orangeLight}/>
            <StatBox label="Sessions" value={entries.length} icon="🥋" color={T.teal} bg={T.tealLight}/>
            <StatBox label="Hours" value={Math.floor(totalMins/60)} icon="⏱" color={T.green} bg={T.greenLight}/>
          </div>
          {/* Weekly Goal */}
          <Card style={{background:goalHit?T.greenLight:T.cardAlt,border:`1.5px solid ${goalHit?T.green+"44":T.border}`,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>Weekly Goal</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:goalHit?T.green:T.text}}>{sessionsThisWeek}<span style={{fontSize:14,color:T.muted,fontWeight:400}}> / {weeklyGoal}</span></div>
                  {goalHit&&<span style={{fontSize:13,color:T.green,fontWeight:700}}>✓ Goal hit!</span>}
                </div>
                <div style={{marginTop:6,display:"flex",gap:4}}>
                  {Array.from({length:weeklyGoal}).map((_,i)=>(
                    <div key={i} style={{width:28,height:8,borderRadius:4,background:i<sessionsThisWeek?(goalHit?T.green:T.teal):T.border,transition:"background 0.3s"}}/>
                  ))}
                </div>
              </div>
              <button onClick={()=>{setEditingGoal(e=>!e);setGoalInput(weeklyGoal);}} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",fontSize:12,fontWeight:700,color:T.muted,cursor:"pointer"}}>
                {editingGoal?"✕":"Edit"}
              </button>
            </div>
            {editingGoal&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{fontSize:12,color:T.muted,fontWeight:600}}>Sessions per week:</div>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5,6,7].map(n=>(
                    <button key={n} onClick={()=>setGoalInput(n)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${goalInput===n?T.teal:T.border}`,background:goalInput===n?T.teal:T.surface,color:goalInput===n?"#fff":T.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>{n}</button>
                  ))}
                </div>
                <Btn onClick={saveGoal} disabled={savingGoal} style={{padding:"6px 14px",fontSize:12,marginLeft:"auto"}}>
                  {savingGoal?<Spinner size={14} color="#fff"/>:"Save"}
                </Btn>
              </div>
            )}
          </Card>
          <Card style={{background:T.cardAlt}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Last 7 Days</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Tap an empty day to log a session</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              {last7.map(d=>(
                <div key={d.key} style={{textAlign:"center"}} onClick={()=>{if(!d.trained){setForm(f=>({...f,date:d.key}));setAdding(true);}}}>
                  <div style={{width:34,height:34,borderRadius:10,background:d.trained?T.teal:T.surface,border:`1.5px solid ${d.trained?T.teal:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:4,color:"#fff",fontWeight:700,cursor:d.trained?"default":"pointer",transition:"transform 0.15s"}}
                    onMouseEnter={e=>{if(!d.trained)e.currentTarget.style.transform="scale(1.1)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
                    {d.trained?"✓":""}
                  </div>
                  <div style={{fontSize:10,color:T.muted,fontWeight:600}}>{d.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <Btn onClick={()=>setAdding(true)} style={{width:"100%",padding:"14px",fontSize:15,marginBottom:14,marginTop:2}}>+ Log Today's Session</Btn>
          {/* Search & filter */}
          {!loading&&entries.length>0&&(
            <div style={{marginBottom:12}}>
              <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search learnings, techniques, notes..."
                style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",marginBottom:8}}/>
              <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
                {["All","Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"].map(ft=>(
                  <button key={ft} onClick={()=>setFilterType(ft)} style={{background:filterType===ft?T.teal:T.surface,color:filterType===ft?"#fff":T.muted,border:`1.5px solid ${filterType===ft?T.teal:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{ft}</button>
                ))}
              </div>
            </div>
          )}
          {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>}
          {!loading&&entries.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}><div style={{fontSize:40,marginBottom:10}}>📓</div><div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>No sessions yet</div><div style={{fontSize:13}}>Start logging your journey on the mats!</div></div>}
          {(()=>{
            const q=searchText.toLowerCase().trim();
            const filtered=entries.filter(e=>{
              if(filterType!=="All"&&e.type!==filterType) return false;
              if(!q) return true;
              return [e.learnings,e.techniques,e.notes,e.type].filter(Boolean).some(f=>f.toLowerCase().includes(q));
            });
            if(!loading&&entries.length>0&&filtered.length===0) return(
              <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:32,marginBottom:8}}>🔍</div><div style={{fontSize:14}}>No sessions match your search</div></div>
            );
            return filtered.map(e=>(
            <Card key={e.id} onClick={()=>setViewEntry(e)} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Pill label={e.type} color={e.type==="Workout"?T.green:T.teal} bg={e.type==="Workout"?T.greenLight:T.tealLight}/><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{e.date}</span><span style={{fontSize:11,color:T.muted}}>· {e.duration} min</span></div>
                  {e.type==="Workout"?(
                    <>
                      {e.techniques&&<div style={{background:T.greenLight,border:`1px solid ${T.green}33`,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:10,color:T.green,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>💪 Workout</div><div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{e.techniques.slice(0,80)}{e.techniques.length>80?"...":""}</div></div>}
                      {e.notes&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{e.notes.slice(0,80)}{e.notes.length>80?"...":""}</div>}
                    </>
                  ):(
                    <>
                      {e.learnings&&<div style={{background:T.tealLight,border:`1px solid ${T.teal}33`,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>💡 Key Learnings</div><div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{e.learnings.slice(0,120)}{e.learnings.length>120?"...":""}</div></div>}
                      {e.techniques&&<div style={{fontSize:12,color:T.muted,marginBottom:2}}><span style={{color:T.text,fontWeight:600}}>Drilled: </span>{e.techniques.slice(0,80)}{e.techniques.length>80?"...":""}</div>}
                      {e.notes&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{e.notes.slice(0,80)}{e.notes.length>80?"...":""}</div>}
                    </>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,marginLeft:8,flexShrink:0}}>
                  <button onClick={ev=>{ev.stopPropagation();delEntry(e.id);}}
                    style={{background:confirmDelEntry===e.id?"#fee2e2":"none",border:confirmDelEntry===e.id?"1px solid #fca5a5":"none",borderRadius:8,color:confirmDelEntry===e.id?"#dc2626":T.subtle,cursor:"pointer",fontSize:confirmDelEntry===e.id?10:16,fontWeight:700,padding:confirmDelEntry===e.id?"4px 7px":"0",whiteSpace:"nowrap",transition:"all 0.15s"}}>
                    {confirmDelEntry===e.id?"Sure?":"✕"}
                  </button>
                  <span style={{fontSize:11,color:T.muted}}>→</span>
                </div>
              </div>
            </Card>
          ));
          })()}
        </>
      )}

      {/* ── CALENDAR SUB-TAB ── */}
      {subTab==="calendar"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <button onClick={prevMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:38,height:38,cursor:"pointer",fontSize:18,color:T.text}}>‹</button>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text}}>{monthName}</div>
            <button onClick={nextMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:38,height:38,cursor:"pointer",fontSize:18,color:T.text}}>›</button>
          </div>
          <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            {[{color:T.teal,label:"Training"},{color:T.orange,label:"Competition"},{color:T.green,label:"Today"}].map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><div style={{width:10,height:10,borderRadius:3,background:l.color}}/>{l.label}</div>
            ))}
          </div>
          {loading?<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>:(
            <Card style={{padding:"12px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8}}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:T.muted,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const day=i+1;
                  const{dateStr,trained,comp}=getDayData(day);
                  const isToday=dateStr===todayStr(),isSelected=selectedDay===day,hasTrain=trained.length>0;
                  return(
                    <div key={day} onClick={()=>setSelectedDay(selectedDay===day?null:day)}
                      style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:10,cursor:"pointer",background:isSelected?T.teal:isToday?T.greenLight:hasTrain?T.tealLight:comp?T.orangeLight:"transparent",border:`1.5px solid ${isSelected?T.teal:isToday?T.green:hasTrain?T.teal+"44":comp?T.orange+"44":"transparent"}`,transition:"all 0.15s"}}>
                      <span style={{fontSize:13,fontWeight:isToday?700:500,color:isSelected?"#fff":isToday?T.green:T.text}}>{day}</span>
                      <div style={{display:"flex",gap:2,marginTop:1}}>
                        {hasTrain&&<div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"#fff":T.teal}}/>}
                        {comp&&<div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"#fff":T.orange}}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {selectedDay&&selectedData&&(
            <div style={{animation:"fadeUp 0.2s ease"}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,margin:"14px 0 10px"}}>{selectedData.dateStr}</div>
              {selectedData.comp&&<Card style={{borderLeft:`4px solid ${T.orange}`,marginBottom:8}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:22}}>🏆</span><div><div style={{fontWeight:700,fontSize:14}}>{selectedData.comp.name||"Competition"}</div><div style={{fontSize:12,color:T.muted}}>{selectedData.comp.weight} · {selectedData.comp.gi}</div></div></div></Card>}
              {selectedData.trained.map(e=>(
                <Card key={e.id} style={{borderLeft:`4px solid ${T.teal}`}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}><Pill label={e.type}/><span style={{fontSize:11,color:T.muted}}>{e.duration} min</span></div>
                  {e.learnings&&<div style={{fontSize:12,color:T.text,marginTop:4}}>{e.learnings.slice(0,100)}{e.learnings.length>100?"...":""}</div>}
                </Card>
              ))}
              {selectedData.trained.length===0&&!selectedData.comp&&<Btn onClick={()=>{setForm(f=>({...f,date:selectedData.dateStr}));setAdding(true);}} style={{width:"100%",padding:"12px",marginBottom:4}}>+ Log Session for This Day</Btn>}
            </div>
          )}
        </>
      )}

      {/* ── SHARED LOG SESSION MODAL ── */}
      {adding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:24}}>Log Session</div>
              <button onClick={()=>{setAdding(false);setShowExtra(false);}} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{l:"Date",k:"date",t:"date"},{l:"Duration (min)",k:"duration",t:"number"}].map(f=>(
                <div key={f.k}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",colorScheme:"light"}}/></div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Session Type</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"].map(t=>(
                  <button key={t} onClick={()=>setForm({...form,type:t})} style={{background:form.type===t?(t==="Workout"?T.green:T.teal):T.surface,color:form.type===t?"#fff":T.muted,border:`1.5px solid ${form.type===t?(t==="Workout"?T.green:T.teal):T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t}</button>
                ))}
              </div>
            </div>
            {form.type==="Workout"?(
              <>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:T.green,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>💪 Workout Type</div>
                  <input value={form.techniques} onChange={e=>setForm({...form,techniques:e.target.value})} placeholder="e.g. Upper body, Legs, Cardio, Full body..."
                    style={{width:"100%",background:T.greenLight,border:`1.5px solid ${T.green}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>General Notes</div>
                  <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} placeholder="What did you work on? How did it go?"
                    style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
                </div>
              </>
            ):(
              <>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>💡 Key Learnings</div>
                  <textarea value={form.learnings} onChange={e=>setForm({...form,learnings:e.target.value})} rows={3} placeholder="What clicked today? Any 'aha' moments?" style={{width:"100%",background:T.tealLight,border:`1.5px solid ${T.teal}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
                </div>
                <button onClick={()=>setShowExtra(v=>!v)} style={{width:"100%",background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"10px",cursor:"pointer",color:T.muted,fontSize:13,fontWeight:600,marginBottom:showExtra?14:20}}>
                  {showExtra?"▲ Hide details":"▼ Add more details (techniques, notes)"}
                </button>
                {showExtra&&(
                  <>
                    <div style={{marginBottom:14,position:"relative"}}>
                      <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Techniques Drilled</div>
                      <textarea value={form.techniques} onChange={e=>{setForm({...form,techniques:e.target.value});setShowSuggestions(true);}} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),200)} rows={2} placeholder="e.g. Triangle setup, knee slice pass..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
                      {showSuggestions&&form.techniques&&(()=>{
                        const lastPart=(form.techniques.split(",").pop()||"").trim().toLowerCase();
                        if(!lastPart||lastPart.length<2) return null;
                        const matches=myTechNames.filter(t=>t.toLowerCase().includes(lastPart)&&!form.techniques.toLowerCase().includes(t.toLowerCase())).slice(0,5);
                        if(matches.length===0) return null;
                        return(
                          <div style={{position:"absolute",left:0,right:0,top:"100%",background:T.surface,border:`1.5px solid ${T.teal}`,borderRadius:10,boxShadow:T.shadow,zIndex:20,maxHeight:160,overflowY:"auto",marginTop:2}}>
                            {matches.map(m=>(
                              <button key={m} onMouseDown={e=>{e.preventDefault();const parts=form.techniques.split(",");parts[parts.length-1]=" "+m;setForm({...form,techniques:parts.join(",")+", "});setShowSuggestions(false);}}
                                style={{width:"100%",textAlign:"left",padding:"8px 12px",background:"none",border:"none",borderBottom:`1px solid ${T.border}`,color:T.text,fontSize:13,cursor:"pointer"}}
                                onMouseEnter={e=>{e.currentTarget.style.background=T.tealLight;}}
                                onMouseLeave={e=>{e.currentTarget.style.background="none";}}>
                                {m}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{marginBottom:20}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>General Notes</div><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} placeholder="How did the session feel?" style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/></div>
                  </>
                )}
              </>
            )}
            <Btn onClick={saveEntry} disabled={saving} style={{width:"100%",padding:"15px",fontSize:15}}>
              {saving?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/>Saving...</span>:"Save Session ✓"}
            </Btn>
          </div>
        </div>
      )}

      {/* ── Entry detail / edit modal ── */}
      {viewEntry&&<JournalEntryModal entry={viewEntry} onClose={()=>setViewEntry(null)} onSave={updateEntry} onDelete={delEntry} confirmDel={confirmDelEntry}/>}
    </div>
  );
}

// ── COMPETITION ───────────────────────────────────────────────────────────────
// ── Flow Section Component (must live outside CompScreen to prevent focus loss) ──
function FlowSection({posId,side,color,d,allPositions,saveFlowField}){
  const sideData=d||{};
  const fields=[
    {pKey:"p1",lKey:"p1leads",label:"① Primary",ph:"Your main attack / technique from this position..."},
    {pKey:"p2",lKey:"p2leads",label:"② Backup",ph:"If primary is shut down or defended..."},
    {pKey:"p3",lKey:"p3leads",label:"③ If that fails",ph:"Last resort, reset or survival plan..."},
  ];
  return(
    <div>
      {fields.map(({pKey,lKey,label},i)=>(
        <div key={pKey} style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:i===0?color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{label}</div>
          <textarea value={sideData[pKey]||""} onChange={e=>saveFlowField(posId,side,pKey,e.target.value)}
            rows={2} maxLength={300} placeholder={fields[i].ph}
            style={{width:"100%",background:T.surface,border:`1.5px solid ${sideData[pKey]?.trim()?color+"55":T.border}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,marginBottom:4}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,flexShrink:0}}>→ leads to</span>
            <select value={sideData[lKey]||""} onChange={e=>saveFlowField(posId,side,lKey,e.target.value)}
              style={{flex:1,background:sideData[lKey]?T.tealLight:T.surface,border:`1px solid ${sideData[lKey]?color+"55":T.border}`,borderRadius:8,padding:"5px 8px",color:sideData[lKey]?T.text:T.muted,fontSize:11,outline:"none",cursor:"pointer"}}>
              <option value="">— optional —</option>
              {allPositions.filter(p=>p.id!==posId).map(p=>(
                <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
              ))}
            </select>
          </div>
          {i<2&&<div style={{textAlign:"center",fontSize:11,color:T.subtle,margin:"4px 0"}}>↓ if blocked</div>}
        </div>
      ))}
    </div>
  );
}

function CompScreen({user}){
  const [tab,setTab]=useState("gameplan");
  // Flow data: {posId: {attack:{p1,p1leads,p2,p2leads,p3,p3leads}, defence:{p1,p1leads,p2,p2leads,p3,p3leads}}, mental:{...}}
  const [flowData,setFlowData]=useState({});
  const [customPositions,setCustomPositions]=useState([]);
  const [gpLoading,setGpLoading]=useState(true);
  const [openPos,setOpenPos]=useState("standing");
  const [openSide,setOpenSide]=useState("attack"); // "attack"|"defence" per position
  const [flowView,setFlowView]=useState("build"); // "build"|"flow"
  const [flowChainType,setFlowChainType]=useState("attack"); // "attack"|"defence"
  const [addingCustomPos,setAddingCustomPos]=useState(false);
  const [customPosName,setCustomPosName]=useState("");
  const [customPosSides,setCustomPosSides]=useState({attack:true,defence:true});
  const [myComps,setMyComps]=useState([]);
  const [compsLoading,setCompsLoading]=useState(true);
  const [addComp,setAddComp]=useState(false);
  const [compForm,setCompForm]=useState({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  const [eventsLoading,setEventsLoading]=useState(false);
  const [aiEvents,setAiEvents]=useState([]);
  const [eventsError,setEventsError]=useState("");
  const [ibjjfBelt,setIbjjfBelt]=useState("White / Blue");
  const [ibjjfSearch,setIbjjfSearch]=useState("");
  const [savingEvent,setSavingEvent]=useState(null);
  const [confirmDelComp,setConfirmDelComp]=useState(null);
  const [userLocation,setUserLocation]=useState("");
  const [locationLoaded,setLocationLoaded]=useState(false);
  const saveTimer=useRef({});

  const allPositions=[...CORE_POSITIONS,...customPositions];

  useEffect(()=>{
    supabase.from("game_plan").select("*").eq("user_id",user.id).then(({data})=>{
      if(data){
        const g={};
        data.forEach(r=>{
          if(r.position_key==="__custom_positions__"){
            try{setCustomPositions(JSON.parse(r.value)||[]);}catch(e){}
          } else {
            try{g[r.position_key]=JSON.parse(r.value);}
            catch(e){g[r.position_key]={};}
          }
        });
        setFlowData(g);
      }
      setGpLoading(false);
    });
    supabase.from("competitions").select("*").eq("user_id",user.id).order("date",{ascending:true}).then(({data})=>{
      if(data)setMyComps(data);setCompsLoading(false);
    });
    supabase.from("profiles").select("location").eq("id",user.id).single().then(({data})=>{
      if(data?.location)setUserLocation(data.location);
      setLocationLoaded(true);
    });
    return()=>{ Object.values(saveTimer.current).forEach(clearTimeout); };
  },[user.id]);

  const saveFlowField=(posId,side,field,val)=>{
    setFlowData(prev=>{
      const updated={...prev,[posId]:{...prev[posId],[side]:{...(prev[posId]?.[side]||{}),[field]:val}}};
      clearTimeout(saveTimer.current[`${posId}_${side}`]);
      saveTimer.current[`${posId}_${side}`]=setTimeout(async()=>{
        await supabase.from("game_plan").upsert({user_id:user.id,position_key:posId,value:JSON.stringify(updated[posId]),updated_at:new Date().toISOString()},{onConflict:"user_id,position_key"});
      },800);
      return updated;
    });
  };

  const saveCustomPositions=(positions)=>{
    setCustomPositions(positions);
    supabase.from("game_plan").upsert({user_id:user.id,position_key:"__custom_positions__",value:JSON.stringify(positions),updated_at:new Date().toISOString()},{onConflict:"user_id,position_key"});
  };

  const addCustomPosition=()=>{
    const n=customPosName.trim();
    if(!n) return;
    const newPos={id:`custom_${Date.now()}`,label:n,icon:"📌",color:"#64748b",sides:{attack:customPosSides.attack,defence:customPosSides.defence}};
    saveCustomPositions([...customPositions,newPos]);
    setCustomPosName("");setAddingCustomPos(false);setCustomPosSides({attack:true,defence:true});
  };

  // Build chain by following primary leadsTo for a given side
  const buildChain=(side)=>{
    const chain=[];
    const visited=new Set();
    const startPos=allPositions.find(p=>flowData[p.id]?.[side]?.p1?.trim());
    if(!startPos) return [];
    // prefer standing
    let current=(flowData["standing"]?.[side]?.p1?.trim())?"standing":startPos.id;
    while(current&&!visited.has(current)){
      const pos=allPositions.find(p=>p.id===current);
      const d=flowData[current]?.[side]||{};
      if(!pos||!d.p1?.trim()) break;
      chain.push({pos,d});
      visited.add(current);
      const nextId=d.p1leads?.trim();
      current=nextId?allPositions.find(p=>p.id===nextId)?.id:null;
    }
    return chain;
  };

  // Completion: count positions that have at least p1 filled on at least one side
  const filledCount=allPositions.filter(p=>{
    const d=flowData[p.id]||{};
    return d.attack?.p1?.trim()||d.defence?.p1?.trim()||d.mental;
  }).length;
  const pct=allPositions.length>0?Math.round((filledCount/allPositions.length)*100):0;

  const saveComp=async()=>{
    const{data,error}=await supabase.from("competitions").insert({user_id:user.id,...compForm}).select().single();
    if(error){console.error("Failed to save competition:",error.message);return;}
    if(data)setMyComps(c=>[...c,data].sort((a,b)=>new Date(a.date)-new Date(b.date)));
    setAddComp(false);setCompForm({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  };
  const delComp=async(id)=>{
    if(confirmDelComp!==id){setConfirmDelComp(id);setTimeout(()=>setConfirmDelComp(null),3000);return;}
    const{error}=await supabase.from("competitions").delete().eq("id",id);
    if(error){console.error("Failed to delete competition:",error.message);return;}
    setMyComps(c=>c.filter(x=>x.id!==id));setConfirmDelComp(null);
  };
  const addAiEventToMyEvents=async(ev,idx)=>{
    setSavingEvent(idx);
    const row={user_id:user.id,name:ev.name,date:ev.date||"",weight:"",gi:"Gi",goal:"",notes:ev.location?`${ev.location}${ev.organiser?" · "+ev.organiser:""}`:"",};
    const{data,error}=await supabase.from("competitions").insert(row).select().single();
    if(error){setSavingEvent(null);return;}
    if(data)setMyComps(c=>[...c,data].sort((a,b)=>new Date(a.date)-new Date(b.date)));
    setSavingEvent(null);
  };
  const fetchAiEvents=async()=>{
    if(!userLocation.trim()){setEventsError("Set your location in your profile (Home → Edit Profile) to search for events.");return;}
    setEventsLoading(true);setEventsError("");setAiEvents([]);
    const futureYear=new Date().getFullYear();
    const loc=userLocation.trim();
    try{
      const{data:{session}}=await supabase.auth.getSession();
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for UPCOMING (future dates only, after today ${todayStr()}) BJJ and Brazilian Jiu-Jitsu competitions, tournaments and open mats in and around ${loc} in ${futureYear} and ${futureYear+1}. Only include events that have NOT yet happened. Return ONLY a valid JSON array with no markdown, no explanation. Each object: { "name": string, "date": "YYYY-MM-DD or null", "location": string, "organiser": string, "url": string or null }. Maximum 8 events. If no future events found, return [].`}]})});
      if(!res.ok){throw new Error(`API error: ${res.status}`);}
      const data=await res.json();
      const text=(data.content||[]).map(b=>b.type==="text"?b.text:"").join("");
      const clean=text.replace(/```json|```/g,"").trim();
      const start=clean.indexOf("["),end=clean.lastIndexOf("]");
      if(start!==-1&&end!==-1){
        let parsed;try{parsed=JSON.parse(clean.slice(start,end+1));}catch(parseErr){setEventsError("Couldn't parse event data. Try again.");setEventsLoading(false);return;}
        if(!Array.isArray(parsed)){setEventsError("Unexpected response format.");setEventsLoading(false);return;}
        const future=parsed.filter(ev=>ev&&typeof ev==="object"&&(!ev.date||!isDatePast(ev.date)));
        setAiEvents(future);
        if(future.length===0)setEventsError("No upcoming events found right now. Check the links below.");
      }else{setEventsError("No structured events found. Use the links below to find events.");}
    }catch(e){setEventsError("Search unavailable. Use the links below to find events.");}
    setEventsLoading(false);
  };

  const levelKey=BELT_LEVEL_MAP[ibjjfBelt];
  const filteredMoves=IBJJF_ILLEGAL_MOVES.filter(m=>m.levels.includes(levelKey)&&(!ibjjfSearch||m.move.toLowerCase().includes(ibjjfSearch.toLowerCase())));



  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Plan, prepare, and compete with confidence">Competition Prep</SectionTitle>
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["gameplan","🗺 Game Plan"],["comps","🏆 Events"],["rules","📋 Rules"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",background:tab===t?T.teal:"none",color:tab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {/* ── GAME PLAN / FLOW BUILDER ── */}
      {tab==="gameplan"&&(
        <div>
          {gpLoading?<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>:(
            <>
              {/* Completion bar */}
              <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.teal}}>Game Plan Completion</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:T.teal}}>{pct}%</div>
                </div>
                <div style={{background:T.surface,borderRadius:8,height:8,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${pct}%`,background:T.teal,borderRadius:8,transition:"width 0.5s ease"}}/>
                </div>
                <div style={{fontSize:11,color:T.muted}}>{filledCount} of {allPositions.length} positions started · Auto-saves as you type</div>
              </Card>

              {/* Build / Flow toggle */}
              <div style={{display:"flex",background:T.surface,borderRadius:10,padding:3,marginBottom:14,border:`1px solid ${T.border}`}}>
                {[["build","🔧 Build"],["flow","⚡ A-Game Flow"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setFlowView(v)} style={{flex:1,padding:"8px 0",background:flowView===v?"#1e2d40":"none",color:flowView===v?"#fff":T.muted,border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
                ))}
              </div>

              {/* ── BUILD VIEW ── */}
              {flowView==="build"&&(
                <>
                  {allPositions.map(pos=>{
                    const d=flowData[pos.id]||{};
                    const isOpen=openPos===pos.id;
                    const isCustom=customPositions.some(p=>p.id===pos.id);
                    const hasSides=isCustom?{attack:pos.sides?.attack!==false,defence:pos.sides?.defence!==false}:{attack:true,defence:true};
                    const atkFilled=[d.attack?.p1,d.attack?.p2,d.attack?.p3].filter(v=>v?.trim()).length;
                    const defFilled=[d.defence?.p1,d.defence?.p2,d.defence?.p3].filter(v=>v?.trim()).length;
                    const totalFilled=atkFilled+defFilled;
                    return(
                      <div key={pos.id} style={{marginBottom:8}}>
                        {/* Position header button */}
                        <button onClick={()=>setOpenPos(isOpen?null:pos.id)}
                          style={{width:"100%",background:isOpen?pos.color:T.surface,border:`1.5px solid ${isOpen?pos.color:T.border}`,borderRadius:isOpen?"12px 12px 0 0":12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",boxShadow:T.shadow,transition:"all 0.2s"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:20}}>{pos.icon}</span>
                            <div>
                              <div style={{fontWeight:700,fontSize:14,color:isOpen?"#fff":T.text}}>{pos.label}</div>
                              <div style={{fontSize:11,color:isOpen?"rgba(255,255,255,0.65)":T.muted,marginTop:1}}>
                                {totalFilled===0?"Not started":`${atkFilled} attack · ${defFilled} defence options filled`}
                              </div>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            {/* Dot indicators: attack (orange) / defence (teal) */}
                            <div style={{display:"flex",gap:3}}>
                              {[0,1,2].map(i=><div key={`a${i}`} style={{width:6,height:6,borderRadius:"50%",background:d.attack?.[`p${i+1}`]?.trim()?(isOpen?"rgba(255,255,255,0.9)":T.orange):(isOpen?"rgba(255,255,255,0.25)":T.border)}}/>)}
                            </div>
                            <div style={{width:1,height:14,background:isOpen?"rgba(255,255,255,0.3)":T.border}}/>
                            <div style={{display:"flex",gap:3}}>
                              {[0,1,2].map(i=><div key={`d${i}`} style={{width:6,height:6,borderRadius:"50%",background:d.defence?.[`p${i+1}`]?.trim()?(isOpen?"rgba(255,255,255,0.9)":T.teal):(isOpen?"rgba(255,255,255,0.25)":T.border)}}/>)}
                            </div>
                            {isCustom&&(
                              <button onClick={e=>{e.stopPropagation();saveCustomPositions(customPositions.filter(p=>p.id!==pos.id));}}
                                style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:11,color:isOpen?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                            )}
                            <span style={{color:isOpen?"#fff":T.muted,fontSize:13}}>{isOpen?"▲":"▼"}</span>
                          </div>
                        </button>

                        {/* Expanded panel */}
                        {isOpen&&(
                          <div style={{background:T.cardAlt,border:`1.5px solid ${pos.color}33`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"0 0 12px",animation:"fadeUp 0.2s ease"}}>
                            {/* Attack / Defence sub-tabs */}
                            <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
                              {[
                                ...(hasSides.attack?[["attack","⚔️ Attack",T.orange]]:
                                []),
                                ...(hasSides.defence?[["defence","🛡️ Defence",T.teal]]:[]),
                                ...(!pos.id.startsWith("custom_")&&pos.id==="mental"?[["mental","📋 Mental",T.muted]]:[]),
                              ].map(([s,l,c])=>(
                                <button key={s} onClick={()=>setOpenSide(s)}
                                  style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2.5px solid ${openSide===s?c:"transparent"}`,color:openSide===s?c:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
                              ))}
                              {["attack","defence"].includes(openSide)&&(
                                <button key="mental_tab" onClick={()=>setOpenSide("mental")}
                                  style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2.5px solid ${openSide==="mental"?"#8b5cf6":"transparent"}`,color:openSide==="mental"?"#8b5cf6":T.muted,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>📋 Notes</button>
                              )}
                            </div>
                            <div style={{padding:"0 14px"}}>
                              {openSide==="attack"&&hasSides.attack&&<FlowSection posId={pos.id} side="attack" color={T.orange} d={d.attack} allPositions={allPositions} saveFlowField={saveFlowField}/>}
                              {openSide==="defence"&&hasSides.defence&&<FlowSection posId={pos.id} side="defence" color={T.teal} d={d.defence} allPositions={allPositions} saveFlowField={saveFlowField}/>}
                              {openSide==="mental"&&(
                                <div>
                                  {MENTAL_FIELDS.map(f=>(
                                    <div key={f.key} style={{marginBottom:12}}>
                                      <div style={{fontSize:11,color:"#8b5cf6",fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{f.label}</div>
                                      <textarea value={d.mental?.[f.key]||""} onChange={e=>saveFlowField(pos.id,"mental",f.key,e.target.value)}
                                        rows={2} maxLength={300} placeholder={f.ph}
                                        style={{width:"100%",background:T.surface,border:`1.5px solid ${d.mental?.[f.key]?.trim()?"#8b5cf655":T.border}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",lineHeight:1.5}}/>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add custom position */}
                  {addingCustomPos?(
                    <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight,marginTop:4}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.teal,marginBottom:8}}>New Position Name</div>
                      <input value={customPosName} onChange={e=>setCustomPosName(e.target.value)} placeholder="e.g. 50/50, Rubber Guard, Crucifix..." autoFocus
                        onKeyDown={e=>{if(e.key==="Enter")addCustomPosition();if(e.key==="Escape")setAddingCustomPos(false);}}
                        style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:10}}/>
                      <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Include sections</div>
                      <div style={{display:"flex",gap:8,marginBottom:14}}>
                        {[["attack","⚔️ Attack"],["defence","🛡️ Defence"]].map(([s,l])=>(
                          <button key={s} onClick={()=>setCustomPosSides(p=>({...p,[s]:!p[s]}))}
                            style={{flex:1,padding:"8px",background:customPosSides[s]?T.teal:T.surface,color:customPosSides[s]?"#fff":T.muted,border:`1.5px solid ${customPosSides[s]?T.teal:T.border}`,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <Btn onClick={addCustomPosition} disabled={!customPosName.trim()} style={{flex:1,padding:"10px"}}>Add Position</Btn>
                        <Btn onClick={()=>{setAddingCustomPos(false);setCustomPosName("");}} variant="ghost" style={{flex:1,padding:"10px"}}>Cancel</Btn>
                      </div>
                    </Card>
                  ):(
                    <button onClick={()=>setAddingCustomPos(true)} style={{width:"100%",background:"none",border:`1.5px dashed ${T.border}`,borderRadius:12,padding:"14px",cursor:"pointer",color:T.muted,fontSize:13,fontWeight:700,marginTop:4,transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.color=T.teal;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
                      + Add Custom Position
                    </button>
                  )}
                </>
              )}

              {/* ── FLOW VIEW ── */}
              {flowView==="flow"&&(
                <>
                  {/* Attack / Defence chain toggle */}
                  <div style={{display:"flex",background:T.surface,borderRadius:10,padding:3,marginBottom:14,border:`1px solid ${T.border}`}}>
                    {[["attack","⚔️ Offensive Flow",T.orange],["defence","🛡️ Defensive Flow",T.teal]].map(([v,l,c])=>(
                      <button key={v} onClick={()=>setFlowChainType(v)} style={{flex:1,padding:"8px 0",background:flowChainType===v?c:"none",color:flowChainType===v?"#fff":T.muted,border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
                    ))}
                  </div>
                  {(()=>{
                    const chain=buildChain(flowChainType);
                    const c=flowChainType==="attack"?T.orange:T.teal;
                    if(chain.length===0) return(
                      <div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}>
                        <div style={{fontSize:48,marginBottom:12}}>⚡</div>
                        <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:6}}>No flow yet</div>
                        <div style={{fontSize:13,lineHeight:1.6,padding:"0 20px"}}>Fill in your positions in the Build tab and connect them using the "→ leads to" dropdowns to generate your flow.</div>
                      </div>
                    );
                    return(
                      <>
                        <Card style={{background:"#0d1b2a",border:"none",marginBottom:14,padding:"12px 16px"}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{flowChainType==="attack"?"⚔️ Offensive":"🛡️ Defensive"} A-Game Flow</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{chain.length} positions connected</div>
                        </Card>
                        {chain.map(({pos,d},i)=>(
                          <div key={pos.id}>
                            <div style={{background:T.surface,border:`2px solid ${pos.color}`,borderRadius:14,padding:"14px 16px",boxShadow:`0 2px 12px ${pos.color}22`}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                                <div style={{width:34,height:34,borderRadius:10,background:pos.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{pos.icon}</div>
                                <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text}}>{pos.label}</div>
                              </div>
                              {[
                                {pKey:"p1",lKey:"p1leads",label:"①"},
                                {pKey:"p2",lKey:"p2leads",label:"②"},
                                {pKey:"p3",lKey:"p3leads",label:"③"},
                              ].filter(f=>d[f.pKey]?.trim()).map((f,j,arr)=>{
                                const nextPos=d[f.lKey]?allPositions.find(p=>p.id===d[f.lKey]):null;
                                return(
                                  <div key={f.pKey}>
                                    <div style={{display:"flex",gap:10,alignItems:"flex-start",background:j===0?`${c}15`:T.cardAlt,borderRadius:10,padding:"10px 12px",marginBottom:4}}>
                                      <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,fontSize:13,color:j===0?c:T.muted,flexShrink:0,marginTop:1}}>{f.label}</span>
                                      <div style={{flex:1}}>
                                        <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{d[f.pKey]}</div>
                                        {nextPos&&<div style={{fontSize:11,color:c,fontWeight:700,marginTop:4}}>→ {nextPos.icon} {nextPos.label}</div>}
                                      </div>
                                    </div>
                                    {j<arr.length-1&&<div style={{fontSize:11,color:T.subtle,marginLeft:12,marginBottom:4}}>↓ if blocked</div>}
                                  </div>
                                );
                              })}
                            </div>
                            {i<chain.length-1&&(
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0"}}>
                                <div style={{width:2,height:10,background:`${chain[i+1].pos.color}66`}}/>
                                <div style={{fontSize:16,color:chain[i+1].pos.color,lineHeight:1}}>▼</div>
                                <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginTop:1}}>leads to</div>
                              </div>
                            )}
                          </div>
                        ))}
                        {/* Unconnected positions */}
                        {(()=>{
                          const inChain=new Set(chain.map(c=>c.pos.id));
                          const unconnected=allPositions.filter(p=>!inChain.has(p.id)&&flowData[p.id]?.[flowChainType]?.p1?.trim());
                          if(unconnected.length===0) return null;
                          return(
                            <div style={{marginTop:14}}>
                              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Other Positions (not in main flow)</div>
                              {unconnected.map(pos=>{
                                const d=flowData[pos.id]?.[flowChainType]||{};
                                return(
                                  <div key={pos.id} style={{background:T.surface,border:`1.5px solid ${pos.color}44`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16}}>{pos.icon}</span><div style={{fontWeight:700,fontSize:14,color:T.text}}>{pos.label}</div></div>
                                    {["p1","p2","p3"].filter(k=>d[k]?.trim()).map((k,j)=>(
                                      <div key={k} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}}>
                                        <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,color:pos.color,flexShrink:0}}>{"①②③"[j]}</span>
                                        <span style={{fontSize:12,color:T.text,lineHeight:1.5}}>{d[k]}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </>
              )}
            </>
          )}
        </div>
      )}


      {/* ── EVENTS ── */}
      {tab==="comps"&&(
        <div>
          {/* My Events */}
          <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:10}}>My Events</div>
          <Btn onClick={()=>setAddComp(true)} style={{width:"100%",padding:"12px",fontSize:14,marginBottom:12}}>+ Add Event Manually</Btn>
          {addComp&&(
            <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight,marginBottom:12}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:14}}>New Competition</div>
              {[{l:"Competition Name",k:"name",t:"text"},{l:"Date",k:"date",t:"date"},{l:"Weight Class",k:"weight",t:"text"},{l:"Your Goal",k:"goal",t:"text"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div><input type={f.t} value={compForm[f.k]} onChange={e=>setCompForm({...compForm,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",colorScheme:"light"}}/></div>
              ))}
              <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Division</div><div style={{display:"flex",gap:6}}>{["Gi","No-Gi","Both"].map(g=><button key={g} onClick={()=>setCompForm({...compForm,gi:g})} style={{background:compForm.gi===g?T.teal:T.surface,color:compForm.gi===g?"#fff":T.muted,border:`1.5px solid ${compForm.gi===g?T.teal:T.border}`,borderRadius:8,padding:"7px 18px",fontSize:12,cursor:"pointer",fontWeight:700}}>{g}</button>)}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Prep Notes</div><textarea value={compForm.notes} onChange={e=>setCompForm({...compForm,notes:e.target.value})} rows={2} placeholder="Opponent info, areas to focus on, travel details..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/></div>
              <div style={{display:"flex",gap:8}}><Btn onClick={saveComp} style={{flex:1,padding:"12px"}}>Save</Btn><Btn onClick={()=>setAddComp(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn></div>
            </Card>
          )}
          {compsLoading&&<div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><Spinner size={28}/></div>}
          {!compsLoading&&myComps.length===0&&!addComp&&(
            <div style={{textAlign:"center",color:T.muted,padding:"20px 0",marginBottom:14}}>
              <div style={{fontSize:36,marginBottom:8}}>🏆</div>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:4}}>No events saved yet</div>
              <div style={{fontSize:12}}>Search for events below or add one manually</div>
            </div>
          )}
          {myComps.map(c=>{
            const daysUntil=Math.ceil((new Date(c.date)-new Date())/86400000);
            return(
              <Card key={c.id} style={{borderLeft:`4px solid ${T.teal}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{c.name||"Untitled Competition"}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>{c.date&&<Pill label={c.date}/>}{c.weight&&<Pill label={c.weight} color={T.orange} bg={T.orangeLight}/>}<Pill label={c.gi}/></div>
                    {c.date&&daysUntil>0&&<div style={{fontSize:12,color:T.orange,fontWeight:700}}>📅 {daysUntil} days away</div>}
                    {c.date&&daysUntil===0&&<div style={{fontSize:12,color:T.green,fontWeight:700}}>🥋 Today's the day!</div>}
                    {c.date&&daysUntil<0&&<div style={{fontSize:12,color:T.muted}}>✓ Completed</div>}
                    {c.goal&&<div style={{fontSize:12,color:T.teal,marginTop:4}}>🎯 <strong>Goal:</strong> {c.goal}</div>}
                    {c.notes&&<div style={{fontSize:12,color:T.muted,marginTop:4,fontStyle:"italic"}}>{c.notes}</div>}
                  </div>
                  <button onClick={()=>delComp(c.id)}
                    style={{background:confirmDelComp===c.id?"#fee2e2":"none",border:confirmDelComp===c.id?"1px solid #fca5a5":"none",borderRadius:8,color:confirmDelComp===c.id?"#dc2626":T.subtle,cursor:"pointer",fontSize:confirmDelComp===c.id?10:16,fontWeight:700,padding:confirmDelComp===c.id?"4px 7px":"0",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s"}}>
                    {confirmDelComp===c.id?"Sure?":"✕"}
                  </button>
                </div>
              </Card>
            );
          })}

          {/* AI Event Search */}
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16,marginTop:8}}>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:10}}>Find Upcoming Events</div>
            <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,color:T.teal,marginBottom:4}}>🔍 AI Event Search{userLocation?` — ${userLocation}`:""}</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{userLocation?"Searches for future competitions in your area. Results may vary.":"Set your location in your profile to search for nearby events."}</div>
              <Btn onClick={fetchAiEvents} disabled={eventsLoading||!userLocation.trim()} style={{width:"100%",padding:"11px",fontSize:13}}>
                {eventsLoading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={14} color="#fff"/>Searching...</span>:"Search Upcoming Events"}
              </Btn>
              {eventsError&&<div style={{fontSize:12,color:T.orange,marginTop:8}}>{eventsError}</div>}
              {aiEvents.length>0&&(
                <div style={{marginTop:10}}>
                  {aiEvents.map((ev,i)=>{
                    const alreadySaved=myComps.some(c=>c.name===ev.name);
                    return(
                      <div key={i} style={{background:T.surface,borderRadius:10,padding:"12px",marginBottom:8,border:`1px solid ${T.border}`}}>
                        <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{ev.name}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          {ev.date&&<Pill label={ev.date}/>}
                          {ev.location&&<Pill label={ev.location} color={T.orange} bg={T.orangeLight}/>}
                          {ev.organiser&&<Pill label={ev.organiser} color={T.green} bg={T.greenLight}/>}
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          {ev.url&&<a href={ev.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.teal,fontWeight:700,textDecoration:"underline"}}>More info →</a>}
                          {alreadySaved?(
                            <span style={{fontSize:11,color:T.green,fontWeight:700}}>✓ Saved to My Events</span>
                          ):(
                            <button onClick={()=>addAiEventToMyEvents(ev,i)} disabled={savingEvent===i}
                              style={{fontSize:11,color:T.teal,fontWeight:700,background:T.tealLight,border:`1px solid ${T.teal}44`,borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
                              {savingEvent===i?"Saving...":"+ Add to My Events"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Fallback links */}
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.teal}22`}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>NZ BJJ Resources</div>
                {[{label:"NZ BJJ Federation",url:"https://www.nzbjjf.co.nz/"},{label:"Stealth Grappling — Event Calendar",url:"https://stealthgrappling.com/pages/event-calendar"},{label:"NZ Grappler — Comp Registrations",url:"https://nzgrappler.com/comp-registrations/"}].map(l=>(
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`,textDecoration:"none"}}>
                    <span style={{fontSize:12,color:T.text,fontWeight:600}}>{l.label}</span><span style={{color:T.teal,fontSize:12}}>→</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── IBJJF RULES ── */}
      {tab==="rules"&&(
        <div>
          <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:T.teal,marginBottom:4}}>📋 IBJJF Illegal Moves</div>
            <div style={{fontSize:12,color:T.muted}}>Filter by your division to see which techniques are banned</div>
          </Card>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>My Division</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.keys(BELT_LEVEL_MAP).map(b=><button key={b} onClick={()=>setIbjjfBelt(b)} style={{background:ibjjfBelt===b?T.teal:T.surface,color:ibjjfBelt===b?"#fff":T.muted,border:`1.5px solid ${ibjjfBelt===b?T.teal:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700}}>{b}</button>)}</div></div>
          <div style={{marginBottom:14}}><input value={ibjjfSearch} onChange={e=>setIbjjfSearch(e.target.value)} placeholder="Search moves..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none"}}/></div>
          <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{filteredMoves.length} illegal move{filteredMoves.length!==1?"s":""} for {ibjjfBelt}</div>
          {filteredMoves.map(m=>(
            <Card key={m.id} style={{borderLeft:"4px solid #dc2626",padding:"12px 14px",marginBottom:6}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{background:"#fee2e2",color:"#dc2626",borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono'",flexShrink:0}}>#{m.id}</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{m.move}</div>
              </div>
            </Card>
          ))}
          {filteredMoves.length===0&&<div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:36,marginBottom:8}}>✅</div><div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:4}}>No illegal moves found</div><div style={{fontSize:13}}>All techniques are allowed for this division</div></div>}
          <Card style={{background:"#fff7ed",border:`1.5px solid ${T.orange}44`,marginTop:8}}>
            <div style={{fontWeight:700,fontSize:13,color:T.orange,marginBottom:6}}>⚠️ Knee Reaping Definition</div>
            <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>Knee reaping occurs when an athlete places their thigh behind the opponent's leg, passes their calf over the opponent's body above the knee, places their foot beyond the vertical midline of the opponent's body, and applies pressure on the opponent's knee from outside-in while keeping the foot of the leg at risk trapped between their hip and armpit.</div>
            <div style={{fontSize:11,color:T.muted,marginTop:8,fontStyle:"italic"}}>Note: It is not necessary to hold the opponent's foot — it is considered trapped if the standing athlete bears weight on that foot.</div>
          </Card>
          <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:12,fontStyle:"italic"}}>Based on IBJJF 2021 Rules Update. Always verify with your event organiser.</div>
        </div>
      )}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({user,setTab,onSignOut,onReplayTutorial,darkMode,toggleDarkMode}){
  const [entries,setEntries]=useState([]);
  const [profile,setProfile]=useState({name:null,belt:"White",location:""});
  const [editing,setEditing]=useState(false);
  const [nameInput,setNameInput]=useState("");
  const [beltInput,setBeltInput]=useState("White");
  const [locationInput,setLocationInput]=useState("");
  const [loading,setLoading]=useState(true);
  const [feedback,setFeedback]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [feedbackSaving,setFeedbackSaving]=useState(false);

  useEffect(()=>{
    Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id",user.id).order("date",{ascending:false}),
      supabase.from("profiles").select("*").eq("id",user.id).single(),
    ]).then(([{data:j},{data:p}])=>{
      if(j)setEntries(j);
      if(p){setProfile(p);setNameInput(p.name);setBeltInput(p.belt);setLocationInput(p.location||"");}
      setLoading(false);
    });
  },[user.id]);

  const saveProfile=async()=>{
    const{error}=await supabase.from("profiles").upsert({id:user.id,name:nameInput,belt:beltInput,location:locationInput,updated_at:new Date().toISOString()});
    if(error){console.error("Failed to save profile:",error.message);setNameInput(profile.name);setBeltInput(profile.belt);setLocationInput(profile.location||"");return;}
    setProfile({name:nameInput,belt:beltInput,location:locationInput});setEditing(false);
  };

  const submitFeedback=async()=>{
    if(!feedback.trim()) return;
    setFeedbackSaving(true);
    const{error}=await supabase.from("feedback").insert({user_id:user.id,message:feedback.trim()});
    if(!error){setFeedbackSent(true);setFeedback("");}
    setFeedbackSaving(false);
  };

  const thisWeek=entries.filter(e=>(new Date()-new Date(e.date))<7*86400000).length;
  const totalHours=Math.floor(entries.reduce((a,e)=>a+Number(e.duration||0),0)/60);
  const lastEntry=entries[0];
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const actions=[
    {icon:"⏱",label:"Sparring Timer",sub:"Set up rounds",action:()=>setTab("timer"),color:T.teal,bg:T.tealLight},
    {icon:"📓",label:"Log Session",sub:"Record training",action:()=>setTab("schedule"),color:T.orange,bg:T.orangeLight},
    {icon:"📅",label:"Calendar",sub:"Schedule & track",action:()=>setTab("schedule"),color:T.green,bg:T.greenLight},
    {icon:"🏆",label:"Compete",sub:"Game plan & events",action:()=>setTab("comp"),color:T.teal,bg:T.tealLight},
  ];
  const isNewUser=!loading&&(!profile.name||profile.name==="Fighter")&&entries.length===0;

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      {isNewUser&&(
        <div style={{background:`linear-gradient(135deg,${T.teal},#2a5f78)`,borderRadius:18,padding:"20px",marginBottom:16,boxShadow:`0 4px 20px ${T.teal}44`,animation:"popIn 0.4s ease"}}>
          <div style={{fontSize:32,marginBottom:8}}>👋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:"#fff",marginBottom:6}}>Welcome to Openmat!</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.6,marginBottom:16}}>Your personal jiu-jitsu companion. Start by setting your name and belt rank, then log your first session on the mats.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditing(true)} style={{flex:1,background:"#fff",border:"none",borderRadius:12,padding:"11px",fontWeight:700,fontSize:13,color:T.teal,cursor:"pointer"}}>Set Up Profile</button>
            <button onClick={()=>setTab("schedule")} style={{flex:1,background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"11px",fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer"}}>Log First Session</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,padding:"16px",background:T.teal,borderRadius:18,boxShadow:`0 4px 20px ${T.teal}44`}}>
        <div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600,marginBottom:2}}>{greeting} 👋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:"#fff",lineHeight:1}}>{profile.name||user.email?.split("@")[0]||"Fighter"}</div>
          <div style={{marginTop:6}}><span style={{background:BELT_COLORS[profile.belt],color:BELT_TEXT[profile.belt],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{profile.belt} Belt</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"2px solid rgba(255,255,255,0.3)"}}>🥋</div>
          <button onClick={()=>setEditing(e=>!e)} style={{fontSize:11,color:"rgba(255,255,255,0.7)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Edit profile</button>
        </div>
      </div>
      {editing&&(
        <Card style={{border:`1.5px solid ${T.teal}`,marginBottom:12}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:12}}>Edit Profile</div>
          <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Your Name</div>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)} style={{width:"100%",background:T.cardAlt,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:12}}/>
          <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Belt Rank</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{Object.keys(BELT_COLORS).map(b=><button key={b} onClick={()=>setBeltInput(b)} style={{background:beltInput===b?BELT_COLORS[b]:"none",color:beltInput===b?BELT_TEXT[b]:T.muted,border:`2px solid ${BELT_COLORS[b]}`,borderRadius:8,padding:"5px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{b}</button>)}</div>
          <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Location</div>
          <input value={locationInput} onChange={e=>setLocationInput(e.target.value)} placeholder="e.g. Auckland, New Zealand" style={{width:"100%",background:T.cardAlt,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:12}}/>
          <div style={{fontSize:11,color:T.muted,marginBottom:14,fontStyle:"italic"}}>Used for finding nearby BJJ events</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"12px 14px",background:T.cardAlt,borderRadius:12,border:`1px solid ${T.border}`}}>
            <div>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Dark Mode</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{darkMode?"On":"Off"}</div>
            </div>
            <button onClick={toggleDarkMode} style={{width:48,height:28,borderRadius:14,border:"none",cursor:"pointer",background:darkMode?T.teal:T.border,position:"relative",transition:"background 0.2s"}}>
              <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:3,left:darkMode?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}><Btn onClick={saveProfile} style={{flex:1,padding:"11px"}}>Save</Btn><Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"11px"}}>Cancel</Btn></div>
          <button onClick={onSignOut} style={{width:"100%",background:"none",border:`1px solid #fca5a5`,borderRadius:10,padding:"10px",color:"#dc2626",fontSize:13,fontWeight:600,cursor:"pointer"}}>Sign Out</button>
        </Card>
      )}
      {loading?<div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><Spinner size={28}/></div>:(
        <>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <StatBox label="This Week" value={thisWeek} icon="📅" color={T.teal} bg={T.tealLight}/>
            <StatBox label="Total Hours" value={totalHours} icon="⏱" color={T.orange} bg={T.orangeLight}/>
            <StatBox label="Sessions" value={entries.length} icon="🥋" color={T.green} bg={T.greenLight}/>
          </div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:10}}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {actions.map(a=>(
              <button key={a.label} onClick={a.action} style={{background:a.bg,border:`1.5px solid ${a.color}22`,borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"left",transition:"transform 0.15s,box-shadow 0.15s",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 4px 16px ${a.color}33`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)";}}>
                <div style={{fontSize:26,marginBottom:6}}>{a.icon}</div>
                <div style={{fontWeight:700,fontSize:13,color:T.text}}>{a.label}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{a.sub}</div>
              </button>
            ))}
          </div>
          {lastEntry&&(
            <>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:10}}>Last Session</div>
              <Card style={{borderLeft:`4px solid ${T.teal}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Pill label={lastEntry.type}/><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{lastEntry.date} · {lastEntry.duration}min</span></div>
                {lastEntry.learnings&&<div style={{background:T.tealLight,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:1}}>💡 Key Learnings</div><div style={{fontSize:12,color:T.text}}>{lastEntry.learnings.slice(0,100)}{lastEntry.learnings.length>100?"...":""}</div></div>}
                {lastEntry.notes&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{lastEntry.notes.slice(0,80)}{lastEntry.notes.length>80?"...":""}</div>}
              </Card>
            </>
          )}
          {/* Beta feedback */}
          <Card style={{border:`1.5px solid ${T.orange}33`,background:T.orangeLight,marginTop:4,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{background:T.orange,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:1}}>BETA</span>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>Help us improve Openmat</div>
            </div>
            <div style={{fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:10}}>The Openmat App is still in Beta. Please leave your feedback below so we can improve the App over the next few months.</div>
            {feedbackSent?(
              <div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>🙏</div>
                <div style={{fontSize:13,fontWeight:700,color:T.green}}>Thanks for the feedback!</div>
              </div>
            ):(
              <>
                <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} maxLength={500} rows={3}
                  placeholder="What's working? What could be better? Any features you'd love to see?"
                  style={{width:"100%",background:T.surface,border:`1.5px solid ${T.orange}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",marginBottom:8}}/>
                <Btn onClick={submitFeedback} disabled={feedbackSaving||!feedback.trim()} style={{width:"100%",padding:"11px",background:T.orange,boxShadow:`0 2px 8px ${T.orange}44`}}>
                  {feedbackSaving?<Spinner size={16} color="#fff"/>:"Send Feedback →"}
                </Btn>
              </>
            )}
          </Card>

          {/* How to Use */}
          <button onClick={onReplayTutorial} style={{width:"100%",background:T.tealLight,border:`1.5px solid ${T.teal}33`,borderRadius:14,padding:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:14,transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${T.teal}33`;}}>
            <span style={{fontSize:22}}>❓</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text}}>How to Use Openmat</div>
              <div style={{fontSize:11,color:T.muted,marginTop:1}}>Replay the app walkthrough</div>
            </div>
            <span style={{marginLeft:"auto",color:T.teal,fontSize:13}}>→</span>
          </button>

          {/* Changelog */}
          <div style={{marginTop:4,marginBottom:8}}>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:10}}>What's New</div>
            {[
              {
                version:"v0.7",date:"Mar 2025",
                items:["Dark mode with toggle in Edit Profile","Journal search & filter by session type","Screen stays awake during timer sessions (Wake Lock)","Technique autocomplete from your library when logging sessions"],
              },
              {
                version:"v0.6",date:"Mar 2025",
                items:["Journal & Calendar merged into one Schedule tab with sub-tabs","App tutorial walkthrough on first launch with replay from Home screen","Bottom nav streamlined from 6 tabs to 5"],
              },
              {
                version:"v0.5",date:"Mar 2025",
                items:["AI event search now uses your profile location — no more hardcoded region","Location field added to profile — set your city to find nearby events","Calendar log session modal now matches full journal form (Workout type, techniques, notes)","Vercel serverless API proxy for reliable Anthropic API calls"],
              },
              {
                version:"v0.4",date:"Mar 2025",
                items:["Workout session type added to journal — log gym sessions alongside BJJ","Music app shortcuts on timer screen (Spotify, YouTube Music, Apple Music)"],
              },
              {
                version:"v0.3",date:"Feb 2025",
                items:["My Library redesigned — category tiles with drill-in view","Recently Added strip shows your last 3 saved techniques","Save any standard library technique silently with one tap","AI event search now filters out past events automatically","Add AI-found events directly to My Events & Calendar"],
              },
              {
                version:"v0.2",date:"Jan 2025",
                items:["Comprehensive technique library — 12 categories, 10–15 techniques per level","Sparring timer fullscreen mode with landscape support","Training calendar with session & competition dots","IBJJF illegal moves reference with division filter","Competition game plan builder with auto-save"],
              },
              {
                version:"v0.1",date:"Dec 2024",
                items:["Initial Beta launch","Training journal with streak tracking","Technique library with favourites","User profiles & belt rank"],
              },
            ].slice(0,5).map((rel,i)=>(
              <div key={rel.version} style={{marginBottom:10,opacity:i===0?1:0.85}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{background:i===0?T.teal:T.cardAlt,color:i===0?"#fff":T.muted,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{rel.version}</span>
                  <span style={{fontSize:11,color:T.muted}}>{rel.date}</span>
                  {i===0&&<span style={{background:T.greenLight,color:T.green,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>Latest</span>}
                </div>
                <div style={{borderLeft:`2px solid ${i===0?T.teal:T.border}`,paddingLeft:12}}>
                  {rel.items.map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}>
                      <span style={{color:i===0?T.teal:T.subtle,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                      <span style={{fontSize:12,color:i===0?T.text:T.muted,lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TUTORIAL WALKTHROUGH ──────────────────────────────────────────────────────
const TUTORIAL_STEPS=[
  {icon:"👋",title:"Welcome to Openmat!",desc:"Your personal jiu-jitsu companion. Let's take a quick tour of the app so you can get the most out of it."},
  {icon:"📅",title:"Schedule",desc:"Log every training session, track your weekly streak, and view your training history on the calendar. All in one place."},
  {icon:"📚",title:"Technique Library",desc:"Browse 12 categories of BJJ techniques across all skill levels. Save your favourites to your personal library with video links and notes."},
  {icon:"🏆",title:"Competition Prep",desc:"Build a position-by-position game plan, find upcoming events near you with AI search, and review IBJJF rules for your division."},
  {icon:"⏱",title:"Sparring Timer",desc:"Set up rounds with custom lengths, rest periods, and bell sounds. Go fullscreen and screen mirror to a TV for the whole gym to see."},
  {icon:"🥋",title:"Set Up Your Profile",desc:"Head to the Home screen and tap 'Edit Profile' to set your name, belt rank, and location. Your location is used to find nearby events."},
];

function TutorialOverlay({onComplete}){
  const [step,setStep]=useState(0);
  const s=TUTORIAL_STEPS[step];
  const isLast=step===TUTORIAL_STEPS.length-1;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.92)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeUp 0.3s ease"}}>
      <div style={{background:T.surface,borderRadius:24,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.3)",animation:"popIn 0.3s ease"}}>
        <div style={{fontSize:52,marginBottom:16}}>{s.icon}</div>
        <div style={{fontFamily:"'DM Serif Display'",fontSize:24,color:T.text,marginBottom:8,lineHeight:1.2}}>{s.title}</div>
        <div style={{fontSize:14,color:T.muted,lineHeight:1.7,marginBottom:24,padding:"0 8px"}}>{s.desc}</div>
        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
          {TUTORIAL_STEPS.map((_,i)=>(
            <div key={i} style={{width:i===step?20:8,height:8,borderRadius:4,background:i===step?T.teal:T.border,transition:"all 0.3s"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",background:"none",border:`1.5px solid ${T.border}`,borderRadius:12,color:T.muted,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back</button>
          )}
          {!isLast?(
            <button onClick={()=>setStep(s=>s+1)} style={{flex:1,padding:"13px",background:T.teal,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${T.teal}44`}}>Next →</button>
          ):(
            <button onClick={onComplete} style={{flex:1,padding:"13px",background:T.teal,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${T.teal}44`}}>Get Started 🥋</button>
          )}
        </div>
        {!isLast&&(
          <button onClick={onComplete} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",marginTop:14,padding:0}}>Skip tutorial</button>
        )}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function OpenmatApp(){
  const [session,setSession]=useState(undefined);
  const [tab,setTab]=useState("home");
  const [showTutorial,setShowTutorial]=useState(false);
  const [darkMode,setDarkMode]=useState(()=>{
    const saved=localStorage.getItem("openmat_dark_mode");
    const isDark=saved==="1";
    setTheme(isDark);
    if(typeof document!=="undefined") document.body.style.background=isDark?DARK.bg:LIGHT.bg;
    return isDark;
  });
  const toggleDarkMode=()=>{
    setDarkMode(prev=>{
      const next=!prev;
      setTheme(next);
      localStorage.setItem("openmat_dark_mode",next?"1":"0");
      document.body.style.background=next?DARK.bg:LIGHT.bg;
      return next;
    });
  };

  useEffect(()=>{
    const s=document.createElement("style");s.textContent=GLOBAL_CSS;document.head.appendChild(s);return()=>document.head.removeChild(s);
  },[]);
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session&&!localStorage.getItem("openmat_tutorial_done")){
        setShowTutorial(true);
      }
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return()=>subscription.unsubscribe();
  },[]);

  const completeTutorial=()=>{
    localStorage.setItem("openmat_tutorial_done","1");
    setShowTutorial(false);
  };
  const replayTutorial=()=>setShowTutorial(true);

  const signOut=async()=>{await supabase.auth.signOut();setTab("home");};

  if(session===undefined) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <Spinner size={40}/><div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.muted}}>Loading Openmat...</div>
    </div>
  );
  if(!session) return <AuthScreen/>;

  const tabs=[
    {id:"home",icon:"⊞",label:"Home"},
    {id:"timer",icon:"⏱",label:"Timer"},
    {id:"techniques",icon:"📚",label:"Techniques"},
    {id:"schedule",icon:"📅",label:"Schedule"},
    {id:"comp",icon:"🏆",label:"Compete"},
  ];

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(30,45,64,0.07)"}}>
        <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text}}>Open<span style={{color:T.teal}}>mat</span></div>
        <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'",fontWeight:600}}>{new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"})}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingTop:16,paddingBottom:80}}>
        {tab==="home"       &&<HomeScreen user={session.user} setTab={setTab} onSignOut={signOut} onReplayTutorial={replayTutorial} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>}
        {tab==="timer"      &&<TimerScreen/>}
        {tab==="techniques" &&<TechniqueScreen user={session.user}/>}
        {tab==="schedule"   &&<ScheduleScreen user={session.user}/>}
        {tab==="comp"       &&<CompScreen user={session.user}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:50,boxShadow:"0 -2px 12px rgba(30,45,64,0.08)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0 10px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,borderTop:tab===t.id?`2.5px solid ${T.teal}`:"2.5px solid transparent"}}>
            <span style={{fontSize:16}}>{t.icon}</span>
            <span style={{fontSize:8,color:tab===t.id?T.teal:T.muted,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{t.label}</span>
          </button>
        ))}
      </div>
      {showTutorial&&<TutorialOverlay onComplete={completeTutorial}/>}
    </div>
  );
}