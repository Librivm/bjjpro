import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { todayStr } from "../utils/time";
import { BELT_COLORS, BELT_TEXT } from "../data/ibjjfRules";
import { SectionTitle, Card, Pill, StatBox, Btn, Spinner } from "../components/ui";
import NoticesBanner from "../components/NoticesBanner";

const TUTORIAL_STEPS = [
  {icon:"👋",title:"Welcome to Openmat!",desc:"Your personal jiu-jitsu companion. Let's take a quick tour of the app so you can get the most out of it."},
  {icon:"📅",title:"Schedule",desc:"Log every training session, track your weekly streak, and view your training history on the calendar. All in one place."},
  {icon:"📚",title:"Technique Library",desc:"Browse 12 categories of BJJ techniques across all skill levels. Save your favourites to your personal library with video links and notes."},
  {icon:"🏆",title:"Competition Prep",desc:"Build a position-by-position game plan, find upcoming events near you with AI search, and review IBJJF rules for your division."},
  {icon:"⏱",title:"Sparring Timer",desc:"Set up rounds with custom lengths, rest periods, and bell sounds. Go fullscreen and screen mirror to a TV for the whole gym to see."},
  {icon:"🥋",title:"Set Up Your Profile",desc:"Head to the Home screen and tap 'Edit Profile' to set your name, belt rank, and location. Your location is used to find nearby events."},
];

export function TutorialOverlay({onComplete}) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.92)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeUp 0.3s ease"}}>
      <div style={{background:T.surface,borderRadius:24,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.3)",animation:"popIn 0.3s ease"}}>
        <div style={{fontSize:52,marginBottom:16}}>{s.icon}</div>
        <div style={{fontFamily:"'DM Serif Display'",fontSize:24,color:T.text,marginBottom:8,lineHeight:1.2}}>{s.title}</div>
        <div style={{fontSize:14,color:T.muted,lineHeight:1.7,marginBottom:24,padding:"0 8px"}}>{s.desc}</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
          {TUTORIAL_STEPS.map((_,i) => <div key={i} style={{width:i===step?20:8,height:8,borderRadius:4,background:i===step?T.teal:T.border,transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step > 0 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",background:"none",border:`1.5px solid ${T.border}`,borderRadius:12,color:T.muted,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back</button>}
          {!isLast ? (
            <button onClick={()=>setStep(s=>s+1)} style={{flex:1,padding:"13px",background:T.teal,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${T.teal}44`}}>Next →</button>
          ) : (
            <button onClick={onComplete} style={{flex:1,padding:"13px",background:T.teal,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${T.teal}44`}}>Get Started 🥋</button>
          )}
        </div>
        {!isLast && <button onClick={onComplete} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",marginTop:14,padding:0}}>Skip tutorial</button>}
      </div>
    </div>
  );
}

export default function HomeScreen({user, profile, setTab, onSignOut, onReplayTutorial, darkMode, toggleDarkMode, onProfileUpdate}) {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || "");
  const [beltInput, setBeltInput] = useState(profile?.belt || "White");
  const [locationInput, setLocationInput] = useState(profile?.location || "");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [gymCode, setGymCode] = useState("");
  const [gymFound, setGymFound] = useState(null);
  const [gymJoining, setGymJoining] = useState(false);
  const [gymError, setGymError] = useState("");
  const [changingGym, setChangingGym] = useState(false);
  const [quickLogType, setQuickLogType] = useState("Open Mat");
  const [quickLogging, setQuickLogging] = useState(false);
  const [quickLogged, setQuickLogged] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    supabase.from("journal_entries").select("*").eq("user_id", user.id).order("date", { ascending: false })
      .then(({ data: j }) => { if (j) setEntries(j); setLoading(false); });
  }, [user.id]);

  useEffect(() => {
    if (profile) {
      setNameInput(profile.name || "");
      setBeltInput(profile.belt || "White");
      setLocationInput(profile.location || "");
    }
  }, [profile]);

  const saveProfile = async () => {
    const updated = { id: user.id, name: nameInput, belt: beltInput, location: locationInput, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from("profiles").upsert(updated).select("*").single();
    if (error) { console.error("Failed to save profile:", error.message); setNameInput(profile?.name || ""); setBeltInput(profile?.belt || "White"); setLocationInput(profile?.location || ""); return; }
    if (data) onProfileUpdate(data);
    setEditing(false);
  };

  const lookupGym = async () => {
    const code = gymCode.trim().toUpperCase();
    if (code.length !== 6) { setGymError("Enter a 6-character code"); return; }
    setGymError(""); setGymFound(null);
    const { data } = await supabase.from("gyms").select("*").eq("join_code", code).single();
    if (!data) { setGymError("Invalid code — check with your coach"); return; }
    setGymFound(data);
  };

  const joinGym = async () => {
    if (!gymFound) return;
    setGymJoining(true);
    const { data } = await supabase.from("profiles").upsert({ id: user.id, gym_id: gymFound.id, role: "member" }).select("*").single();
    if (data) { onProfileUpdate(data); setGymFound(null); setGymCode(""); setChangingGym(false); }
    setGymJoining(false);
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    setFeedbackSaving(true);
    const {error} = await supabase.from("feedback").insert({user_id:user.id,message:feedback.trim()});
    if (!error) { setFeedbackSent(true); setFeedback(""); setShowFeedback(false); }
    setFeedbackSaving(false);
  };

  const quickLog = async () => {
    setQuickLogging(true);
    const { data } = await supabase.from("journal_entries").insert({ user_id: user.id, date: todayStr(), duration: 60, type: quickLogType, techniques: "", notes: "", learnings: "" }).select().single();
    if (data) { setEntries(prev => [data, ...prev]); setQuickLogged(true); }
    setQuickLogging(false);
  };

  const thisWeek = entries.filter(e => (new Date()-new Date(e.date)) < 7*86400000).length;
  const totalHours = Math.floor(entries.reduce((a,e) => a+Number(e.duration||0), 0)/60);
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const profileSteps = [
    { label: "Name set", done: !!profile?.name },
    { label: "Location added", done: !!profile?.location },
    { label: "Gym connected", done: !!profile?.gym_id },
    { label: "First session logged", done: entries.length > 0 },
  ];
  const profilePct = Math.round(profileSteps.filter(s => s.done).length / profileSteps.length * 100);
  const trainedToday = !loading && entries.some(e => e.date === todayStr());

  return (
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <NoticesBanner user={user} profile={profile} />

      {/* Profile progress bar — compact, tap opens edit sheet */}
      {!loading && profilePct < 100 && (
        <button onClick={() => setEditing(true)} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.teal}33`,borderRadius:14,padding:"12px 14px",marginBottom:14,animation:"fadeUp 0.3s ease",textAlign:"left",cursor:"pointer",display:"block"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Profile {profilePct}% complete — tap to finish</div>
            <div style={{fontSize:11,color:T.teal}}>{profileSteps.filter(s=>s.done).length}/{profileSteps.length} ✓</div>
          </div>
          <div style={{height:6,background:T.cardAlt,borderRadius:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${profilePct}%`,background:T.teal,borderRadius:6,transition:"width 0.5s ease"}}/>
          </div>
        </button>
      )}

      {/* Quick Log */}
      {!loading && !trainedToday && !quickLogged && (
        <div style={{background:T.orangeLight,border:`1.5px solid ${T.orange}44`,borderRadius:14,padding:"14px",marginBottom:14,animation:"fadeUp 0.3s ease"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:10}}>⚡ Just trained?</div>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {["Gi","No-Gi","Open Mat","Drilling"].map(t => (
              <button key={t} onClick={()=>setQuickLogType(t)}
                style={{background:quickLogType===t?T.orange:T.surface,color:quickLogType===t?"#fff":T.muted,border:`1.5px solid ${quickLogType===t?T.orange:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                {t}
              </button>
            ))}
          </div>
          <Btn onClick={quickLog} disabled={quickLogging} style={{width:"100%",padding:"11px",background:T.orange,boxShadow:`0 2px 8px ${T.orange}44`,fontSize:13}}>
            {quickLogging ? <Spinner size={15} color="#fff"/> : "Log 60min Session →"}
          </Btn>
        </div>
      )}
      {!loading && quickLogged && (
        <div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",animation:"popIn 0.3s ease"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.green}}>✓ Session logged!</div>
          <button onClick={()=>setTab("schedule")} style={{background:"none",border:`1px solid ${T.green}66`,borderRadius:8,padding:"5px 10px",fontSize:11,color:T.green,cursor:"pointer",fontWeight:700}}>Add details →</button>
        </div>
      )}

      {/* Greeting card */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,padding:"16px",background:T.teal,borderRadius:18,boxShadow:`0 4px 20px ${T.teal}44`}}>
        <div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600,marginBottom:2}}>{greeting} 👋</div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:26,color:"#fff",lineHeight:1}}>{profile?.name||user.email?.split("@")[0]||"Fighter"}</div>
          <div style={{marginTop:6}}><span style={{background:BELT_COLORS[profile?.belt||"White"],color:BELT_TEXT[profile?.belt||"White"],borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{profile?.belt||"White"} Belt</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"2px solid rgba(255,255,255,0.3)"}}>🥋</div>
          <button onClick={()=>setEditing(true)} style={{fontSize:11,color:"rgba(255,255,255,0.7)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Edit profile</button>
        </div>
      </div>

      {/* Edit Profile — bottom sheet */}
      {editing && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={e => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div style={{background:T.surface,borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",maxHeight:"85vh",overflowY:"auto",animation:"slideUp 0.3s ease"}}>
            <div style={{width:40,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:12}}>Edit Profile</div>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Your Name</div>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} style={{width:"100%",background:T.cardAlt,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:12}}/>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Belt Rank</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{Object.keys(BELT_COLORS).map(b => <button key={b} onClick={()=>setBeltInput(b)} style={{background:beltInput===b?BELT_COLORS[b]:"none",color:beltInput===b?BELT_TEXT[b]:T.muted,border:`2px solid ${BELT_COLORS[b]}`,borderRadius:8,padding:"5px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{b}</button>)}</div>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Location</div>
            <input value={locationInput} onChange={e=>setLocationInput(e.target.value)} placeholder="e.g. Auckland, New Zealand" style={{width:"100%",background:T.cardAlt,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:12}}/>
            <div style={{fontSize:11,color:T.muted,marginBottom:12,fontStyle:"italic"}}>Used for finding nearby BJJ events</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}><Btn onClick={saveProfile} style={{flex:1,padding:"11px"}}>Save</Btn><Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"11px"}}>Cancel</Btn></div>
            <div style={{height:1,background:T.border,marginBottom:16}}/>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Gym</div>
            {profile?.gym_id && !changingGym ? (
              <div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:13,color:T.green,fontWeight:700}}>✓ Gym connected</div>
                <button onClick={()=>{setChangingGym(true);setGymCode("");setGymFound(null);setGymError("");}} style={{background:"none",border:`1px solid ${T.green}66`,borderRadius:8,padding:"4px 10px",fontSize:11,color:T.green,cursor:"pointer",fontWeight:700}}>Change</button>
              </div>
            ) : (
              <div style={{marginBottom:14}}>
                {changingGym && (
                  <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Enter your new gym's join code to switch gyms.</div>
                )}
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <input value={gymCode} onChange={e=>{setGymCode(e.target.value.toUpperCase().slice(0,6));setGymError("");setGymFound(null);}} placeholder="Join code (e.g. ABC123)" maxLength={6}
                    style={{flex:1,background:T.cardAlt,border:`1.5px solid ${gymError?'#dc2626':T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",letterSpacing:2,fontFamily:"'JetBrains Mono'"}}/>
                  <Btn onClick={lookupGym} disabled={gymCode.length!==6} style={{padding:"10px 14px",fontSize:12}}>Find</Btn>
                </div>
                {gymError && <div style={{fontSize:12,color:"#dc2626",marginBottom:6}}>{gymError}</div>}
                {gymFound && (
                  <div style={{background:T.tealLight,border:`1.5px solid ${T.teal}44`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Found</div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{gymFound.name}</div></div>
                    <Btn onClick={joinGym} disabled={gymJoining} style={{padding:"8px 14px",fontSize:12}}>{gymJoining?<Spinner size={14} color="#fff"/>:"Join →"}</Btn>
                  </div>
                )}
                {changingGym && (
                  <button onClick={()=>{setChangingGym(false);setGymCode("");setGymFound(null);setGymError("");}} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",marginTop:6,padding:0,textDecoration:"underline"}}>Cancel</button>
                )}
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"12px 14px",background:T.cardAlt,borderRadius:12,border:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Dark Mode</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{darkMode?"On":"Off"}</div>
              </div>
              <button onClick={toggleDarkMode} style={{width:48,height:28,borderRadius:14,border:"none",cursor:"pointer",background:darkMode?T.teal:T.border,position:"relative",transition:"background 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:3,left:darkMode?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
              </button>
            </div>
            <button onClick={onSignOut} style={{width:"100%",background:"none",border:`1px solid #fca5a5`,borderRadius:10,padding:"10px",color:"#dc2626",fontSize:13,fontWeight:600,cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>
      )}

      {loading ? <div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><Spinner size={28}/></div> : (
        <>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <StatBox label="This Week" value={thisWeek} icon="📅" color={T.teal} bg={T.tealLight}/>
            <StatBox label="Total Hours" value={totalHours} icon="⏱" color={T.orange} bg={T.orangeLight}/>
            <StatBox label="Sessions" value={entries.length} icon="🥋" color={T.green} bg={T.greenLight}/>
          </div>

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

          {/* Feedback — collapsed toggle */}
          <div style={{marginBottom:8,textAlign:"center"}}>
            {feedbackSent ? (
              <div style={{fontSize:12,color:T.green,padding:"8px 0"}}>🙏 Thanks for the feedback!</div>
            ) : (
              <>
                <button onClick={()=>setShowFeedback(f=>!f)} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",padding:"6px 0",textDecoration:"underline"}}>
                  📣 Beta — send feedback {showFeedback?"▴":"▾"}
                </button>
                {showFeedback && (
                  <div style={{background:T.orangeLight,border:`1px solid ${T.orange}33`,borderRadius:12,padding:"12px",marginTop:6,textAlign:"left",animation:"fadeUp 0.2s ease"}}>
                    <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} maxLength={500} rows={3}
                      placeholder="What's working? What could be better? Any features you'd love to see?"
                      style={{width:"100%",background:T.surface,border:`1.5px solid ${T.orange}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",marginBottom:8}}/>
                    <Btn onClick={submitFeedback} disabled={feedbackSaving||!feedback.trim()} style={{width:"100%",padding:"11px",background:T.orange,boxShadow:`0 2px 8px ${T.orange}44`}}>
                      {feedbackSaving?<Spinner size={16} color="#fff"/>:"Send Feedback →"}
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>

          {/* What's New — collapsed toggle */}
          <div style={{marginBottom:16}}>
            <button onClick={()=>setShowWhatsNew(s=>!s)} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",padding:"6px 0",textDecoration:"underline",width:"100%",textAlign:"center"}}>
              What's new in v0.8 {showWhatsNew?"▴":"▾"}
            </button>
            {showWhatsNew && (
              <div style={{marginTop:8,animation:"fadeUp 0.2s ease"}}>
                {[
                  {version:"v0.8",date:"Mar 2025",items:["Gym support — join your gym with a 6-character code, switch gyms any time from Edit Profile","Coach/admin notices — dismissible banners posted by your gym staff","Weekly class schedule & special events — add classes to your personal calendar","Log Session auto-fills session type & duration from your earliest scheduled class that day","Admin: delete notices permanently, not just toggle off"]},
                  {version:"v0.7",date:"Mar 2025",items:["Dark mode with toggle in Edit Profile","Journal search & filter by session type","Screen stays awake during timer sessions (Wake Lock)","Technique autocomplete from your library when logging sessions"]},
                  {version:"v0.6",date:"Mar 2025",items:["Journal & Calendar merged into one Schedule tab with sub-tabs","App tutorial walkthrough on first launch with replay from Home screen","Bottom nav streamlined from 6 tabs to 5"]},
                  {version:"v0.5",date:"Mar 2025",items:["AI event search now uses your profile location — no more hardcoded region","Location field added to profile — set your city to find nearby events","Calendar log session modal now matches full journal form (Workout type, techniques, notes)","Vercel serverless API proxy for reliable Anthropic API calls"]},
                  {version:"v0.4",date:"Mar 2025",items:["Workout session type added to journal — log gym sessions alongside BJJ","Music app shortcuts on timer screen (Spotify, YouTube Music, Apple Music)"]},
                  {version:"v0.3",date:"Feb 2025",items:["My Library redesigned — category tiles with drill-in view","Recently Added strip shows your last 3 saved techniques","Save any standard library technique silently with one tap","AI event search now filters out past events automatically","Add AI-found events directly to My Events & Calendar"]},
                ].map((rel,i) => (
                  <div key={rel.version} style={{marginBottom:10,opacity:i===0?1:0.85}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{background:i===0?T.teal:T.cardAlt,color:i===0?"#fff":T.muted,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{rel.version}</span>
                      <span style={{fontSize:11,color:T.muted}}>{rel.date}</span>
                      {i===0 && <span style={{background:T.greenLight,color:T.green,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>Latest</span>}
                    </div>
                    <div style={{borderLeft:`2px solid ${i===0?T.teal:T.border}`,paddingLeft:12}}>
                      {rel.items.map((item,j) => (
                        <div key={j} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}>
                          <span style={{color:i===0?T.teal:T.subtle,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                          <span style={{fontSize:12,color:i===0?T.text:T.muted,lineHeight:1.5}}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
