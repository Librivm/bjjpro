import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { todayStr, dayName } from "../utils/time";
import { SectionTitle, Card, Pill, StatBox, Btn, Spinner } from "../components/ui";
import TimetableScreen from "./TimetableScreen";

function JournalEntryModal({entry, onClose, onSave, onDelete, confirmDel}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({date:entry.date,duration:entry.duration,type:entry.type,techniques:entry.techniques||"",notes:entry.notes||"",learnings:entry.learnings||""});
  const [saving, setSaving] = useState(false);
  const SESSION_TYPES = ["Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"];

  const handleSave = async () => {
    setSaving(true);
    await onSave(entry.id, {...form, duration:Number(form.duration)});
    setSaving(false); setEditing(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:22}}>{editing?"Edit Session":"Session Details"}</div>
          <button onClick={onClose} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
        </div>
        {editing ? (
          <>
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
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Session Type</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {SESSION_TYPES.map(t => <button key={t} onClick={()=>setForm({...form,type:t})} style={{background:form.type===t?(t==="Workout"?T.green:T.teal):T.surface,color:form.type===t?"#fff":T.muted,border:`1.5px solid ${form.type===t?(t==="Workout"?T.green:T.teal):T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t}</button>)}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>💡 Key Learnings</div>
              <textarea value={form.learnings} onChange={e=>setForm({...form,learnings:e.target.value})} rows={4} maxLength={1000} placeholder="What clicked today?" style={{width:"100%",background:T.tealLight,border:`1.5px solid ${T.teal}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Techniques Drilled</div>
              <input value={form.techniques} onChange={e=>setForm({...form,techniques:e.target.value})} placeholder="e.g. Armbar, Triangle, Back take..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Notes</div>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} maxLength={500} placeholder="Anything else..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={handleSave} disabled={saving} style={{flex:1,padding:"12px"}}>{saving?<Spinner size={16} color="#fff"/>:"Save Changes ✓"}</Btn>
              <Btn onClick={()=>setEditing(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <Pill label={entry.type}/><Pill label={`${entry.duration} min`} color={T.orange} bg={T.orangeLight}/><Pill label={entry.date} color={T.muted} bg={T.cardAlt}/>
            </div>
            {form.learnings ? <Card style={{background:T.tealLight,border:`1px solid ${T.teal}33`,marginBottom:10}}><div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>💡 Key Learnings</div><div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.learnings}</div></Card> : null}
            {form.techniques ? <Card style={{marginBottom:10}}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>🥋 Techniques Drilled</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{form.techniques}</div></Card> : null}
            {form.notes ? <Card style={{marginBottom:10}}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>📝 Notes</div><div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.notes}</div></Card> : null}
            {!form.learnings && !form.techniques && !form.notes && <div style={{textAlign:"center",color:T.muted,padding:"20px 0",fontSize:13,fontStyle:"italic"}}>No details recorded — tap Edit to add some.</div>}
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

export default function ScheduleScreen({user, profile}) {
  const [subTab, setSubTab] = useState("journal");
  const [entries, setEntries] = useState([]);
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [form, setForm] = useState({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [myTechNames, setMyTechNames] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [streak, setStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [goalInput, setGoalInput] = useState(3);
  const [savingGoal, setSavingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [confirmDelEntry, setConfirmDelEntry] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr+"T12:00:00");
    const dow = d.getDay();
    const diffToMon = (dow===0?-6:1-dow);
    const mon = new Date(d); mon.setDate(d.getDate()+diffToMon);
    return mon.toISOString().split("T")[0];
  };

  const calcStreak = (entryList, goal) => {
    if (!goal || goal <= 0) return 0;
    const weekCounts = {};
    entryList.forEach(e => { const wk = getWeekKey(e.date); weekCounts[wk] = (weekCounts[wk]||0)+1; });
    const thisWeekKey = getWeekKey(todayStr());
    let s = 0;
    let cursor = new Date(thisWeekKey+"T12:00:00");
    for (let i = 0; i < 200; i++) {
      const key = cursor.toISOString().split("T")[0];
      if (weekCounts[key] && weekCounts[key] >= goal) { s++; cursor.setDate(cursor.getDate()-7); }
      else if (key === thisWeekKey) { cursor.setDate(cursor.getDate()-7); continue; }
      else break;
    }
    return s;
  };

  const fetchData = async () => {
    const [{data:j},{data:c},{data:p},{data:techs}] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id",user.id).order("date",{ascending:false}).order("created_at",{ascending:false}),
      supabase.from("competitions").select("*").eq("user_id",user.id),
      supabase.from("profiles").select("weekly_goal").eq("id",user.id).single(),
      supabase.from("custom_techniques").select("title").eq("user_id",user.id),
    ]);
    const goal = (p?.weekly_goal) || 3;
    if (j) { setEntries(j); setStreak(calcStreak(j, goal)); }
    if (c) setComps(c);
    if (techs) setMyTechNames([...new Set(techs.map(t => t.title))]);
    setWeeklyGoal(goal); setGoalInput(goal); setLoading(false);
  };
  useEffect(() => { fetchData(); }, [user.id]);

  const saveGoal = async () => {
    setSavingGoal(true);
    await supabase.from("profiles").upsert({id:user.id, weekly_goal:Number(goalInput), updated_at:new Date().toISOString()});
    setWeeklyGoal(Number(goalInput)); setStreak(calcStreak(entries, Number(goalInput)));
    setEditingGoal(false); setSavingGoal(false);
  };

  const saveEntry = async () => {
    setSaving(true);
    const {data,error} = await supabase.from("journal_entries").insert({user_id:user.id,...form,duration:Number(form.duration)}).select().single();
    if (error) { console.error("Failed to save entry:", error.message); setSaving(false); return; }
    if (data) { const updated = [data,...entries]; setEntries(updated); setStreak(calcStreak(updated,weeklyGoal)); }
    setSaving(false); setAdding(false); setShowExtra(false);
    setForm({date:todayStr(),duration:60,type:"Open Mat",techniques:"",notes:"",learnings:""});
  };

  const delEntry = async (id) => {
    if (confirmDelEntry !== id) { setConfirmDelEntry(id); setTimeout(() => setConfirmDelEntry(null), 3000); return; }
    const {error} = await supabase.from("journal_entries").delete().eq("id",id);
    if (error) { console.error("Failed to delete entry:", error.message); return; }
    const updated = entries.filter(x => x.id !== id);
    setEntries(updated); setStreak(calcStreak(updated,weeklyGoal)); setConfirmDelEntry(null); setViewEntry(null);
  };

  const updateEntry = async (id, fields) => {
    const {error} = await supabase.from("journal_entries").update(fields).eq("id",id);
    if (error) { console.error("Failed to update entry:", error.message); return; }
    const updated = entries.map(x => x.id===id ? {...x,...fields} : x);
    setEntries(updated); setViewEntry(v => v&&v.id===id ? {...v,...fields} : v);
  };

  const thisWeekKey = getWeekKey(todayStr());
  const sessionsThisWeek = entries.filter(e => getWeekKey(e.date) === thisWeekKey).length;
  const goalHit = sessionsThisWeek >= weeklyGoal;
  const last7 = Array.from({length:7}).map((_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const key = d.toISOString().split("T")[0];
    return {key, label:dayName(key), trained:entries.some(e => e.date===key)};
  });
  const totalMins = entries.reduce((a,e) => a+Number(e.duration||0), 0);

  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const monthName = viewDate.toLocaleDateString("en",{month:"long",year:"numeric"});
  const prevMonth = () => setViewDate(new Date(year,month-1,1));
  const nextMonth = () => setViewDate(new Date(year,month+1,1));
  const getDayData = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return {dateStr, trained:entries.filter(e => e.date===dateStr), comp:comps.find(c => c.date===dateStr)};
  };
  const selectedData = selectedDay ? getDayData(selectedDay) : null;

  return (
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Log sessions and track your training">Schedule</SectionTitle>
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["journal","📓 Journal"],["calendar","📅 Calendar"],["classes","🥋 Classes"]].map(([t,l]) => (
          <button key={t} onClick={()=>{setSubTab(t);setSelectedDay(null);}} style={{flex:1,padding:"9px 0",background:subTab===t?T.teal:"none",color:subTab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {subTab==="journal" && (
        <>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <StatBox label="Wk Streak" value={streak} icon="🔥" color={T.orange} bg={T.orangeLight}/>
            <StatBox label="Sessions" value={entries.length} icon="🥋" color={T.teal} bg={T.tealLight}/>
            <StatBox label="Hours" value={Math.floor(totalMins/60)} icon="⏱" color={T.green} bg={T.greenLight}/>
          </div>
          <Card style={{background:goalHit?T.greenLight:T.cardAlt,border:`1.5px solid ${goalHit?T.green+"44":T.border}`,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>Weekly Goal</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:goalHit?T.green:T.text}}>{sessionsThisWeek}<span style={{fontSize:14,color:T.muted,fontWeight:400}}> / {weeklyGoal}</span></div>
                  {goalHit && <span style={{fontSize:13,color:T.green,fontWeight:700}}>✓ Goal hit!</span>}
                </div>
                <div style={{marginTop:6,display:"flex",gap:4}}>
                  {Array.from({length:weeklyGoal}).map((_,i) => <div key={i} style={{width:28,height:8,borderRadius:4,background:i<sessionsThisWeek?(goalHit?T.green:T.teal):T.border,transition:"background 0.3s"}}/>)}
                </div>
              </div>
              <button onClick={()=>{setEditingGoal(e=>!e);setGoalInput(weeklyGoal);}} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",fontSize:12,fontWeight:700,color:T.muted,cursor:"pointer"}}>{editingGoal?"✕":"Edit"}</button>
            </div>
            {editingGoal && (
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{fontSize:12,color:T.muted,fontWeight:600}}>Sessions per week:</div>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5,6,7].map(n => <button key={n} onClick={()=>setGoalInput(n)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${goalInput===n?T.teal:T.border}`,background:goalInput===n?T.teal:T.surface,color:goalInput===n?"#fff":T.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>{n}</button>)}
                </div>
                <Btn onClick={saveGoal} disabled={savingGoal} style={{padding:"6px 14px",fontSize:12,marginLeft:"auto"}}>{savingGoal?<Spinner size={14} color="#fff"/>:"Save"}</Btn>
              </div>
            )}
          </Card>
          <Card style={{background:T.cardAlt}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Last 7 Days</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Tap an empty day to log a session</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              {last7.map(d => (
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
          {!loading && entries.length>0 && (
            <div style={{marginBottom:12}}>
              <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search learnings, techniques, notes..."
                style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",marginBottom:8}}/>
              <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
                {["All","Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"].map(ft => (
                  <button key={ft} onClick={()=>setFilterType(ft)} style={{background:filterType===ft?T.teal:T.surface,color:filterType===ft?"#fff":T.muted,border:`1.5px solid ${filterType===ft?T.teal:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{ft}</button>
                ))}
              </div>
            </div>
          )}
          {loading && <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div>}
          {!loading && entries.length===0 && <div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}><div style={{fontSize:40,marginBottom:10}}>📓</div><div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>No sessions yet</div><div style={{fontSize:13}}>Start logging your journey on the mats!</div></div>}
          {(()=>{
            const q = searchText.toLowerCase().trim();
            const filtered = entries.filter(e => {
              if (filterType!=="All" && e.type!==filterType) return false;
              if (!q) return true;
              return [e.learnings,e.techniques,e.notes,e.type].filter(Boolean).some(f => f.toLowerCase().includes(q));
            });
            if (!loading && entries.length>0 && filtered.length===0) return <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:32,marginBottom:8}}>🔍</div><div style={{fontSize:14}}>No sessions match your search</div></div>;
            return filtered.map(e => (
              <Card key={e.id} onClick={()=>setViewEntry(e)} style={{cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Pill label={e.type} color={e.type==="Workout"?T.green:T.teal} bg={e.type==="Workout"?T.greenLight:T.tealLight}/><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{e.date}</span><span style={{fontSize:11,color:T.muted}}>· {e.duration} min</span></div>
                    {e.type==="Workout" ? (
                      <>
                        {e.techniques && <div style={{background:T.greenLight,border:`1px solid ${T.green}33`,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:10,color:T.green,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>💪 Workout</div><div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{e.techniques.slice(0,80)}{e.techniques.length>80?"...":""}</div></div>}
                        {e.notes && <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{e.notes.slice(0,80)}{e.notes.length>80?"...":""}</div>}
                      </>
                    ) : (
                      <>
                        {e.learnings && <div style={{background:T.tealLight,border:`1px solid ${T.teal}33`,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:10,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>💡 Key Learnings</div><div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{e.learnings.slice(0,120)}{e.learnings.length>120?"...":""}</div></div>}
                        {e.techniques && <div style={{fontSize:12,color:T.muted,marginBottom:2}}><span style={{color:T.text,fontWeight:600}}>Drilled: </span>{e.techniques.slice(0,80)}{e.techniques.length>80?"...":""}</div>}
                        {e.notes && <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>{e.notes.slice(0,80)}{e.notes.length>80?"...":""}</div>}
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

      {subTab==="calendar" && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <button onClick={prevMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:38,height:38,cursor:"pointer",fontSize:18,color:T.text}}>‹</button>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text}}>{monthName}</div>
            <button onClick={nextMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:38,height:38,cursor:"pointer",fontSize:18,color:T.text}}>›</button>
          </div>
          <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            {[{color:T.teal,label:"Training"},{color:T.orange,label:"Competition"},{color:T.green,label:"Today"}].map(l => (
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><div style={{width:10,height:10,borderRadius:3,background:l.color}}/>{l.label}</div>
            ))}
          </div>
          {loading ? <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div> : (
            <Card style={{padding:"12px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8}}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{textAlign:"center",fontSize:10,color:T.muted,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth}).map((_,i) => {
                  const day = i+1;
                  const {dateStr,trained,comp} = getDayData(day);
                  const isToday = dateStr===todayStr(), isSelected = selectedDay===day, hasTrain = trained.length>0;
                  return (
                    <div key={day} onClick={()=>setSelectedDay(selectedDay===day?null:day)}
                      style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:10,cursor:"pointer",background:isSelected?T.teal:isToday?T.greenLight:hasTrain?T.tealLight:comp?T.orangeLight:"transparent",border:`1.5px solid ${isSelected?T.teal:isToday?T.green:hasTrain?T.teal+"44":comp?T.orange+"44":"transparent"}`,transition:"all 0.15s"}}>
                      <span style={{fontSize:13,fontWeight:isToday?700:500,color:isSelected?"#fff":isToday?T.green:T.text}}>{day}</span>
                      <div style={{display:"flex",gap:2,marginTop:1}}>
                        {hasTrain && <div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"#fff":T.teal}}/>}
                        {comp && <div style={{width:4,height:4,borderRadius:"50%",background:isSelected?"#fff":T.orange}}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {selectedDay && selectedData && (
            <div style={{animation:"fadeUp 0.2s ease"}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,margin:"14px 0 10px"}}>{selectedData.dateStr}</div>
              {selectedData.comp && <Card style={{borderLeft:`4px solid ${T.orange}`,marginBottom:8}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:22}}>🏆</span><div><div style={{fontWeight:700,fontSize:14}}>{selectedData.comp.name||"Competition"}</div><div style={{fontSize:12,color:T.muted}}>{selectedData.comp.weight} · {selectedData.comp.gi}</div></div></div></Card>}
              {selectedData.trained.map(e => (
                <Card key={e.id} style={{borderLeft:`4px solid ${T.teal}`}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}><Pill label={e.type}/><span style={{fontSize:11,color:T.muted}}>{e.duration} min</span></div>
                  {e.learnings && <div style={{fontSize:12,color:T.text,marginTop:4}}>{e.learnings.slice(0,100)}{e.learnings.length>100?"...":""}</div>}
                </Card>
              ))}
              {selectedData.trained.length===0 && !selectedData.comp && <Btn onClick={()=>{setForm(f=>({...f,date:selectedData.dateStr}));setAdding(true);}} style={{width:"100%",padding:"12px",marginBottom:4}}>+ Log Session for This Day</Btn>}
            </div>
          )}
        </>
      )}

      {adding && (
        <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:24}}>Log Session</div>
              <button onClick={()=>{setAdding(false);setShowExtra(false);}} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{l:"Date",k:"date",t:"date"},{l:"Duration (min)",k:"duration",t:"number"}].map(f => (
                <div key={f.k}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",colorScheme:"light"}}/></div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Session Type</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Gi","No-Gi","Open Mat","Drilling","Competition","Private","Workout"].map(t => (
                  <button key={t} onClick={()=>setForm({...form,type:t})} style={{background:form.type===t?(t==="Workout"?T.green:T.teal):T.surface,color:form.type===t?"#fff":T.muted,border:`1.5px solid ${form.type===t?(t==="Workout"?T.green:T.teal):T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t}</button>
                ))}
              </div>
            </div>
            {form.type==="Workout" ? (
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
            ) : (
              <>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>💡 Key Learnings</div>
                  <textarea value={form.learnings} onChange={e=>setForm({...form,learnings:e.target.value})} rows={3} placeholder="What clicked today? Any 'aha' moments?" style={{width:"100%",background:T.tealLight,border:`1.5px solid ${T.teal}44`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
                </div>
                <button onClick={()=>setShowExtra(v=>!v)} style={{width:"100%",background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"10px",cursor:"pointer",color:T.muted,fontSize:13,fontWeight:600,marginBottom:showExtra?14:20}}>
                  {showExtra?"▲ Hide details":"▼ Add more details (techniques, notes)"}
                </button>
                {showExtra && (
                  <>
                    <div style={{marginBottom:14,position:"relative"}}>
                      <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Techniques Drilled</div>
                      <textarea value={form.techniques} onChange={e=>{setForm({...form,techniques:e.target.value});setShowSuggestions(true);}} onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),200)} rows={2} placeholder="e.g. Triangle setup, knee slice pass..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
                      {showSuggestions && form.techniques && (()=>{
                        const lastPart = (form.techniques.split(",").pop()||"").trim().toLowerCase();
                        if (!lastPart || lastPart.length<2) return null;
                        const matches = myTechNames.filter(t => t.toLowerCase().includes(lastPart) && !form.techniques.toLowerCase().includes(t.toLowerCase())).slice(0,5);
                        if (matches.length===0) return null;
                        return (
                          <div style={{position:"absolute",left:0,right:0,top:"100%",background:T.surface,border:`1.5px solid ${T.teal}`,borderRadius:10,boxShadow:T.shadow,zIndex:20,maxHeight:160,overflowY:"auto",marginTop:2}}>
                            {matches.map(m => (
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
              {saving ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/>Saving...</span> : "Save Session ✓"}
            </Btn>
          </div>
        </div>
      )}

      {subTab==="classes" && <TimetableScreen user={user} profile={profile} embedded />}

      {viewEntry && <JournalEntryModal entry={viewEntry} onClose={()=>setViewEntry(null)} onSave={updateEntry} onDelete={delEntry} confirmDel={confirmDelEntry}/>}
    </div>
  );
}
