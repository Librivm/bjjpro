import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { CORE_POSITIONS, MENTAL_FIELDS } from "../data/gamePlan";
import { IBJJF_ILLEGAL_MOVES, BELT_LEVEL_MAP } from "../data/ibjjfRules";
import { todayStr, isDatePast } from "../utils/time";
import { SectionTitle, Card, Pill, Btn, Spinner } from "../components/ui";

function FlowSection({posId, side, color, d, allPositions, saveFlowField}) {
  const sideData = d || {};
  const fields = [
    {pKey:"p1",lKey:"p1leads",label:"① Primary",ph:"Your main attack / technique from this position..."},
    {pKey:"p2",lKey:"p2leads",label:"② Backup",ph:"If primary is shut down or defended..."},
    {pKey:"p3",lKey:"p3leads",label:"③ If that fails",ph:"Last resort, reset or survival plan..."},
  ];
  return (
    <div>
      {fields.map(({pKey,lKey,label},i) => (
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
              {allPositions.filter(p => p.id!==posId).map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
          </div>
          {i < 2 && <div style={{textAlign:"center",fontSize:11,color:T.subtle,margin:"4px 0"}}>↓ if blocked</div>}
        </div>
      ))}
    </div>
  );
}

export default function CompScreen({user}) {
  const [tab, setTab] = useState("gameplan");
  const [flowData, setFlowData] = useState({});
  const [customPositions, setCustomPositions] = useState([]);
  const [gpLoading, setGpLoading] = useState(true);
  const [openPos, setOpenPos] = useState("standing");
  const [openSide, setOpenSide] = useState("attack");
  const [flowView, setFlowView] = useState("build");
  const [flowChainType, setFlowChainType] = useState("attack");
  const [addingCustomPos, setAddingCustomPos] = useState(false);
  const [customPosName, setCustomPosName] = useState("");
  const [customPosSides, setCustomPosSides] = useState({attack:true,defence:true});
  const [myComps, setMyComps] = useState([]);
  const [compsLoading, setCompsLoading] = useState(true);
  const [addComp, setAddComp] = useState(false);
  const [compForm, setCompForm] = useState({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  const [eventsLoading, setEventsLoading] = useState(false);
  const [aiEvents, setAiEvents] = useState([]);
  const [eventsError, setEventsError] = useState("");
  const [ibjjfBelt, setIbjjfBelt] = useState("White / Blue");
  const [ibjjfSearch, setIbjjfSearch] = useState("");
  const [savingEvent, setSavingEvent] = useState(null);
  const [confirmDelComp, setConfirmDelComp] = useState(null);
  const [userLocation, setUserLocation] = useState("");
  const [locationLoaded, setLocationLoaded] = useState(false);
  const saveTimer = useRef({});

  const allPositions = [...CORE_POSITIONS, ...customPositions];

  useEffect(() => {
    supabase.from("game_plan").select("*").eq("user_id",user.id).then(({data}) => {
      if (data) {
        const g = {};
        data.forEach(r => {
          if (r.position_key==="__custom_positions__") {
            try { setCustomPositions(JSON.parse(r.value)||[]); } catch(e) {}
          } else {
            try { g[r.position_key] = JSON.parse(r.value); } catch(e) { g[r.position_key] = {}; }
          }
        });
        setFlowData(g);
      }
      setGpLoading(false);
    });
    supabase.from("competitions").select("*").eq("user_id",user.id).order("date",{ascending:true}).then(({data}) => {
      if (data) setMyComps(data); setCompsLoading(false);
    });
    supabase.from("profiles").select("location").eq("id",user.id).single().then(({data}) => {
      if (data?.location) setUserLocation(data.location);
      setLocationLoaded(true);
    });
    return () => { Object.values(saveTimer.current).forEach(clearTimeout); };
  }, [user.id]);

  const saveFlowField = (posId, side, field, val) => {
    setFlowData(prev => {
      const updated = {...prev,[posId]:{...prev[posId],[side]:{...(prev[posId]?.[side]||{}),[field]:val}}};
      clearTimeout(saveTimer.current[`${posId}_${side}`]);
      saveTimer.current[`${posId}_${side}`] = setTimeout(async () => {
        await supabase.from("game_plan").upsert({user_id:user.id,position_key:posId,value:JSON.stringify(updated[posId]),updated_at:new Date().toISOString()},{onConflict:"user_id,position_key"});
      }, 800);
      return updated;
    });
  };

  const saveCustomPositions = (positions) => {
    setCustomPositions(positions);
    supabase.from("game_plan").upsert({user_id:user.id,position_key:"__custom_positions__",value:JSON.stringify(positions),updated_at:new Date().toISOString()},{onConflict:"user_id,position_key"});
  };

  const addCustomPosition = () => {
    const n = customPosName.trim();
    if (!n) return;
    const newPos = {id:`custom_${Date.now()}`,label:n,icon:"📌",color:"#64748b",sides:{attack:customPosSides.attack,defence:customPosSides.defence}};
    saveCustomPositions([...customPositions, newPos]);
    setCustomPosName(""); setAddingCustomPos(false); setCustomPosSides({attack:true,defence:true});
  };

  const buildChain = (side) => {
    const chain = [], visited = new Set();
    const startPos = allPositions.find(p => flowData[p.id]?.[side]?.p1?.trim());
    if (!startPos) return [];
    let current = (flowData["standing"]?.[side]?.p1?.trim()) ? "standing" : startPos.id;
    while (current && !visited.has(current)) {
      const pos = allPositions.find(p => p.id===current);
      const d = flowData[current]?.[side] || {};
      if (!pos || !d.p1?.trim()) break;
      chain.push({pos,d}); visited.add(current);
      const nextId = d.p1leads?.trim();
      current = nextId ? allPositions.find(p => p.id===nextId)?.id : null;
    }
    return chain;
  };

  const filledCount = allPositions.filter(p => {
    const d = flowData[p.id] || {};
    return d.attack?.p1?.trim() || d.defence?.p1?.trim() || d.mental;
  }).length;
  const pct = allPositions.length>0 ? Math.round((filledCount/allPositions.length)*100) : 0;

  const saveComp = async () => {
    const {data,error} = await supabase.from("competitions").insert({user_id:user.id,...compForm}).select().single();
    if (error) { console.error("Failed to save competition:", error.message); return; }
    if (data) setMyComps(c => [...c,data].sort((a,b) => new Date(a.date)-new Date(b.date)));
    setAddComp(false); setCompForm({name:"",date:"",weight:"",gi:"Gi",goal:"",notes:""});
  };

  const delComp = async (id) => {
    if (confirmDelComp !== id) { setConfirmDelComp(id); setTimeout(() => setConfirmDelComp(null), 3000); return; }
    const {error} = await supabase.from("competitions").delete().eq("id",id);
    if (error) { console.error("Failed to delete competition:", error.message); return; }
    setMyComps(c => c.filter(x => x.id!==id)); setConfirmDelComp(null);
  };

  const addAiEventToMyEvents = async (ev, idx) => {
    setSavingEvent(idx);
    const row = {user_id:user.id,name:ev.name,date:ev.date||"",weight:"",gi:"Gi",goal:"",notes:ev.location?`${ev.location}${ev.organiser?" · "+ev.organiser:""}`:"",};
    const {data,error} = await supabase.from("competitions").insert(row).select().single();
    if (error) { setSavingEvent(null); return; }
    if (data) setMyComps(c => [...c,data].sort((a,b) => new Date(a.date)-new Date(b.date)));
    setSavingEvent(null);
  };

  const fetchAiEvents = async () => {
    if (!userLocation.trim()) { setEventsError("Set your location in your profile (Home → Edit Profile) to search for events."); return; }
    setEventsLoading(true); setEventsError(""); setAiEvents([]);
    const futureYear = new Date().getFullYear();
    const loc = userLocation.trim();
    try {
      const {data:{session}} = await supabase.auth.getSession();
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for UPCOMING (future dates only, after today ${todayStr()}) BJJ and Brazilian Jiu-Jitsu competitions, tournaments and open mats in and around ${loc} in ${futureYear} and ${futureYear+1}. Only include events that have NOT yet happened. Return ONLY a valid JSON array with no markdown, no explanation. Each object: { "name": string, "date": "YYYY-MM-DD or null", "location": string, "organiser": string, "url": string or null }. Maximum 8 events. If no future events found, return [].`}]})});
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const text = (data.content||[]).map(b => b.type==="text"?b.text:"").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const start = clean.indexOf("["), end = clean.lastIndexOf("]");
      if (start!==-1 && end!==-1) {
        let parsed; try { parsed = JSON.parse(clean.slice(start,end+1)); } catch(parseErr) { setEventsError("Couldn't parse event data. Try again."); setEventsLoading(false); return; }
        if (!Array.isArray(parsed)) { setEventsError("Unexpected response format."); setEventsLoading(false); return; }
        const future = parsed.filter(ev => ev && typeof ev==="object" && (!ev.date || !isDatePast(ev.date)));
        setAiEvents(future);
        if (future.length===0) setEventsError("No upcoming events found right now. Check the links below.");
      } else { setEventsError("No structured events found. Use the links below to find events."); }
    } catch(e) { setEventsError("Search unavailable. Use the links below to find events."); }
    setEventsLoading(false);
  };

  const levelKey = BELT_LEVEL_MAP[ibjjfBelt];
  const filteredMoves = IBJJF_ILLEGAL_MOVES.filter(m => m.levels.includes(levelKey) && (!ibjjfSearch || m.move.toLowerCase().includes(ibjjfSearch.toLowerCase())));

  return (
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Plan, prepare, and compete with confidence">Competition Prep</SectionTitle>
      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["gameplan","🗺 Game Plan"],["comps","🏆 Events"],["rules","📋 Rules"]].map(([t,l]) => (
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",background:tab===t?T.teal:"none",color:tab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {tab==="gameplan" && (
        <div>
          {gpLoading ? <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}><Spinner size={32}/></div> : (
            <>
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

              <div style={{display:"flex",background:T.surface,borderRadius:10,padding:3,marginBottom:14,border:`1px solid ${T.border}`}}>
                {[["build","🔧 Build"],["flow","⚡ A-Game Flow"]].map(([v,l]) => (
                  <button key={v} onClick={()=>setFlowView(v)} style={{flex:1,padding:"8px 0",background:flowView===v?"#1e2d40":"none",color:flowView===v?"#fff":T.muted,border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
                ))}
              </div>

              {flowView==="build" && (
                <>
                  {allPositions.map(pos => {
                    const d = flowData[pos.id] || {};
                    const isOpen = openPos === pos.id;
                    const isCustom = customPositions.some(p => p.id===pos.id);
                    const hasSides = isCustom ? {attack:pos.sides?.attack!==false,defence:pos.sides?.defence!==false} : {attack:true,defence:true};
                    const atkFilled = [d.attack?.p1,d.attack?.p2,d.attack?.p3].filter(v=>v?.trim()).length;
                    const defFilled = [d.defence?.p1,d.defence?.p2,d.defence?.p3].filter(v=>v?.trim()).length;
                    const totalFilled = atkFilled + defFilled;
                    return (
                      <div key={pos.id} style={{marginBottom:8}}>
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
                            <div style={{display:"flex",gap:3}}>
                              {[0,1,2].map(i => <div key={`a${i}`} style={{width:6,height:6,borderRadius:"50%",background:d.attack?.[`p${i+1}`]?.trim()?(isOpen?"rgba(255,255,255,0.9)":T.orange):(isOpen?"rgba(255,255,255,0.25)":T.border)}}/>)}
                            </div>
                            <div style={{width:1,height:14,background:isOpen?"rgba(255,255,255,0.3)":T.border}}/>
                            <div style={{display:"flex",gap:3}}>
                              {[0,1,2].map(i => <div key={`d${i}`} style={{width:6,height:6,borderRadius:"50%",background:d.defence?.[`p${i+1}`]?.trim()?(isOpen?"rgba(255,255,255,0.9)":T.teal):(isOpen?"rgba(255,255,255,0.25)":T.border)}}/>)}
                            </div>
                            {isCustom && (
                              <button onClick={e=>{e.stopPropagation();saveCustomPositions(customPositions.filter(p=>p.id!==pos.id));}}
                                style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:11,color:isOpen?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                            )}
                            <span style={{color:isOpen?"#fff":T.muted,fontSize:13}}>{isOpen?"▲":"▼"}</span>
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{background:T.cardAlt,border:`1.5px solid ${pos.color}33`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"0 0 12px",animation:"fadeUp 0.2s ease"}}>
                            <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
                              {[
                                ...(hasSides.attack?[["attack","⚔️ Attack",T.orange]]:[]),
                                ...(hasSides.defence?[["defence","🛡️ Defence",T.teal]]:[]),
                                ...(!pos.id.startsWith("custom_")&&pos.id==="mental"?[["mental","📋 Mental",T.muted]]:[]),
                              ].map(([s,l,c]) => (
                                <button key={s} onClick={()=>setOpenSide(s)}
                                  style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2.5px solid ${openSide===s?c:"transparent"}`,color:openSide===s?c:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
                              ))}
                              {["attack","defence"].includes(openSide) && (
                                <button key="mental_tab" onClick={()=>setOpenSide("mental")}
                                  style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2.5px solid ${openSide==="mental"?"#8b5cf6":"transparent"}`,color:openSide==="mental"?"#8b5cf6":T.muted,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>📋 Notes</button>
                              )}
                            </div>
                            <div style={{padding:"0 14px"}}>
                              {openSide==="attack" && hasSides.attack && <FlowSection posId={pos.id} side="attack" color={T.orange} d={d.attack} allPositions={allPositions} saveFlowField={saveFlowField}/>}
                              {openSide==="defence" && hasSides.defence && <FlowSection posId={pos.id} side="defence" color={T.teal} d={d.defence} allPositions={allPositions} saveFlowField={saveFlowField}/>}
                              {openSide==="mental" && (
                                <div>
                                  {MENTAL_FIELDS.map(f => (
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
                  {addingCustomPos ? (
                    <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight,marginTop:4}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.teal,marginBottom:8}}>New Position Name</div>
                      <input value={customPosName} onChange={e=>setCustomPosName(e.target.value)} placeholder="e.g. 50/50, Rubber Guard, Crucifix..." autoFocus
                        onKeyDown={e=>{if(e.key==="Enter")addCustomPosition();if(e.key==="Escape")setAddingCustomPos(false);}}
                        style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",marginBottom:10}}/>
                      <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Include sections</div>
                      <div style={{display:"flex",gap:8,marginBottom:14}}>
                        {[["attack","⚔️ Attack"],["defence","🛡️ Defence"]].map(([s,l]) => (
                          <button key={s} onClick={()=>setCustomPosSides(p=>({...p,[s]:!p[s]}))}
                            style={{flex:1,padding:"8px",background:customPosSides[s]?T.teal:T.surface,color:customPosSides[s]?"#fff":T.muted,border:`1.5px solid ${customPosSides[s]?T.teal:T.border}`,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <Btn onClick={addCustomPosition} disabled={!customPosName.trim()} style={{flex:1,padding:"10px"}}>Add Position</Btn>
                        <Btn onClick={()=>{setAddingCustomPos(false);setCustomPosName("");}} variant="ghost" style={{flex:1,padding:"10px"}}>Cancel</Btn>
                      </div>
                    </Card>
                  ) : (
                    <button onClick={()=>setAddingCustomPos(true)} style={{width:"100%",background:"none",border:`1.5px dashed ${T.border}`,borderRadius:12,padding:"14px",cursor:"pointer",color:T.muted,fontSize:13,fontWeight:700,marginTop:4,transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.color=T.teal;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
                      + Add Custom Position
                    </button>
                  )}
                </>
              )}

              {flowView==="flow" && (
                <>
                  <div style={{display:"flex",background:T.surface,borderRadius:10,padding:3,marginBottom:14,border:`1px solid ${T.border}`}}>
                    {[["attack","⚔️ Offensive Flow",T.orange],["defence","🛡️ Defensive Flow",T.teal]].map(([v,l,c]) => (
                      <button key={v} onClick={()=>setFlowChainType(v)} style={{flex:1,padding:"8px 0",background:flowChainType===v?c:"none",color:flowChainType===v?"#fff":T.muted,border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
                    ))}
                  </div>
                  {(()=>{
                    const chain = buildChain(flowChainType);
                    const c = flowChainType==="attack" ? T.orange : T.teal;
                    if (chain.length===0) return (
                      <div style={{textAlign:"center",color:T.muted,padding:"40px 0"}}>
                        <div style={{fontSize:48,marginBottom:12}}>⚡</div>
                        <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:6}}>No flow yet</div>
                        <div style={{fontSize:13,lineHeight:1.6,padding:"0 20px"}}>Fill in your positions in the Build tab and connect them using the "→ leads to" dropdowns to generate your flow.</div>
                      </div>
                    );
                    return (
                      <>
                        <Card style={{background:"#0d1b2a",border:"none",marginBottom:14,padding:"12px 16px"}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{flowChainType==="attack"?"⚔️ Offensive":"🛡️ Defensive"} A-Game Flow</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{chain.length} positions connected</div>
                        </Card>
                        {chain.map(({pos,d},i) => (
                          <div key={pos.id}>
                            <div style={{background:T.surface,border:`2px solid ${pos.color}`,borderRadius:14,padding:"14px 16px",boxShadow:`0 2px 12px ${pos.color}22`}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                                <div style={{width:34,height:34,borderRadius:10,background:pos.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{pos.icon}</div>
                                <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text}}>{pos.label}</div>
                              </div>
                              {[{pKey:"p1",lKey:"p1leads",label:"①"},{pKey:"p2",lKey:"p2leads",label:"②"},{pKey:"p3",lKey:"p3leads",label:"③"}].filter(f=>d[f.pKey]?.trim()).map((f,j,arr) => {
                                const nextPos = d[f.lKey] ? allPositions.find(p => p.id===d[f.lKey]) : null;
                                return (
                                  <div key={f.pKey}>
                                    <div style={{display:"flex",gap:10,alignItems:"flex-start",background:j===0?`${c}15`:T.cardAlt,borderRadius:10,padding:"10px 12px",marginBottom:4}}>
                                      <span style={{fontFamily:"'JetBrains Mono'",fontWeight:700,fontSize:13,color:j===0?c:T.muted,flexShrink:0,marginTop:1}}>{f.label}</span>
                                      <div style={{flex:1}}>
                                        <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{d[f.pKey]}</div>
                                        {nextPos && <div style={{fontSize:11,color:c,fontWeight:700,marginTop:4}}>→ {nextPos.icon} {nextPos.label}</div>}
                                      </div>
                                    </div>
                                    {j<arr.length-1 && <div style={{fontSize:11,color:T.subtle,marginLeft:12,marginBottom:4}}>↓ if blocked</div>}
                                  </div>
                                );
                              })}
                            </div>
                            {i<chain.length-1 && (
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0"}}>
                                <div style={{width:2,height:10,background:`${chain[i+1].pos.color}66`}}/>
                                <div style={{fontSize:16,color:chain[i+1].pos.color,lineHeight:1}}>▼</div>
                                <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginTop:1}}>leads to</div>
                              </div>
                            )}
                          </div>
                        ))}
                        {(()=>{
                          const inChain = new Set(chain.map(c=>c.pos.id));
                          const unconnected = allPositions.filter(p => !inChain.has(p.id) && flowData[p.id]?.[flowChainType]?.p1?.trim());
                          if (unconnected.length===0) return null;
                          return (
                            <div style={{marginTop:14}}>
                              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Other Positions (not in main flow)</div>
                              {unconnected.map(pos => {
                                const d = flowData[pos.id]?.[flowChainType] || {};
                                return (
                                  <div key={pos.id} style={{background:T.surface,border:`1.5px solid ${pos.color}44`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16}}>{pos.icon}</span><div style={{fontWeight:700,fontSize:14,color:T.text}}>{pos.label}</div></div>
                                    {["p1","p2","p3"].filter(k=>d[k]?.trim()).map((k,j) => (
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

      {tab==="comps" && (
        <div>
          <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:10}}>My Events</div>
          <Btn onClick={()=>setAddComp(true)} style={{width:"100%",padding:"12px",fontSize:14,marginBottom:12}}>+ Add Event Manually</Btn>
          {addComp && (
            <Card style={{border:`1.5px solid ${T.teal}`,background:T.tealLight,marginBottom:12}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:14}}>New Competition</div>
              {[{l:"Competition Name",k:"name",t:"text"},{l:"Date",k:"date",t:"date"},{l:"Weight Class",k:"weight",t:"text"},{l:"Your Goal",k:"goal",t:"text"}].map(f => (
                <div key={f.k} style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div><input type={f.t} value={compForm[f.k]} onChange={e=>setCompForm({...compForm,[f.k]:e.target.value})} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",colorScheme:"light"}}/></div>
              ))}
              <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Division</div><div style={{display:"flex",gap:6}}>{["Gi","No-Gi","Both"].map(g => <button key={g} onClick={()=>setCompForm({...compForm,gi:g})} style={{background:compForm.gi===g?T.teal:T.surface,color:compForm.gi===g?"#fff":T.muted,border:`1.5px solid ${compForm.gi===g?T.teal:T.border}`,borderRadius:8,padding:"7px 18px",fontSize:12,cursor:"pointer",fontWeight:700}}>{g}</button>)}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Prep Notes</div><textarea value={compForm.notes} onChange={e=>setCompForm({...compForm,notes:e.target.value})} rows={2} placeholder="Opponent info, areas to focus on, travel details..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/></div>
              <div style={{display:"flex",gap:8}}><Btn onClick={saveComp} style={{flex:1,padding:"12px"}}>Save</Btn><Btn onClick={()=>setAddComp(false)} variant="ghost" style={{flex:1,padding:"12px"}}>Cancel</Btn></div>
            </Card>
          )}
          {compsLoading && <div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><Spinner size={28}/></div>}
          {!compsLoading && myComps.length===0 && !addComp && (
            <div style={{textAlign:"center",color:T.muted,padding:"20px 0",marginBottom:14}}>
              <div style={{fontSize:36,marginBottom:8}}>🏆</div>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:4}}>No events saved yet</div>
              <div style={{fontSize:12}}>Search for events below or add one manually</div>
            </div>
          )}
          {myComps.map(c => {
            const daysUntil = Math.ceil((new Date(c.date)-new Date())/86400000);
            return (
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
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16,marginTop:8}}>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:10}}>Find Upcoming Events</div>
            <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,color:T.teal,marginBottom:4}}>🔍 AI Event Search{userLocation?` — ${userLocation}`:""}</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{userLocation?"Searches for future competitions in your area. Results may vary.":"Set your location in your profile to search for nearby events."}</div>
              <Btn onClick={fetchAiEvents} disabled={eventsLoading||!userLocation.trim()} style={{width:"100%",padding:"11px",fontSize:13}}>
                {eventsLoading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={14} color="#fff"/>Searching...</span>:"Search Upcoming Events"}
              </Btn>
              {eventsError && <div style={{fontSize:12,color:T.orange,marginTop:8}}>{eventsError}</div>}
              {aiEvents.length>0 && (
                <div style={{marginTop:10}}>
                  {aiEvents.map((ev,i) => {
                    const alreadySaved = myComps.some(c => c.name===ev.name);
                    return (
                      <div key={i} style={{background:T.surface,borderRadius:10,padding:"12px",marginBottom:8,border:`1px solid ${T.border}`}}>
                        <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{ev.name}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          {ev.date&&<Pill label={ev.date}/>}
                          {ev.location&&<Pill label={ev.location} color={T.orange} bg={T.orangeLight}/>}
                          {ev.organiser&&<Pill label={ev.organiser} color={T.green} bg={T.greenLight}/>}
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          {ev.url&&<a href={ev.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.teal,fontWeight:700,textDecoration:"underline"}}>More info →</a>}
                          {alreadySaved ? (
                            <span style={{fontSize:11,color:T.green,fontWeight:700}}>✓ Saved to My Events</span>
                          ) : (
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
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.teal}22`}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>NZ BJJ Resources</div>
                {[{label:"NZ BJJ Federation",url:"https://www.nzbjjf.co.nz/"},{label:"Stealth Grappling — Event Calendar",url:"https://stealthgrappling.com/pages/event-calendar"},{label:"NZ Grappler — Comp Registrations",url:"https://nzgrappler.com/comp-registrations/"}].map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`,textDecoration:"none"}}>
                    <span style={{fontSize:12,color:T.text,fontWeight:600}}>{l.label}</span><span style={{color:T.teal,fontSize:12}}>→</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab==="rules" && (
        <div>
          <Card style={{background:T.tealLight,border:`1.5px solid ${T.teal}33`,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:T.teal,marginBottom:4}}>📋 IBJJF Illegal Moves</div>
            <div style={{fontSize:12,color:T.muted}}>Filter by your division to see which techniques are banned</div>
          </Card>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>My Division</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.keys(BELT_LEVEL_MAP).map(b => <button key={b} onClick={()=>setIbjjfBelt(b)} style={{background:ibjjfBelt===b?T.teal:T.surface,color:ibjjfBelt===b?"#fff":T.muted,border:`1.5px solid ${ibjjfBelt===b?T.teal:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700}}>{b}</button>)}</div></div>
          <div style={{marginBottom:14}}><input value={ibjjfSearch} onChange={e=>setIbjjfSearch(e.target.value)} placeholder="Search moves..." style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none"}}/></div>
          <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{filteredMoves.length} illegal move{filteredMoves.length!==1?"s":""} for {ibjjfBelt}</div>
          {filteredMoves.map(m => (
            <Card key={m.id} style={{borderLeft:"4px solid #dc2626",padding:"12px 14px",marginBottom:6}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{background:"#fee2e2",color:"#dc2626",borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono'",flexShrink:0}}>#{m.id}</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{m.move}</div>
              </div>
            </Card>
          ))}
          {filteredMoves.length===0 && <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:36,marginBottom:8}}>✅</div><div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:T.text,marginBottom:4}}>No illegal moves found</div><div style={{fontSize:13}}>All techniques are allowed for this division</div></div>}
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
