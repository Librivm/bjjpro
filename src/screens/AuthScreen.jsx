import { useState } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Card, Btn, Spinner } from "../components/ui";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handle = async () => {
    setError(""); setMessage(""); setLoading(true);
    if (mode === "signup") {
      const {error:e} = await supabase.auth.signUp({email, password});
      if (e) setError(e.message); else setMessage("Check your email to confirm your account!");
    } else {
      const {error:e} = await supabase.auth.signInWithPassword({email, password});
      if (e) setError(e.message);
    }
    setLoading(false);
  };

  return (
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
          {error && <div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:14}}>{error}</div>}
          {message && <div style={{background:T.greenLight,border:`1px solid ${T.green}44`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.green,marginBottom:14}}>{message}</div>}
          <Btn onClick={handle} disabled={loading||!email||!password} style={{width:"100%",padding:"14px",fontSize:15}}>
            {loading ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={16} color="#fff"/>{mode==="signin"?"Signing in...":"Creating..."}</span> : mode==="signin"?"Sign In →":"Create Account →"}
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
