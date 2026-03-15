import { useState, useEffect, useRef } from "react";
import { T } from "../theme";
import { useAudio } from "../hooks/useAudio";
import { fmtTime } from "../utils/time";
import { SectionTitle, Card, Btn, Spinner } from "../components/ui";

export default function TimerScreen() {
  const [roundLen, setRoundLen] = useState(300);
  const [restLen, setRestLen] = useState(60);
  const [rounds, setRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRest, setIsRest] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const interval = useRef(null);
  const wakeLock = useRef(null);
  const {ringRoundEnd, ringRoundStart, unlockAudio} = useAudio(volume);

  const requestWakeLock = async () => { try { if ("wakeLock" in navigator) { wakeLock.current = await navigator.wakeLock.request("screen"); } } catch(e) {} };
  const releaseWakeLock = () => { try { if (wakeLock.current) { wakeLock.current.release(); wakeLock.current = null; } } catch(e) {} };
  const reset = () => { clearInterval(interval.current); releaseWakeLock(); setRunning(false); setCurrentRound(1); setIsRest(false); setTimeLeft(roundLen); setDone(false); setShowSetup(true); setFullscreen(false); };
  const start = () => { unlockAudio(); requestWakeLock(); setShowSetup(false); setTimeLeft(roundLen); setRunning(true); };

  useEffect(() => {
    if (!running) { clearInterval(interval.current); return; }
    interval.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRest(r => {
            if (!r) { ringRoundEnd(); setCurrentRound(cr => { if (cr >= rounds) { setRunning(false); setDone(true); releaseWakeLock(); clearInterval(interval.current); return cr; } return cr+1; }); setTimeout(() => setTimeLeft(restLen), 0); return true; }
            else { setTimeout(() => { setTimeLeft(roundLen); ringRoundStart(); }, 0); return false; }
          }); return 0;
        } return t-1;
      });
    }, 1000);
    return () => clearInterval(interval.current);
  }, [running, rounds, roundLen, restLen, ringRoundEnd, ringRoundStart]);

  const pct = isRest ? (timeLeft/restLen)*100 : (timeLeft/roundLen)*100;
  const r = 80, circ = 2*Math.PI*r;

  if (fullscreen && !showSetup) {
    const fsColor = isRest ? T.orange : T.teal;
    return (
      <div className="fullscreen-timer" onClick={() => setRunning(rv => !rv)}>
        <div style={{fontSize:"3vw",fontFamily:"'JetBrains Mono'",color:"rgba(255,255,255,0.4)",letterSpacing:3,textTransform:"uppercase",marginBottom:"2vw"}}>{isRest ? "Rest" : `Round ${currentRound} / ${rounds}`}</div>
        <div className="fs-time" style={{color:timeLeft<=5&&running?"#e07b39":"#fff",animation:timeLeft<=5&&running?"blink 0.5s infinite":"none"}}>{fmtTime(timeLeft)}</div>
        <div className="fs-label" style={{color:fsColor}}>{isRest ? "😮‍💨 Rest Period" : "🥋 Rolling"}</div>
        <div style={{marginTop:"4vw",fontSize:"2.5vw",color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono'"}}>TAP TO {running ? "PAUSE" : "RESUME"}</div>
        <button onClick={e=>{e.stopPropagation();setFullscreen(false);}} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,padding:"10px 18px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:700}}>Exit ✕</button>
        <div style={{position:"absolute",bottom:40,display:"flex",gap:10}}>
          {Array.from({length:rounds}).map((_,i) => <div key={i} style={{width:12,height:12,borderRadius:"50%",background:i<currentRound-1?fsColor:i===currentRound-1?(isRest?T.orange:fsColor):"rgba(255,255,255,0.2)",opacity:i<currentRound-1?0.5:1}}/>)}
        </div>
      </div>
    );
  }

  if (showSetup) return (
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Configure your sparring session">Sparring Timer</SectionTitle>
      {[{label:"Round Length",val:roundLen,set:setRoundLen,opts:[60,120,180,240,300,360,420,480,600]},{label:"Rest Period",val:restLen,set:setRestLen,opts:[15,30,45,60,90,120]},{label:"Number of Rounds",val:rounds,set:setRounds,opts:[1,2,3,4,5,6,8,10]}].map(({label,val,set,opts}) => (
        <Card key={label}>
          <div style={{fontSize:12,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>{label}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {opts.map(o => <button key={o} onClick={() => set(o)} style={{background:val===o?T.teal:T.cardAlt,color:val===o?"#fff":T.muted,border:`1.5px solid ${val===o?T.teal:T.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontFamily:"'JetBrains Mono'",cursor:"pointer",fontWeight:600}}>{label==="Number of Rounds"?o:fmtTime(o)}</button>)}
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

  return (
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",animation:"fadeUp 0.3s ease"}}>
      <div style={{marginBottom:18,marginTop:4,textAlign:"center"}}><div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:T.text}}>{isRest ? "Rest Time 😮‍💨" : `Round ${currentRound} of ${rounds} 🥋`}</div></div>
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
      {done ? (
        <div style={{textAlign:"center",animation:"popIn 0.4s ease"}}>
          <div style={{fontSize:48,marginBottom:8}}>🏅</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:32,color:T.teal,marginBottom:4}}>Session Complete!</div>
          <div style={{color:T.muted,marginBottom:20,fontSize:14}}>{rounds} rounds · {fmtTime(rounds*roundLen)} rolling</div>
          <Btn onClick={reset}>Start New Session</Btn>
        </div>
      ) : (
        <>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <Btn onClick={() => setRunning(rv => !rv)} variant={running?"secondary":"primary"} style={{minWidth:120}}>{running ? "⏸  Pause" : "▶  Resume"}</Btn>
            <Btn onClick={() => setFullscreen(true)} variant="secondary" style={{minWidth:50}}>⛶</Btn>
            <Btn onClick={reset} variant="ghost">Reset</Btn>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{Array.from({length:rounds}).map((_,i) => <div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<currentRound-1?T.teal:i===currentRound-1?(isRest?T.orange:T.teal):T.border,opacity:i<currentRound-1?0.4:1}}/>)}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <span style={{fontSize:13}}>{volume===0?"🔇":volume<0.75?"🔉":"🔊"}</span>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e=>setVolume(Number(e.target.value))} style={{width:100,accentColor:T.teal,cursor:"pointer"}}/>
          </div>
        </>
      )}
    </div>
  );
}
