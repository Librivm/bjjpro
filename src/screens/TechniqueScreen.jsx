import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { TECHNIQUES, LEVEL_COLORS, CAT_ICONS } from "../data/techniques";
import { SectionTitle, Card, Pill, Btn, Spinner } from "../components/ui";

function TechDetailModal({tech, onClose, onSave, onDelete, levelKeys, getLinkIcon}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({title:tech.title,category:tech.category,level:tech.level,url:tech.url||"",notes:tech.notes||""});
  const handleSave = () => { onSave(tech.id, form); setEditing(false); };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",maxHeight:"88vh",overflowY:"auto",animation:"slideUp 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div style={{flex:1}}>
            {editing ? <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text,background:"none",border:`1.5px solid ${T.border}`,borderRadius:8,padding:"4px 8px",width:"100%",outline:"none"}}/>
              : <div style={{fontFamily:"'DM Serif Display'",fontSize:24,color:T.text}}>{tech.title}</div>}
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              <Pill label={form.level||"—"} color={LEVEL_COLORS[form.level]?.color||T.teal} bg={LEVEL_COLORS[form.level]?.bg||T.tealLight}/>
              {form.category && <Pill label={form.category}/>}
            </div>
          </div>
          <button onClick={onClose} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted,flexShrink:0,marginLeft:10}}>✕</button>
        </div>
        {editing ? (
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
                {levelKeys.map(l => <button key={l} onClick={()=>setForm({...form,level:l})} style={{background:form.level===l?LEVEL_COLORS[l].color:T.surface,color:form.level===l?"#fff":T.muted,border:`1.5px solid ${form.level===l?LEVEL_COLORS[l].color:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{l}</button>)}
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
        ) : (
          <>
            {form.url && (
              <a href={form.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:T.orangeLight,border:`1.5px solid ${T.orange}33`,borderRadius:12,padding:"12px 14px",textDecoration:"none",marginBottom:14}}>
                <span style={{fontSize:22}}>▶️</span>
                <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>{getLinkIcon(form.url)}</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>{form.url.slice(0,50)}{form.url.length>50?"...":""}</div></div>
                <span style={{marginLeft:"auto",color:T.muted,fontSize:14}}>→</span>
              </a>
            )}
            {form.notes ? (
              <Card style={{background:T.tealLight,border:`1px solid ${T.teal}33`,marginBottom:14}}>
                <div style={{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>📝 Key Notes</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{form.notes}</div>
              </Card>
            ) : (
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

export default function TechniqueScreen({user}) {
  const [activePos, setActivePos] = useState(Object.keys(TECHNIQUES)[0]);
  const [activeLevel, setActiveLevel] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [customTab, setCustomTab] = useState("library");
  const [myTechs, setMyTechs] = useState([]);
  const [myCategories, setMyCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingTech, setAddingTech] = useState(false);
  const [techForm, setTechForm] = useState({title:"",category:"",level:"Fundamentals",url:"",notes:""});
  const [techLoading, setTechLoading] = useState(false);
  const [viewTech, setViewTech] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => {
    supabase.from("custom_techniques").select("*").eq("user_id", user.id).order("created_at", {ascending:false})
      .then(({data}) => {
        if (data) {
          setMyTechs(data);
          setMyCategories([...new Set(data.map(t => t.category).filter(Boolean))]);
        }
      });
  }, [user.id]);

  const addFromLibrary = async (techName, category, level) => {
    const already = myTechs.find(t => t.title === techName);
    if (already) {
      if (confirmRemove === techName) {
        const {error} = await supabase.from("custom_techniques").delete().eq("id", already.id);
        if (!error) setMyTechs(p => p.filter(t => t.id !== already.id));
        setConfirmRemove(null);
      } else {
        setConfirmRemove(techName);
        setTimeout(() => setConfirmRemove(null), 3000);
      }
      return;
    }
    setConfirmRemove(null);
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent("BJJ "+techName+" tutorial")}`;
    const row = {user_id:user.id, title:techName, category, level, url:ytUrl, notes:""};
    const {data} = await supabase.from("custom_techniques").insert(row).select().single();
    if (data) {
      setMyTechs(p => [data, ...p]);
      setMyCategories(prev => [...new Set([...prev, category])]);
    }
  };

  const saveNewTech = async () => {
    if (!techForm.title.trim()) return;
    setTechLoading(true);
    const {data, error} = await supabase.from("custom_techniques").insert({user_id:user.id, ...techForm}).select().single();
    if (error) { console.error("Failed to save technique:", error.message); setTechLoading(false); return; }
    if (data) {
      setMyTechs(p => [data, ...p]);
      if (techForm.category && !myCategories.includes(techForm.category))
        setMyCategories(p => [...p, techForm.category]);
    }
    setAddingTech(false); setTechForm({title:"",category:"",level:"Fundamentals",url:"",notes:""}); setTechLoading(false);
  };

  const saveEditTech = async (id, updated) => {
    const {error} = await supabase.from("custom_techniques").update(updated).eq("id", id);
    if (error) { console.error("Failed to update technique:", error.message); return; }
    setMyTechs(p => {
      const next = p.map(t => t.id === id ? {...t, ...updated} : t);
      setMyCategories([...new Set(next.map(t => t.category).filter(Boolean))]);
      return next;
    });
    setViewTech(t => ({...t, ...updated}));
  };

  const delTech = async (id) => {
    const {error} = await supabase.from("custom_techniques").delete().eq("id", id);
    if (error) { console.error("Failed to delete technique:", error.message); return; }
    const remaining = myTechs.filter(t => t.id !== id);
    setMyTechs(remaining);
    setMyCategories([...new Set(remaining.map(t => t.category).filter(Boolean))]);
    setViewTech(null);
  };

  const addCategory = () => {
    const n = newCatName.trim();
    if (n && !myCategories.includes(n)) setMyCategories(p => [...p, n]);
    setNewCatName(""); setAddingCat(false);
  };

  const getLinkIcon = (url="") => {
    if (url.includes("youtube") || url.includes("youtu.be")) return "▶️ YouTube";
    if (url.includes("instagram")) return "📸 Instagram";
    return "🔗 Link";
  };

  const levelKeys = ["Fundamentals","Intermediate","Advanced"];
  const techsForPos = TECHNIQUES[activePos] || {};
  const filteredTechs = activeLevel === "All"
    ? levelKeys.flatMap(l => (techsForPos[l]||[]).map(t => ({tech:t, level:l})))
    : (techsForPos[activeLevel]||[]).map(t => ({tech:t, level:activeLevel}));
  const catTechs = selectedCat ? myTechs.filter(t => t.category === selectedCat) : [];
  const channels = [
    {name:"Chewjitsu",url:"https://www.youtube.com/@Chewjitsu",tag:"All levels"},
    {name:"Bernardo Faria BJJ",url:"https://www.youtube.com/@BernardoFariaBJJ",tag:"Competition"},
    {name:"Knight Jiu-Jitsu",url:"https://www.youtube.com/@KnightJiuJitsu",tag:"Beginner"},
    {name:"John Danaher",url:"https://www.youtube.com/results?search_query=John+Danaher+BJJ+tutorial",tag:"Systems"},
    {name:"Gordon Ryan",url:"https://www.youtube.com/results?search_query=Gordon+Ryan+BJJ+technique",tag:"Advanced"},
  ];

  return (
    <div style={{padding:"0 16px",animation:"fadeUp 0.4s ease"}}>
      <SectionTitle sub="Browse techniques & build your personal library">Technique Library</SectionTitle>

      <div style={{display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        {[["library","📚 Library"],["custom","⭐ My Library"]].map(([t,l]) => (
          <button key={t} onClick={()=>{setCustomTab(t);setSelectedCat(null);}} style={{flex:1,padding:"9px 0",background:customTab===t?T.teal:"none",color:customTab===t?"#fff":T.muted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {customTab==="library" && (
        <>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:10,scrollbarWidth:"none"}}>
            {Object.keys(TECHNIQUES).map(p => (
              <button key={p} onClick={()=>{setActivePos(p);setExpanded(null);}} style={{background:activePos===p?T.teal:T.surface,color:activePos===p?"#fff":T.muted,border:`1.5px solid ${activePos===p?T.teal:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontWeight:700}}>{p}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {["All",...levelKeys].map(l => {
              const lc = l==="All" ? {color:T.teal,bg:T.tealLight} : LEVEL_COLORS[l];
              const isActive = activeLevel === l;
              return <button key={l} onClick={()=>setActiveLevel(l)} style={{background:isActive?(l==="All"?T.teal:lc.color):"none",color:isActive?"#fff":lc?.color||T.muted,border:`1.5px solid ${lc?.color||T.teal}`,borderRadius:20,padding:"5px 13px",fontSize:11,cursor:"pointer",fontWeight:700,transition:"all 0.15s"}}>{l}</button>;
            })}
          </div>
          {filteredTechs.map(({tech,level}) => {
            const inMyLib = myTechs.some(t => t.title === tech);
            return (
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
                    <button onClick={e=>{e.stopPropagation();addFromLibrary(tech,activePos,level);}}
                      title={inMyLib?confirmRemove===tech?"Tap again to remove":"Remove from My Library":"Add to My Library"}
                      style={{background:confirmRemove===tech?"#fee2e2":inMyLib?T.orangeLight:"none",border:`1.5px solid ${confirmRemove===tech?"#fca5a5":inMyLib?T.orange:T.border}`,borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:12,color:confirmRemove===tech?"#dc2626":inMyLib?T.orange:T.muted,fontWeight:700,transition:"all 0.15s"}}>
                      {confirmRemove===tech?"Remove?":inMyLib?"★ Saved":"☆ Save"}
                    </button>
                    <span style={{color:T.muted,fontSize:13}}>{expanded===tech?"▲":"▼"}</span>
                  </div>
                </div>
                {expanded===tech && (
                  <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.teal}33`,animation:"fadeUp 0.2s ease"}}>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent("BJJ "+tech+" tutorial")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:10,background:"#fee2e244",border:"1.5px solid #fca5a544",borderRadius:12,padding:"12px 14px",textDecoration:"none",marginBottom:12}}>
                      <span style={{fontSize:26}}>▶️</span>
                      <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>Search "{tech}" on YouTube</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>Opens YouTube · BJJ tutorials</div></div>
                      <span style={{marginLeft:"auto",color:T.muted,fontSize:14}}>→</span>
                    </a>
                    <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>🎓 Recommended Channels</div>
                    {channels.map(ch => (
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

      {customTab==="custom" && (
        <>
          {selectedCat ? (
            <>
              <button onClick={()=>setSelectedCat(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.teal,fontWeight:700,fontSize:13,marginBottom:14}}>← Back to categories</button>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:T.text,marginBottom:4}}>{selectedCat}</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:14}}>{catTechs.length} technique{catTechs.length!==1?"s":""} saved</div>
              <Btn onClick={()=>{setTechForm(f=>({...f,category:selectedCat}));setAddingTech(true);}} style={{width:"100%",padding:"12px",fontSize:14,marginBottom:14}}>+ Add Technique to {selectedCat}</Btn>
              {catTechs.length===0 && <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}><div style={{fontSize:36,marginBottom:8}}>📭</div><div style={{fontSize:14}}>No techniques yet — add one above</div></div>}
              {catTechs.map(ct => (
                <Card key={ct.id} onClick={()=>setViewTech(ct)} style={{cursor:"pointer",borderLeft:`4px solid ${LEVEL_COLORS[ct.level]?.color||T.teal}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:4}}>{ct.title}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <Pill label={ct.level||"—"} color={LEVEL_COLORS[ct.level]?.color||T.teal} bg={LEVEL_COLORS[ct.level]?.bg||T.tealLight}/>
                        {ct.url && <Pill label={getLinkIcon(ct.url)} color={T.orange} bg={T.orangeLight}/>}
                      </div>
                      {ct.notes && <div style={{fontSize:12,color:T.muted,marginTop:6,fontStyle:"italic",lineHeight:1.5}}>{ct.notes.slice(0,80)}{ct.notes.length>80?"...":""}</div>}
                    </div>
                    <span style={{color:T.muted,fontSize:13}}>→</span>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              {myTechs.length > 0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>🕐 Recently Added</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
                    {myTechs.slice(0,3).map(ct => (
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
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                {myCategories.map(cat => {
                  const count = myTechs.filter(t => t.category === cat).length;
                  const icon = CAT_ICONS[cat] || "📂";
                  return (
                    <button key={cat} onClick={()=>setSelectedCat(cat)} style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",boxShadow:T.shadow}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.background=T.tealLight;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                      <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                      <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:2}}>{cat}</div>
                      <div style={{fontSize:11,color:T.muted}}>{count} technique{count!==1?"s":""}</div>
                    </button>
                  );
                })}
                <button onClick={()=>setAddingCat(true)} style={{background:"none",border:`1.5px dashed ${T.border}`,borderRadius:14,padding:"16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}>
                  <div style={{fontSize:28,marginBottom:8}}>➕</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.muted}}>New Category</div>
                </button>
              </div>
              {myCategories.length===0 && !addingCat && (
                <div style={{textAlign:"center",color:T.muted,padding:"30px 0"}}>
                  <div style={{fontSize:40,marginBottom:10}}>📚</div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:T.text,marginBottom:4}}>Your library is empty</div>
                  <div style={{fontSize:13,marginBottom:16}}>Save techniques from the Library tab, or create your own categories</div>
                </div>
              )}
              {addingCat && (
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

      {addingTech && (
        <div style={{position:"fixed",inset:0,background:"rgba(30,45,64,0.5)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:22}}>Add Technique</div>
              <button onClick={()=>setAddingTech(false)} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.muted}}>✕</button>
            </div>
            {[{l:"Technique Name *",k:"title",ph:"e.g. Berimbolo, Outside Heel Hook..."},{l:"Category",k:"category",ph:"e.g. Open Guard, Leg Locks..."},{l:"Video / Link URL",k:"url",ph:"https://youtube.com/..."}].map(f => (
              <div key={f.k} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>{f.l}</div>
                <input value={techForm[f.k]} onChange={e=>setTechForm({...techForm,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Level</div>
              <div style={{display:"flex",gap:6}}>
                {levelKeys.map(l => <button key={l} onClick={()=>setTechForm({...techForm,level:l})} style={{background:techForm.level===l?LEVEL_COLORS[l].color:T.surface,color:techForm.level===l?"#fff":T.muted,border:`1.5px solid ${techForm.level===l?LEVEL_COLORS[l].color:T.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>{l}</button>)}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Key Notes</div>
              <textarea value={techForm.notes} onChange={e=>setTechForm({...techForm,notes:e.target.value})} rows={3} placeholder="Key details, cues, when to use, common mistakes..."
                style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none"}}/>
            </div>
            <Btn onClick={saveNewTech} disabled={techLoading||!techForm.title} style={{width:"100%",padding:"14px",fontSize:15}}>
              {techLoading ? <Spinner size={16} color="#fff"/> : "Save Technique ✓"}
            </Btn>
          </div>
        </div>
      )}

      {viewTech && (
        <TechDetailModal tech={viewTech} onClose={()=>setViewTech(null)} onSave={saveEditTech} onDelete={delTech} levelKeys={levelKeys} getLinkIcon={getLinkIcon}/>
      )}
    </div>
  );
}
