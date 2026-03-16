import { useState } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Btn, Spinner } from "../components/ui";

export default function GymJoinScreen({ user, onJoined, onSkip }) {
  const [code, setCode] = useState("");
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const lookupCode = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) { setError("Enter a 6-character code"); return; }
    setLoading(true);
    setError("");
    setGym(null);
    const { data, error: err } = await supabase.from("gyms").select("*").eq("join_code", trimmed).single();
    setLoading(false);
    if (err || !data) { setError("Invalid code — ask your coach for the gym join code"); return; }
    setGym(data);
  };

  const joinGym = async () => {
    setJoining(true);
    const updated = { id: user.id, gym_id: gym.id, role: "member" };
    const { data, error: err } = await supabase.from("profiles").upsert(updated).select("*").single();
    if (err) { setError("Something went wrong, please try again"); setJoining(false); return; }
    onJoined(data);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 100, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🥋</div>
          <div style={{ fontFamily: "'DM Serif Display'", fontSize: 28, color: T.text, marginBottom: 8 }}>Join Your Gym</div>
          <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>Enter the 6-character join code from your coach to get started.</div>
        </div>

        <div style={{ background: T.surface, borderRadius: 20, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Gym Join Code</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError(""); setGym(null); }}
              onKeyDown={e => e.key === "Enter" && lookupCode()}
              placeholder="ABC123"
              maxLength={6}
              style={{ flex: 1, background: T.cardAlt, border: `1.5px solid ${error ? "#dc2626" : T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 22, fontFamily: "'JetBrains Mono'", fontWeight: 700, outline: "none", letterSpacing: 4, textTransform: "uppercase", textAlign: "center" }}
            />
            <Btn onClick={lookupCode} disabled={loading || code.length !== 6} style={{ padding: "12px 18px", minWidth: 80 }}>
              {loading ? <Spinner size={16} color="#fff" /> : "Find →"}
            </Btn>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#dc2626" }}>{error}</div>
            </div>
          )}

          {gym && (
            <div style={{ background: T.tealLight, border: `1.5px solid ${T.teal}44`, borderRadius: 14, padding: "14px 16px", marginBottom: 16, animation: "popIn 0.3s ease" }}>
              <div style={{ fontSize: 11, color: T.teal, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Gym Found</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontSize: 20, color: T.text }}>{gym.name}</div>
            </div>
          )}

          {gym && (
            <Btn onClick={joinGym} disabled={joining} style={{ width: "100%", padding: "14px", fontSize: 15 }}>
              {joining ? <Spinner size={18} color="#fff" /> : `Join ${gym.name} →`}
            </Btn>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
          Don't have a code? Contact your coach or gym admin.
        </div>
        <button onClick={onSkip} style={{ display: "block", width: "100%", marginTop: 16, background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: "8px 0" }}>
          Skip for now — I'll join later
        </button>
      </div>
    </div>
  );
}
