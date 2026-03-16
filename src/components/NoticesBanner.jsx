import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Card, Btn, Spinner } from "./ui";

function NoticesAdmin({ user, profile, onNoticeCreated }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.from("notices").select("*").eq("gym_id", profile.gym_id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setNotices(data); setLoading(false); });
  }, [profile.gym_id]);

  const createNotice = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("notices").insert({ gym_id: profile.gym_id, created_by: user.id, title: title.trim(), body: body.trim() || null }).select().single();
    if (!error && data) {
      setNotices(prev => [data, ...prev]);
      onNoticeCreated(data);
      setTitle(""); setBody(""); setOpen(false);
    }
    setSaving(false);
  };

  const toggleActive = async (notice) => {
    const { data } = await supabase.from("notices").update({ is_active: !notice.is_active }).eq("id", notice.id).select().single();
    if (data) setNotices(prev => prev.map(n => n.id === notice.id ? data : n));
  };

  const deleteNotice = async (noticeId) => {
    await supabase.from("notices").delete().eq("id", noticeId);
    setNotices(prev => prev.filter(n => n.id !== noticeId));
  };

  return (
    <Card style={{ border: `1.5px solid ${T.teal}33`, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 14 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>📣 Manage Notices</div>
        <Btn onClick={() => setOpen(o => !o)} variant="secondary" style={{ padding: "6px 12px", fontSize: 12 }}>{open ? "Close" : "+ New"}</Btn>
      </div>

      {open && (
        <div style={{ animation: "fadeUp 0.2s ease" }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Title</div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Gym closed this Saturday" maxLength={100}
            style={{ width: "100%", background: T.cardAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", color: T.text, fontSize: 14, outline: "none", marginBottom: 10 }} />
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Message (optional)</div>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add more detail..." rows={2} maxLength={300}
            style={{ width: "100%", background: T.cardAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", color: T.text, fontSize: 13, outline: "none", resize: "none", marginBottom: 12 }} />
          <Btn onClick={createNotice} disabled={saving || !title.trim()} style={{ width: "100%", padding: "11px" }}>
            {saving ? <Spinner size={16} color="#fff" /> : "Post Notice →"}
          </Btn>
        </div>
      )}

      {loading ? <div style={{ padding: "12px 0", display: "flex", justifyContent: "center" }}><Spinner size={20} /></div> : (
        <div style={{ marginTop: open ? 16 : 12 }}>
          {notices.length === 0 && <div style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "8px 0" }}>No notices yet</div>}
          {notices.map(n => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: n.is_active ? T.text : T.muted }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 12, color: T.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: 10, flexShrink: 0 }}>
                <button onClick={() => toggleActive(n)} style={{ background: n.is_active ? T.greenLight : T.cardAlt, border: `1px solid ${n.is_active ? T.green : T.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: n.is_active ? T.green : T.muted, cursor: "pointer" }}>
                  {n.is_active ? "Active" : "Off"}
                </button>
                <button onClick={() => deleteNotice(n.id)} style={{ background: "#fef2f2", border: "1px solid #fca5a533", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, color: "#dc2626", cursor: "pointer" }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function NoticesBanner({ user, profile }) {
  const [notices, setNotices] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const isStaff = profile?.role === "coach" || profile?.role === "admin";

  useEffect(() => {
    if (!profile?.gym_id) return;
    Promise.all([
      supabase.from("notices").select("*").eq("gym_id", profile.gym_id).eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("notice_dismissals").select("notice_id").eq("user_id", user.id),
    ]).then(([{ data: n }, { data: d }]) => {
      if (n) setNotices(n);
      if (d) setDismissed(new Set(d.map(r => r.notice_id)));
    });
  }, [profile?.gym_id, user.id]);

  const dismiss = async (noticeId) => {
    setDismissed(prev => new Set([...prev, noticeId]));
    await supabase.from("notice_dismissals").insert({ user_id: user.id, notice_id: noticeId });
  };

  const handleNoticeCreated = (notice) => {
    setNotices(prev => [notice, ...prev]);
  };

  const visible = notices.filter(n => !dismissed.has(n.id));

  return (
    <div>
      {visible.map(n => (
        <div key={n.id} style={{ background: T.surface, borderLeft: `4px solid ${T.orange}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", boxShadow: `0 2px 10px ${T.orange}22`, animation: "fadeUp 0.3s ease" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: n.body ? 3 : 0 }}>📣 {n.title}</div>
            {n.body && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{n.body}</div>}
          </div>
          <button onClick={() => dismiss(n.id)} style={{ marginLeft: 12, flexShrink: 0, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted, lineHeight: 1, padding: "2px 4px" }}>✕</button>
        </div>
      ))}
      {isStaff && <NoticesAdmin user={user} profile={profile} onNoticeCreated={handleNoticeCreated} />}
    </div>
  );
}
