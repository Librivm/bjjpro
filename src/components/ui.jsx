import { T } from "../theme";

export const Card = ({children, style={}, onClick}) => (
  <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px",marginBottom:10,boxShadow:T.shadow,cursor:onClick?"pointer":"default",...style}}>{children}</div>
);

export const SectionTitle = ({children, sub}) => (
  <div style={{marginBottom:18,marginTop:4}}>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:28,color:T.text,lineHeight:1.1}}>{children}</div>
    {sub && <div style={{fontSize:13,color:T.muted,marginTop:4}}>{sub}</div>}
  </div>
);

export const Pill = ({label, color=T.teal, bg=T.tealLight}) => (
  <span style={{background:bg,color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{label}</span>
);

export const StatBox = ({label, value, icon, color=T.teal, bg=T.tealLight}) => (
  <div style={{background:bg,borderRadius:14,padding:"14px 10px",flex:1,textAlign:"center",border:`1px solid ${color}22`}}>
    <div style={{fontSize:20}}>{icon}</div>
    <div style={{fontFamily:"'DM Serif Display'",fontSize:30,color,lineHeight:1,marginTop:2}}>{value}</div>
    <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginTop:3,fontWeight:600}}>{label}</div>
  </div>
);

export const Btn = ({children, onClick, variant="primary", style={}, disabled=false}) => {
  const base = {borderRadius:12,padding:"12px 20px",fontFamily:"'Plus Jakarta Sans'",fontWeight:700,fontSize:14,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.15s",opacity:disabled?0.6:1,...style};
  const v = {
    primary:{background:T.teal,color:"#fff",boxShadow:`0 2px 8px ${T.teal}44`},
    secondary:{background:T.surface,color:T.teal,border:`1.5px solid ${T.teal}`},
    ghost:{background:"none",color:T.muted,border:`1px solid ${T.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...v[variant]}}>{children}</button>;
};

export const Spinner = ({size=20, color=T.teal}) => (
  <div style={{width:size,height:size,border:`2.5px solid ${color}33`,borderTop:`2.5px solid ${color}`,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
);
