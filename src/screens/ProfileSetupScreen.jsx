import { useState } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { BELT_COLORS, BELT_TEXT } from "../data/ibjjfRules";
import { Btn, Spinner } from "../components/ui";

export default function ProfileSetupScreen({ user, onComplete }) {
  const [name, setName] = useState("");
  const [belt, setBelt] = useState("White");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from("profiles")
      .upsert({ id: user.id, name: name.trim(), belt, updated_at: new Date().toISOString() })
      .select("*").single();
    if (data) onComplete(data);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🥋</div>
          <div style={{ fontFamily: "'DM Serif Display'", fontSize: 28, color: T.text, marginBottom: 8 }}>Welcome to Openmat!</div>
          <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>Quick setup — takes 10 seconds.</div>
        </div>

        <div style={{ background: T.surface, borderRadius: 20, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Your Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()}
            placeholder="e.g. Mike, Sarah..."
            autoFocus
            style={{ width: "100%", background: T.cardAlt, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 16, outline: "none", marginBottom: 20 }}
          />

          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Belt Rank</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
            {Object.keys(BELT_COLORS).map(b => (
              <button key={b} onClick={() => setBelt(b)}
                style={{ background: belt === b ? BELT_COLORS[b] : "none", color: belt === b ? BELT_TEXT[b] : T.muted, border: `2px solid ${BELT_COLORS[b]}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700, transition: "all 0.15s" }}>
                {b}
              </button>
            ))}
          </div>

          <Btn onClick={save} disabled={saving || !name.trim()} style={{ width: "100%", padding: "14px", fontSize: 15 }}>
            {saving ? <Spinner size={18} color="#fff" /> : "Get Started →"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
