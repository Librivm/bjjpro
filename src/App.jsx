import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── 🔑 REPLACE THESE WITH YOUR SUPABASE CREDENTIALS ─────────────────────────
const SUPABASE_URL = "https://vwfeouwokrvtcmoyrjxo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZmVvdXdva3J2dGNtb3lyanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDc4MDksImV4cCI6MjA4ODIyMzgwOX0.ZN3I_cqwG1UKV8_crqGRZJcHc9SicthD-yo0UBkwZ9k";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#f5f0eb;color:#1e2d40;font-family:'Plus Jakarta Sans',sans-serif;overscroll-behavior:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#ede8e3;}
::-webkit-scrollbar-thumb{background:#3d7a96;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes popIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;}
`;

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg:"#f5f0eb", surface:"#ffffff", card:"#ffffff", cardAlt:"#faf7f4",
  border:"#e4ddd6", teal:"#3d7a96", tealLight:"#eaf3f7",
  orange:"#e07b39", orangeLight:"#fdf1e8", green:"#3a7d5e", greenLight:"#eaf5ef",
  text:"#1e2d40", muted:"#7a8a96", subtle:"#d4cdc6",
  shadow:"0 2px 12px rgba(30,45,64,0.08)",
};

// ── Static data ───────────────────────────────────────────────────────────────
const TECHNIQUES = {
  "Guard":["Triangle Choke","Armbar from Guard","Scissor Sweep","Hip Bump Sweep","Kimura from Guard","Omoplata","Flower Sweep","Guillotine Choke","Loop Choke","Lasso Guard","Spider Guard","X-Guard Entry"],
  "Half Guard":["Kimura Trap","Lockdown","Old School Sweep","Electric Chair","Half Guard Pass","Knee Shield","Dog Fight Position","Single Leg from Half"],
  "Mount":["Armbar from Mount","Americana","Cross Collar Choke","S-Mount Transition","Trap & Roll Escape","Elbow-Knee Escape","High Mount","Ezekiel Choke"],
  "Side Control":["Americana","Kimura","Katagatame","Knee on Belly","North-South Choke","D'Arce Choke","Side Control Escape","Twister Side Control"],
  "Back Control":["Rear Naked Choke","Bow & Arrow Choke","Collar Choke","Back Escape","Harness Grip","Body Triangle","Seatbelt Control"],
  "Takedowns":["Double Leg","Single Leg","Osoto Gari","Seoi Nage","Ankle Pick","Guard Pull","Foot Sweep","Uchi Mata","Blast Double"],
  "Leg Locks":["Heel Hook","Kneebar","Ankle Lock","Toe Hold","Calf Slicer","Saddle Position","Outside Heel Hook"],
  "Passing":["Torreando Pass","Knee Slice","X-Pass","Stack Pass","Leg Drag","Over-Under Pass","Smash Pass"],
};

const GAMEPLAN_SECTIONS = [
  {category:"🥋 Guard Game",positions:[
    {pos:"Preferred Guard Style",ph:"e.g. Closed guard, De La Riva, Lasso, Spider, X-Guard..."},
    {pos:"Primary Sweep",ph:"e.g. Hip bump → kimura, Scissor sweep, X-guard to single leg..."},
    {pos:"Secondary Sweep",ph:"e.g. Flower sweep if they posture, Sickle sweep from DLR..."},
    {pos:"Main Submission from Guard",ph:"e.g. Triangle choke → armbar, Kimura trap system..."},
    {pos:"Backup Submission from Guard",ph:"e.g. Omoplata if they roll out of triangle..."},
    {pos:"Guard Recovery Plan",ph:"e.g. Frame and shrimp to re-guard, Knee shield, Turtle..."},
  ]},
  {category:"⚔️ Top Game & Passing",positions:[
    {pos:"Primary Guard Pass",ph:"e.g. Torreando to knee slice combination..."},
    {pos:"Secondary Guard Pass",ph:"e.g. Over-under pass if they block knee slice..."},
    {pos:"Preferred Passing Side",ph:"e.g. Pass to left (their right) — my stronger side..."},
    {pos:"Preferred Top Position",ph:"e.g. Side control → mount via knee-on-belly transition..."},
    {pos:"Submission from Mount",ph:"e.g. Armbar to americana, Ezekiel, Cross collar choke..."},
    {pos:"Submission from Side Control",ph:"e.g. Kimura, North-south choke, Katagatame..."},
    {pos:"Knee on Belly Game",ph:"e.g. Use to force reaction → mount or take back..."},
  ]},
  {category:"🔒 Back Control & Finishing",positions:[
    {pos:"Back Take Preference",ph:"e.g. From turtle, Arm drag from guard, Clock choke attempt..."},
    {pos:"Primary Finish from Back",ph:"e.g. Rear naked choke, Bow & arrow..."},
    {pos:"Body Position Preference",ph:"e.g. Body triangle preferred, Standard hooks if limited..."},
    {pos:"If Opponent Takes My Back",ph:"e.g. Seat belt break, Roll to guard, Hip escape to half..."},
  ]},
  {category:"🤸 Standing & Takedowns",positions:[
    {pos:"Opening Strategy",ph:"e.g. Pull guard at 3 seconds, Snap down to single leg..."},
    {pos:"Primary Takedown",ph:"e.g. Double leg, Osoto gari, Ankle pick..."},
    {pos:"Takedown Defence",ph:"e.g. Sprawl to front headlock, Whizzer to trip..."},
    {pos:"Clinch Game",ph:"e.g. Underhooks → body lock, Collar tie → foot sweep..."},
    {pos:"If Opponent Shoots First",ph:"e.g. Sprawl hard, go to guillotine or front headlock..."},
  ]},
  {category:"🦵 Leg Lock Game",positions:[
    {pos:"Leg Lock Entry",ph:"e.g. Outside heel hook from Ashi Garami, Reap to 50/50..."},
    {pos:"Primary Leg Attack",ph:"e.g. Heel hook, Ankle lock, Knee bar..."},
    {pos:"Leg Lock Transitions",ph:"e.g. Outside to inside heel hook, Ankle lock to knee bar..."},
    {pos:"Defending Opponent's Leg Locks",ph:"e.g. Toes up, Never cross feet, Hip escape direction..."},
    {pos:"Ruleset Notes",ph:"e.g. Heel hooks legal? IBJJF vs submission-only rules..."},
  ]},
  {category:"🛡️ Escapes & Survival",positions:[
    {pos:"Escape from Mount",ph:"e.g. Elbow-knee escape is primary, Trap & roll as backup..."},
    {pos:"Escape from Side Control",ph:"e.g. Frame & shrimp to guard, Underhook & run the pipe..."},
    {pos:"Escape from Turtle",ph:"e.g. Granby roll, Stand up, Roll to guard..."},
    {pos:"Escape from Back",ph:"e.g. Chin tuck, hand fight, escape hips toward hook side..."},
    {pos:"Submission Escape Priorities",ph:"e.g. Armbar — stack and pull; Triangle — posture + stack..."},
  ]},
  {category:"🧠 Mental & Tactical",positions:[
    {pos:"Points Strategy",ph:"e.g. Pull guard, hunt sweeps, avoid giving guard pass points..."},
    {pos:"If Winning on Points",ph:"e.g. Maintain top pressure, avoid risky submission attempts..."},
    {pos:"If Losing on Points",ph:"e.g. Go for the submission, pull guard for attacks..."},
    {pos:"Opponent Strength to Neutralise",ph:"e.g. If they're a wrestler — pull guard early..."},
    {pos:"My Biggest Strength to Exploit",ph:"e.g. My guard is strong — get to the floor ASAP..."},
    {pos:"Pre-Match Mental Routine",ph:"e.g. Deep breathing, visualise first move, stay loose..."},
  ]},
];

const BELT_COLORS = {"White":"#e8e3dc","Blue":"#2563eb","Purple":"#7c3aed","Brown":"#92400e","Black":"#1e2d40"};
const BELT_TEXT = {"White":"#1e2d40","Blue":"#ffffff","Purple":"#ffffff","Brown":"#ffffff","Black":"#ffffff"};
const fmtTime = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const todayStr = ()=>new Date().toISOString().split("T")[0];
const dayName = d=>new Date(d).toLocaleDateString("en",{weekday:"short"});

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card = ({children,style={},onClick})=>(
  <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px",marginBottom:10,boxShadow:T.shadow,cursor:onClick?"pointer":"default",...style}}>{children}</div>
);
const SectionTitle = ({children,sub})=>(
  <div style={{marginBottom:18,marginTop:4}}>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:28,color:T.text,lineHeight:1.1}}>{children}</div>
    {sub&&<div style={{fontSize:13,color:T.muted,marginTop:4}}>{sub}</div>}
  </div>
);
const Pill = ({label,color=T.teal,bg=T.tealLight})=>(
  <span style={{background:bg,color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{label}</span>
);
const StatBox = ({label,value,icon,color=T.teal,bg=T.tealLight})=>(
  <div style={{background:bg,borderRadius:14,padding:"14px 10px",flex:1,textAlign:"center",border:`1px solid ${color}22`}}>
    <div style={{fontSize:20}}>{icon}</div>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:30,color,lineHeight:1,marginTop:2}}>{value}</div>
    <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginTop:3,fontWeight:600}}>{label}</div>
  </div>
);
const Btn = ({children,onClick,variant="primary",style={},disabled=false})=>{
  const base={borderRadius:12,padding:"12px 20px",fontFamily:"'Plus Jakarta Sans'",fontWeight:700,fontSize:14,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.15s",opacity:disabled?0.6:1,...style};
  const v={primary:{background:T.teal,color:"#fff",boxShadow:`0 2px 8px ${T.teal}44`},secondary:{background:T.surface,color:T.teal,border:`1.5px solid ${T.teal}`},ghost:{background:"none",color:T.muted,border:`1px solid ${T.border}`}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...v[variant]}}>{children}</button>;
};
const Spinner = ({size=20,color=T.teal})=>(
  <div style={{width:size,height:size,border:`2.5px solid ${color}33`,borderTop:`2.5px solid ${color}`,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
);
const Input = ({label,type="text",value,onChange,placeholder,required})=>(
  <div style={{marginBottom:14}}>
    <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{label}{required&&<span style={{color:T.orange}}> *</span>}</div>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"11px 14px",color:T.text,fontSize:14,outline:"none",colorScheme:"light"}}/>
  </div>
);

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen(){
  const [mode,setMode]=useState("signin"); // signin | signup
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  const handle=async()=>{
    setError(""); setMessage(""); setLoading(true);
    if(mode==="signup"){
      const{error:e}=await supabase.auth.signUp({email,password});
      if(e)setError(e.message);
      else setMessage("Check your email to confirm your account, then sign in!");
    } else {
      const{error:e}=await supabase.auth.signInWithPassword({email,password});
      if(e)setError(e.message);
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,background:T.teal,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px",boxShadow:`0 6px 24px ${T.teal}44`}}>🥋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,color:T.text}}>BJJ<span style={{color:T.teal}}>Pro</span></div>
          <div style={{fontSize:13,color:T.muted,marginTop:4}}>Your personal jiu-jitsu companion</div>
        </div>

        <Card style={{padding:"24px 20px"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:22,marginBottom:20}}>{mode==="signin"?"Welcome back":"Create account"}</div>

          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required/>
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup"?"At least 6 characters":""} required/>

          {error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:14}}>{error}</div>}
          {message&&<div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.green,marginBottom:14}}>{message}</div>}

          <Btn onClick={handle} disabled={loading||!email||!password} style={{width:"100%",padding:"14px",fontSize:15}}>
            {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/> {mode==="signin"?"Signing in...":"Creating account..."}</span>
              :mode==="signin"?"Sign In →":"Create Account →"}
          </Btn>

          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>
            {mode==="signin"?"Don't have an account?":"Already have an account?"}{" "}
            <button onClick={()=>{setMode(mode==="signin"?"signup":"signin");setError("");setMessage("");}}
              style={{background:"none",border:"none",color:T.teal,fontWeight:700,cursor:"pointer",fontSize:13}}>
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
  const interval=useRef(null);

  const reset=()=>{clearInterval(interval.current);setRunning(false);setCurrentRound(1);setIsRest(false);setTimeLeft(roundLen);setDone(false);setShowSetup(true);};
  const start=()=>{setShowSetup(false);setTimeLeft(roundLen);setRunning(true);};

  useEffect(()=>{
    if(!running){clearInterval(interval.current);return;}
    interval.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          setIsRest(r=>{
            if(!r){
              setCurrentRound(cr=>{
                if(cr>=rounds){setRunning(false);setDone(true);clearInterval(interval.current);return cr;}
                return cr+1;
              });
              setTimeout(()=>setTimeLeft(restLen),0);return true;
            }else{setTimeout(()=>setTimeLeft(roundLen),0);return false;}
          });
          return 0;
        }
        return t-1;
      });
    },1000);
    return()=>clearInterval(interval.current);
  },[running,rounds,roundLen,restLen]);

  const pct=isRest?(timeLeft/restLen)*100:(timeLeft/roundLen)*100;
  const r=80,circ=2*Math.PI*r;

  if(showSetup) return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Configure your sparring session">Sparring Timer</SectionTitle>
      {[
        {label:"Round Length",val:roundLen,set:setRoundLen,opts:[60,120,180,240,300,360,420,480,600]},
        {label:"Rest Period",val:restLen,set:setRestLen,opts:[15,30,45,60,90,120]},
        {label:"Number of Rounds",val:rounds,set:setRounds,opts:[1,2,3,4,5,6,8,10]},
      ].map(({label,val,set,opts})=>(
        <Card key={label}>
          <div style={{fontSize:12,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>{label}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {opts.map(o=>(
              <button key={o} onClick={()=>set(o)} style={{background:val===o?T.teal:T.cardAlt,color:val===o?"#fff":T.muted,border:`1.5px solid ${val===o?T.teal:T.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontFamily:"'JetBrains Mono'",cursor:"pointer",fontWeight:600}}>
                {label==="Number of Rounds"?o:fmtTime(o)}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:13,color:T.muted}}>Total session time</span>
          <span style={{fontFamily:"'JetBrains Mono'",fontWeight:600,color:T.teal}}>{fmtTime(rounds*roundLen+(rounds-1)*restLen)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:T.muted}}>Active rolling time</span>
          <span style={{fontFamily:"'JetBrains Mono'",fontWeight:600,color:T.orange}}>{fmtTime(rounds*roundLen)}</span>
        </div>
      </Card>
      <Btn onClick={start} style={{width:"100%",padding:"16px",fontSize:16,marginTop:4}}>Start Session →</Btn>
    </div>
  );

  return(
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",animation:"fadeUp 0.3s ease"}}>
      <div style={{marginBottom:18,marginTop:4,textAlign:"center"}}>
        <div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:T.text}}>{isRest?"Rest Time 😮‍💨":`Round ${currentRound} of ${rounds} 🥋`}</div>
      </div>
      <div style={{position:"relative",width:200,height:200,marginBottom:24}}>
        <svg width={200} height={200} style={{transform:"rotate(-90deg)"}}>
          <circle cx={100} cy={100} r={r} fill="none" stroke={T.border} strokeWidth={10}/>
          <circle cx={100} cy={100} r={r} fill="none" stroke={isRest?T.orange:T.teal} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:50,color:T.text,lineHeight:1,animation:timeLeft<=5&&running?"blink 0.5s infinite":"none"}}>{fmtTime(timeLeft)}</div>
          <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginTop:2}}>{isRest?"Rest":"Roll"}</div>
        </div>
      </div>
      {done?(
        <div style={{textAlign:"center",animation:"popIn 0.4s ease"}}>
          <div style={{fontSize:48,marginBottom:8}}>🏅</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,color:T.teal,marginBottom:4}}>Session Complete!</div>
          <div style={{color:T.muted,marginBottom:20,fontSize:14}}>{rounds} rounds · {fmtTime(rounds*roundLen)} rolling</div>
          <Btn onClick={reset}>Start New Session</Btn>
        </div>
      ):(
        <>
          <div style={{display:"flex",gap:10,marginBottom:18}}>
            <Btn onClick={()=>setRunning(r=>!r)} variant={running?"secondary":"primary"} style={{minWidth:130}}>{running?"⏸  Pause":"▶  Resume"}</Btn>
            <Btn onClick={reset} variant="ghost">Reset</Btn>
          </div>
          <div style={{display:"flex",gap:6}}>
            {Array.from({length:rounds}).map((_,i)=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<currentRound-1?T.teal:i===currentRound-1?(isRest?T.orange:T.teal):T.border,opacity:i<currentRound-1?0.4:1}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TECHNIQUES ────────────────────────────────────────────────────────────────
function TechniqueScreen({user}){
  const [activePos,setActivePos]=useState("Guard");
  const [favs,setFavs]=useState({});
  const [expanded,setExpanded]=useState(null);

  useEffect(()=>{
    supabase.from("favourites").select("technique").eq("user_id",user.id)
      .then(({data})=>{
        if(data){const f={};data.forEach(r=>f[r.technique]=true);setFavs(f);}
      });
  },[user.id]);

  const toggleFav=async(tech)=>{
    const isOn=!!favs[tech];
    setFavs(f=>({...f,[tech]:!isOn}));
    if(isOn){
      await supabase.from("favourites").delete().eq("user_id",user.id).eq("technique",tech);
    } else {
      await supabase.from("favourites").insert({user_id:user.id,technique:tech});
    }
  };

  const ytUrl=tech=>`https://www.youtube.com/results?search_query=${encodeURIComponent("BJJ "+tech+" tutorial")}`;
  const channels=[
    {name:"Chewjitsu",url:"https://www.youtube.com/@Chewjitsu",tag:"All levels"},
    {name:"Bernardo Faria BJJ",url:"https://www.youtube.com/@BernardoFariaBJJ",tag:"Competition"},
    {name:"Knight Jiu-Jitsu",url:"https://www.youtube.com/@KnightJiuJitsu",tag:"Beginner friendly"},
    {name:"Danaher Instructionals",url:"https://www.youtube.com/results?search_query=John+Danaher+BJJ+tutorial",tag:"Systems & Leg Locks"},
    {name:"Gordon Ryan Technique",url:"https://www.youtube.com/results?search_query=Gordon+Ryan+BJJ+technique",tag:"Advanced"},
  ];

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Browse techniques & watch tutorials">Technique Library</SectionTitle>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14,scrollbarWidth:"none"}}>
        {Object.keys(TECHNIQUES).map(p=>(
          <button key={p} onClick={()=>{setActivePos(p);setExpanded(null);}} style={{background:activePos===p?T.teal:T.surface,color:activePos===p?"#fff":T.muted,border:`1.5px solid ${activePos===p?T.teal:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontWeight:700}}>{p}</button>
        ))}
      </div>

      {TECHNIQUES[activePos].map(tech=>(
        <Card key={tech} onClick={()=>setExpanded(expanded===tech?null:tech)} style={{borderColor:expanded===tech?T.teal:T.border,background:expanded===tech?T.tealLight:T.card,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:T.text}}>{tech}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{activePos}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={e=>{e.stopPropagation();toggleFav(tech);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:favs[tech]?T.orange:T.subtle}}>★</button>
              <span style={{color:T.muted,fontSize:13}}>{expanded===tech?"▲":"▼"}</span>
            </div>
          </div>
          {expanded===tech&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.teal}33`,animation:"fadeUp 0.2s ease"}}>
              <a href={ytUrl(tech)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:10,background:"#fee2e244",border:"1.5px solid #fca5a544",borderRadius:12,padding:"12px 14px",textDecoration:"none",marginBottom:12}}>
                <span style={{fontSize:26}}>▶️</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:T.text}}>Search "{tech}" on YouTube</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:1}}>Opens YouTube · BJJ tutorials</div>
                </div>
                <span style={{marginLeft:"auto",color:T.muted,fontSize:14}}>→</span>
              </a>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>🎓 Recommended Channels</div>
              {channels.map(ch=>(
                <a key={ch.name} href={ch.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,textDecoration:"none",background:T.surface,border:`1px solid ${T.border}`,marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>{ch.name}</span>
                  <Pill label={ch.tag}/>
                </a>
              ))}
            </div>
          )}
        </Card>
      ))}

      {Object.keys(favs).some(k=>favs[k])&&(
        <Card style={{background:T.orangeLight,border:`1.5px solid ${T.orange}33`,marginTop:4}}>
          <div style={{fontSize:12,color:T.orange,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>⭐ Your Favourites</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {Object.entries(favs).filter(([,v])=>v).map(([t])=>(
              <Pill key={t} label={t} color={T.orange} bg={T.orangeLight}/>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
function JournalScreen({user}){
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [adding,setAdding]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  const [streak,setStreak]=useState(0);

  const fetchEntries=async()=>{
    const{data}=await supabase.from("journal_entries").select("*").eq("user_id",user.id).order("date",{ascending:false}).order("created_at",{ascending:false});
    if(data){
      setEntries(data);
      const days=[...new Set(data.map(x=>x.date))].sort().reverse();
      let s=0;let d=new Date();d.setHours(0,0,0,0);
      for(const day of days){const dd=new Date(day);dd.setHours(0,0,0,0);if((d-dd)/86400000>1)break;s++;d=dd;}
      setStreak(s);
    }
    setLoading(false);
  };

  useEffect(()=>{fetchEntries();},[user.id]);

  const saveEntry=async()=>{
    setSaving(true);
    const{data,error}=await supabase.from("journal_entries").insert({user_id:user.id,...form,duration:Number(form.duration)}).select().single();
    if(data){setEntries(e=>[data,...e]);}
    setSaving(false);setAdding(false);
    setForm({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  };

  const delEntry=async(id)=>{
    await supabase.from("journal_entries").delete().eq("id",id);
    setEntries(e=>e.filter(x=>x.id!==id));
  };

  const last7=Array.from({length:7}).map((_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const key=d.toISOString().split("T")[0];
    return{key,label:dayName(key),trained:entries.some(e=>e.date===key)};
  });
  const totalMins=entries.reduce((a,e)=>a+Number(e.duration||0),0);

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Track every session on the mats">Training Journal</SectionTitle>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <StatBox label="Streak" value={streak} icon="🔥" color={T.orange} bg={T.orangeLight}/>
        <StatBox label="Sessions" value={entries.length} icon="🥋" color={T.teal} bg={T.tealLight}/>
        <StatBox label="Hours" value={Math.floor(totalMins/60)} icon="⏱" color={T.green} bg={T.greenLight}/>
      </div>

      <Card style={{background:T.cardAlt}}>
        <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Last 7 Days</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {last7.map(d=>(
            <div key={d.key} style={{textAlign:"center"}}>
              <div style={{width:34,height:34,borderRadius:10,background:d.trained?T.teal:T.surface,border:`1.5px solid ${d.trained?T.teal:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:4,color:"#fff",fontWeight:700}}>{d.trained?"✓":""}</div>
              <div style={{fontSize:10,color:T.muted,fontWeight:600}}>{d.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Btn onClick={()=>setAdding(true)} style={{width:"100%",padding:"14px",fontSize:15,marginBottom:14,marginTop:2}}>+ Log Today's Session</Btn>

      {/* Add session sheet */}
      {adding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:24}}>Log Session</div>
              <button onClick={()=>setAdding(false)} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{l:"Date",k:"date",t:"date"},{l:"Duration (min)",k:"duration",t:"number"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                  <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",colorScheme:"light"}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Session Type</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Gi","No-Gi","Open Mat","Drilling","Competition","Private"].map(t=>(
                  <button key={t} onClick={()=>setForm({...form,type:t})} style={{background:form.type===t?T.teal:T.surface,color:form.type===t?"#fff":T.muted,border:`1.5px solid ${form.type===t?T.teal:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t}</button>
                ))}
              </div>
            </div>
            {[
              {l:"Techniques Drilled",k:"techniques",ph:"e.g. Triangle setup, knee slice pass, hip bump sweep...",rows:2,color:T.muted,bg:T.surface,border:T.border},
              {l:"💡 Key Learnings",k:"learnings",ph:"What clicked today? Any 'aha' moments? What to remember next time...",rows:3,color:T.teal,bg:T.tealLight,border:T.teal+"44"},
              {l:"General Notes",k:"notes",ph:"How did the session feel? What to focus on next...",rows:2,color:T.muted,bg:T.surface,border:T.border},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:14}}>
                <div style={{fontSize:11,color:f.color,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <textarea value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} rows={f.rows} placeholder={f.ph}
                  style={{width:"100%",background:f.bg,border:`1.5px solid ${f.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
              </div>
            ))}
            <Btn onClick={saveEntry} disabled={saving} style={{width:"100%",padding:"15px",fontSize:15}}>
              {saving?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/>Saving...</span>:"Save Session ✓"}
            </Btn>
          </div>
        </div>
      )}

      {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>}

      {!loading&&entries.length===0&&(
        <div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}>
          <div style={{fontSize:40,marginBottom:10}}>📓</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>No sessions yet</div>
          <div style={{fontSize:13}}>Start logging your journey on the mats!</div>
        </div>
      )}

      {entries.map(e=>(
        <Card key={e.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                <Pill label={e.type}/><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{e.date}</span><span style={{fontSize:11,color:T.muted}}>· {e.duration} min</span>
              </div>
              {e.learnings&&(
                <div style={{background:T.tealLight,border:`1px solid ${T.teal}33`,borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                  <div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>💡 Key Learnings</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{e.learnings}</div>
                </div>
              )}
              {e.techniques&&<div style={{fontSize:12,color:T.muted,marginBottom:2}}><span style={{color:T.text,fontWeight:600}}>Drilled: </span>{e.techniques}</div>}
              {e.notes&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{e.notes}</div>}
            </div>
            <button onClick={()=>delEntry(e.id)} style={{background:"none",border:"none",color:T.subtle,cursor:"pointer",fontSize:16,marginLeft:8,flexShrink:0}}>✕</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── COMPETITION ───────────────────────────────────────────────────────────────
function CompScreen({user}){
  const [tab,setTab]=useState("gameplan");
  const [gameplan,setGameplan]=useState({});
  const [gpLoading,setGpLoading]=useState(true);
  const [comps,setComps]=useState([]);
  const [compsLoading,setCompsLoading]=useState(true);
  const [addComp,setAddComp]=useState(false);
  const [compForm,setCompForm]=useState({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  const [openCat,setOpenCat]=useState(GAMEPLAN_SECTIONS[0].category);
  const saveTimer=useRef({});

  useEffect(()=>{
    supabase.from("game_plan").select("*").eq("user_id",user.id).then(({data})=>{
      if(data){const g={};data.forEach(r=>g[r.position_key]=r.value);setGameplan(g);}
      setGpLoading(false);
    });
    supabase.from("competitions").select("*").eq("user_id",user.id).order("date",{ascending:true}).then(({data})=>{
      if(data)setComps(data);setCompsLoading(false);
    });
  },[user.id]);

  // Debounced save for game plan
  const saveGp=(pos,val)=>{
    setGameplan(g=>({...g,[pos]:val}));
    clearTimeout(saveTimer.current[pos]);
    saveTimer.current[pos]=setTimeout(async()=>{
      await supabase.from("game_plan").upsert({user_id:user.id,position_key:pos,value:val,updated_at:new Date().toISOString()},{onConflict:"user_id,position_key"});
    },800);
  };

  const saveComp=async()=>{
    const{data}=await supabase.from("competitions").insert({user_id:user.id,...compForm}).select().single();
    if(data)setComps(c=>[...c,data].sort((a,b)=>new Date(a.date)-new Date(b.date)));
    setAddComp(false);setCompForm({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  };

  const delComp=async(id)=>{
    await supabase.from("competitions").delete().eq("id",id);
    setComps(c=>c.filter(x=>x.id!==id));
  };

  const filledCount=Object.values(gameplan).filter(v=>v&&v.trim()).length;
  const totalFields=GAMEPLAN_SECTIONS.reduce((a,s)=>a+s.positions.length,0);
  const pct=Math.round((filledCount/totalFields)*100);

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Plan, prepare, and compete with confidence">Competition Prep</SectionTitle>
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["gameplan","🗺 Game Plan"],["comps","🏆 Events"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",background:tab===t?T.teal:"none",color:tab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {tab==="gameplan"&&(
        <div>
          {gpLoading?<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>:(
            <>
              <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.teal}}>Blueprint Completion</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontWeight:700,color:T.teal}}>{pct}%</div>
                </div>
                <div style={{background:T.surface,borderRadius:8,height:8,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:T.teal,borderRadius:8,transition:"width 0.5s ease"}}/>
                </div>
                <div style={{fontSize:11,color:T.muted,marginTop:6}}>{filledCount} of {totalFields} positions filled in · Auto-saves as you type</div>
              </Card>

              {GAMEPLAN_SECTIONS.map(section=>{
                const filled=section.positions.filter(p=>gameplan[p.pos]?.trim()).length;
                const isOpen=openCat===section.category;
                return(
                  <div key={section.category} style={{marginBottom:8}}>
                    <button onClick={()=>setOpenCat(isOpen?null:section.category)} style={{width:"100%",background:isOpen?T.teal:T.surface,border:`1.5px solid ${isOpen?T.teal:T.border}`,borderRadius:isOpen?"12px 12px 0 0":12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",boxShadow:T.shadow}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:isOpen?"#fff":T.text}}>{section.category}</div>
                        <div style={{fontSize:11,color:isOpen?"rgba(255,255,255,0.7)":T.muted,marginTop:1}}>{filled}/{section.positions.length} filled</div>
                      </div>
                      <span style={{color:isOpen?"#fff":T.muted,fontSize:13}}>{isOpen?"▲":"▼"}</span>
                    </button>
                    {isOpen&&(
                      <div style={{background:T.cardAlt,border:`1.5px solid ${T.teal}22`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px 12px 8px",animation:"fadeUp 0.2s ease"}}>
                        {section.positions.map(({pos,ph})=>(
                          <div key={pos} style={{marginBottom:13}}>
                            <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{pos}</div>
                            <textarea value={gameplan[pos]||""} onChange={e=>saveGp(pos,e.target.value)} rows={2} placeholder={ph}
                              style={{width:"100%",background:T.surface,border:`1.5px solid ${gameplan[pos]?.trim()?T.teal+"55":T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",lineHeight:1.5}}/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab==="comps"&&(
        <div>
          <Btn onClick={()=>setAddComp(true)} style={{width:"100%",padding:"13px",fontSize:14,marginBottom:12}}>+ Add Competition</Btn>
          {addComp&&(
            <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:14}}>New Competition</div>
              {[{l:"Competition Name",k:"name",t:"text"},{l:"Date",k:"date",t:"date"},{l:"Weight Class",k:"weight",t:"text"},{l:"Your Goal",k:"goal",t:"text"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                  <input type={f.t} value={compForm[f.k]} onChange={e=>setCompForm({...compForm,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",colorScheme:"light"}}/>
                </div>
              ))}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Division</div>
                <div style={{display:"flex",gap:6}}>
                  {["Gi","No-Gi","Both"].map(g=>(
                    <button key={g} onClick={()=>setCompForm({...compForm,gi:g})} style={{background:compForm.gi===g?T.teal:T.surface,color:compForm.gi===g?"#fff":T.muted,border:`1.5px solid ${compForm.gi===g?T.teal:T.border}`,borderRadius:8,padding:"7px 18px",fontSize:12,cursor:"pointer",fontWeight:700}}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Prep Notes</div>
                <textarea value={compForm.notes} onChange={e=>setCompForm({...compForm,notes:e.target.value})} rows={2} placeholder="Opponent info, areas to focus on, travel details..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={saveComp} style={{flex:1,padding:"12px"}}>Save</Btn>
                <Btn onClick={()=>setAddComp(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn>
              </div>
            </Card>
          )}
          {compsLoading&&<div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>}
          {!compsLoading&&comps.length===0&&!addComp&&(
            <div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}>
              <div style={{fontSize:40,marginBottom:10}}>🏆</div>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>No competitions yet</div>
              <div style={{fontSize:13}}>Add your next event and start planning!</div>
            </div>
          )}
          {comps.map(c=>{
            const daysUntil=Math.ceil((new Date(c.date)-new Date())/86400000);
            return(
              <Card key={c.id} style={{borderLeft:`4px solid ${T.teal}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>{c.name||"Untitled Competition"}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      {c.date&&<Pill label={c.date}/>}
                      {c.weight&&<Pill label={c.weight} color={T.orange} bg={T.orangeLight}/>}
                      <Pill label={c.gi}/>
                    </div>
                    {c.date&&daysUntil>0&&<div style={{fontSize:12,color:T.orange,fontWeight:700}}>📅 {daysUntil} days away</div>}
                    {c.date&&daysUntil===0&&<div style={{fontSize:12,color:T.green,fontWeight:700}}>🥋 Today's the day!</div>}
                    {c.goal&&<div style={{fontSize:12,color:T.teal,marginTop:4}}>🎯 <strong>Goal:</strong> {c.goal}</div>}
                    {c.notes&&<div style={{fontSize:12,color:T.muted,marginTop:4,fontStyle:"italic"}}>{c.notes}</div>}
                  </div>
                  <button onClick={()=>delComp(c.id)} style={{background:"none",border:"none",color:T.subtle,cursor:"pointer",fontSize:16}}>✕</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({user,setTab,onSignOut}){
  const [entries,setEntries]=useState([]);
  const [profile,setProfile]=useState({name:"Fighter",belt:"White"});
  const [editing,setEditing]=useState(false);
  const [nameInput,setNameInput]=useState("Fighter");
  const [beltInput,setBeltInput]=useState("White");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id",user.id).order("date",{ascending:false}),
      supabase.from("profiles").select("*").eq("id",user.id).single(),
    ]).then(([{data:j},{data:p}])=>{
      if(j)setEntries(j);
      if(p){setProfile(p);setNameInput(p.name);setBeltInput(p.belt);}
      setLoading(false);
    });
  },[user.id]);

  const saveProfile=async()=>{
    await supabase.from("profiles").upsert({id:user.id,name:nameInput,belt:beltInput,updated_at:new Date().toISOString()});
    setProfile({name:nameInput,belt:beltInput});setEditing(false);
  };

  const thisWeek=entries.filter(e=>(new Date()-new Date(e.date))<7*86400000).length;
  const totalHours=Math.floor(entries.reduce((a,e)=>a+Number(e.duration||0),0)/60);
  const lastEntry=entries[0];
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  const actions=[
    {icon:"⏱",label:"Sparring Timer",sub:"Set up rounds",action:()=>setTab("timer"),color:T.teal,bg:T.tealLight},
    {icon:"📓",label:"Log Session",sub:"Record training",action:()=>setTab("journal"),color:T.orange,bg:T.orangeLight},
    {icon:"📚",label:"Techniques",sub:"Browse & tutorials",action:()=>setTab("techniques"),color:T.green,bg:T.greenLight},
    {icon:"🏆",label:"Compete",sub:"Game plan & events",action:()=>setTab("comp"),color:T.teal,bg:T.tealLight},
  ];

  return(
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      {/* Profile header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,padding:"16px",background:T.teal,borderRadius:18,boxShadow:`0 4px 20px ${T.teal}44`}}>
        <div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600,marginBottom:2}}>{greeting} 👋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:"#fff",lineHeight:1}}>{profile.name}</div>
          <div style={{marginTop:6,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:BELT_COLORS[profile.belt],color:BELT_TEXT[profile.belt],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{profile.belt} Belt</span>
          </div>
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
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {Object.keys(BELT_COLORS).map(b=>(
              <button key={b} onClick={()=>setBeltInput(b)} style={{background:beltInput===b?BELT_COLORS[b]:"none",color:beltInput===b?BELT_TEXT[b]:T.muted,border:`2px solid ${BELT_COLORS[b]}`,borderRadius:8,padding:"5px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{b}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <Btn onClick={saveProfile} style={{flex:1,padding:"11px"}}>Save</Btn>
            <Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"11px"}}>Cancel</Btn>
          </div>
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
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <Pill label={lastEntry.type}/>
                  <span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{lastEntry.date} · {lastEntry.duration}min</span>
                </div>
                {lastEntry.learnings&&(
                  <div style={{background:T.tealLight,borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                    <div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:1}}>💡 Key Learnings</div>
                    <div style={{fontSize:12,color:T.text}}>{lastEntry.learnings.slice(0,100)}{lastEntry.learnings.length>100?"...":""}</div>
                  </div>
                )}
                {lastEntry.notes&&<div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{lastEntry.notes.slice(0,80)}{lastEntry.notes.length>80?"...":""}</div>}
              </Card>
            </>
          )}

          <div style={{background:`linear-gradient(135deg,${T.tealLight},${T.surface})`,border:`1px solid ${T.teal}22`,borderRadius:14,padding:"16px",textAlign:"center",marginTop:4,marginBottom:8}}>
            <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:16,color:T.teal,lineHeight:1.5}}>"A black belt is just a white belt who never quit."</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function BJJApp(){
  const [session,setSession]=useState(undefined); // undefined=loading, null=no session
  const [tab,setTab]=useState("home");

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=GLOBAL_CSS;
    document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return()=>subscription.unsubscribe();
  },[]);

  const signOut=async()=>{await supabase.auth.signOut();setTab("home");};

  // Loading state while checking session
  if(session===undefined) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <Spinner size={40}/>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.muted}}>Loading BJJPro...</div>
    </div>
  );

  if(!session) return <AuthScreen/>;

  const tabs=[
    {id:"home",icon:"⊞",label:"Home"},
    {id:"timer",icon:"⏱",label:"Timer"},
    {id:"techniques",icon:"📚",label:"Techniques"},
    {id:"journal",icon:"📓",label:"Journal"},
    {id:"comp",icon:"🏆",label:"Compete"},
  ];

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(30,45,64,0.07)"}}>
        <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text}}>BJJ<span style={{color:T.teal}}>Pro</span></div>
        <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'",fontWeight:600}}>{new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"})}</div>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingTop:16,paddingBottom:80}}>
        {tab==="home"       &&<HomeScreen user={session.user} setTab={setTab} onSignOut={signOut}/>}
        {tab==="timer"      &&<TimerScreen/>}
        {tab==="techniques" &&<TechniqueScreen user={session.user}/>}
        {tab==="journal"    &&<JournalScreen user={session.user}/>}
        {tab==="comp"       &&<CompScreen user={session.user}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:50,boxShadow:"0 -2px 12px rgba(30,45,64,0.08)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:tab===t.id?`2.5px solid ${T.teal}`:"2.5px solid transparent"}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:9,color:tab===t.id?T.teal:T.muted,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
