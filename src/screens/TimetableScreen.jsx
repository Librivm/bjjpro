import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { todayStr } from "../utils/time";
import { SectionTitle, Card, Btn, Spinner } from "../components/ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayDow = new Date().getDay();

function fmtTimePretty(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 || 12;
  return `${h12}:${m}${ampm}`;
}

function EntryForm({ gymId, userId, entry, onSave, onClose }) {
  const isEdit = !!entry;
  const [title, setTitle] = useState(entry?.title || "");
  const [recurring, setRecurring] = useState(entry ? entry.day_of_week !== null : true);
  const [dow, setDow] = useState(entry?.day_of_week ?? todayDow);
  const [eventDate, setEventDate] = useState(entry?.event_date || todayStr());
  const [startTime, setStartTime] = useState(entry?.start_time?.slice(0, 5) || "18:00");
  const [endTime, setEndTime] = useState(entry?.end_time?.slice(0, 5) || "19:30");
  const [instructor, setInstructor] = useState(entry?.instructor || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const row = {
      gym_id: gymId,
      title: title.trim(),
      start_time: startTime,
      end_time: endTime || null,
      instructor: instructor.trim() || null,
      description: description.trim() || null,
      day_of_week: recurring ? dow : null,
      event_date: recurring ? null : eventDate,
    };
    let result;
    if (isEdit) {
      result = await supabase.from("timetable").update(row).eq("id", entry.id).select().single();
    } else {
      result = await supabase.from("timetable").insert(row).select().single();
    }
    setSaving(false);
    if (!result.error && result.data) onSave(result.data, isEdit);
  };

  const inputStyle = { width: "100%", background: T.cardAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", color: T.text, fontSize: 13, outline: "none" };
  const labelStyle = { fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5, marginTop: 12, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(13,27,42,0.6)", animation: "fadeUp 0.2s ease" }}>
      <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", padding: "20px 20px 32px", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Serif Display'", fontSize: 20, color: T.text }}>{isEdit ? "Edit Class" : "Add Class"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: T.muted, cursor: "pointer" }}>✕</button>
        </div>

        <span style={labelStyle}>Class Title</span>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. No-Gi Fundamentals" style={inputStyle} />

        <span style={labelStyle}>Type</span>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          {[{ label: "Recurring (weekly)", value: true }, { label: "One-off event", value: false }].map(opt => (
            <button key={String(opt.value)} onClick={() => setRecurring(opt.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${recurring === opt.value ? T.teal : T.border}`, background: recurring === opt.value ? T.tealLight : T.cardAlt, color: recurring === opt.value ? T.teal : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {opt.label}
            </button>
          ))}
        </div>

        {recurring ? (
          <>
            <span style={labelStyle}>Day of Week</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS.map((d, i) => (
                <button key={i} onClick={() => setDow(i)} style={{ padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${dow === i ? T.teal : T.border}`, background: dow === i ? T.teal : T.cardAlt, color: dow === i ? "#fff" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{d}</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <span style={labelStyle}>Date</span>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
          </>
        )}

        <span style={labelStyle}>Time</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <span style={{ color: T.muted, fontSize: 13 }}>to</span>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>

        <span style={labelStyle}>Instructor (optional)</span>
        <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="e.g. Coach Mike" style={inputStyle} />

        <span style={labelStyle}>Description (optional)</span>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What to expect, who it's for..." rows={2} style={{ ...inputStyle, resize: "none" }} />

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Btn onClick={save} disabled={saving || !title.trim()} style={{ flex: 1, padding: "13px" }}>
            {saving ? <Spinner size={16} color="#fff" /> : isEdit ? "Save Changes" : "Add Class →"}
          </Btn>
          <Btn onClick={onClose} variant="ghost" style={{ padding: "13px 18px" }}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

export default function TimetableScreen({ user, profile, embedded = false }) {
  const [subTab, setSubTab] = useState("week");
  const [weekly, setWeekly] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [mySchedule, setMySchedule] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);
  const isStaff = profile?.role === "coach" || profile?.role === "admin";

  useEffect(() => {
    if (!profile?.gym_id) return;
    Promise.all([
      supabase.from("timetable").select("*").eq("gym_id", profile.gym_id).not("day_of_week", "is", null).eq("is_active", true).order("day_of_week").order("start_time"),
      supabase.from("timetable").select("*").eq("gym_id", profile.gym_id).is("day_of_week", null).gte("event_date", todayStr()).eq("is_active", true).order("event_date").order("start_time"),
      supabase.from("user_schedule").select("timetable_id").eq("user_id", user.id),
    ]).then(([{ data: w }, { data: e }, { data: s }]) => {
      if (w) setWeekly(w);
      if (e) setEvents(e);
      if (s) setMySchedule(new Set(s.map(r => r.timetable_id)));
      setLoading(false);
    });
  }, [profile?.gym_id, user.id]);

  const toggleSchedule = async (entryId) => {
    setTogglingId(entryId);
    if (mySchedule.has(entryId)) {
      setMySchedule(prev => { const n = new Set(prev); n.delete(entryId); return n; });
      await supabase.from("user_schedule").delete().eq("user_id", user.id).eq("timetable_id", entryId);
    } else {
      setMySchedule(prev => new Set([...prev, entryId]));
      await supabase.from("user_schedule").insert({ user_id: user.id, timetable_id: entryId });
    }
    setTogglingId(null);
  };

  const handleSave = (row, isEdit) => {
    if (row.day_of_week !== null) {
      if (isEdit) setWeekly(prev => prev.map(r => r.id === row.id ? row : r).sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
      else setWeekly(prev => [...prev, row].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
    } else {
      if (isEdit) setEvents(prev => prev.map(r => r.id === row.id ? row : r).sort((a, b) => a.event_date.localeCompare(b.event_date)));
      else setEvents(prev => [...prev, row].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    }
    setShowForm(false);
    setEditEntry(null);
  };

  const softDelete = async (entry) => {
    await supabase.from("timetable").update({ is_active: false }).eq("id", entry.id);
    if (entry.day_of_week !== null) setWeekly(prev => prev.filter(r => r.id !== entry.id));
    else setEvents(prev => prev.filter(r => r.id !== entry.id));
  };

  const ClassCard = ({ entry }) => {
    const inSchedule = mySchedule.has(entry.id);
    const toggling = togglingId === entry.id;
    return (
      <div style={{ background: T.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, borderLeft: `4px solid ${inSchedule ? "#8b5cf6" : T.teal}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{entry.title}</div>
            <div style={{ fontSize: 12, color: T.teal, fontFamily: "'JetBrains Mono'", marginTop: 2 }}>
              {fmtTimePretty(entry.start_time)}{entry.end_time ? ` – ${fmtTimePretty(entry.end_time)}` : ""}
            </div>
            {entry.instructor && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>👤 {entry.instructor}</div>}
            {entry.description && <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{entry.description}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 10, alignItems: "flex-end" }}>
            <button onClick={() => toggleSchedule(entry.id)} disabled={toggling}
              style={{ background: inSchedule ? "#ede9fe" : T.cardAlt, border: `1px solid ${inSchedule ? "#8b5cf6" : T.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: inSchedule ? "#8b5cf6" : T.muted, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
              {toggling ? "..." : inSchedule ? "✓ My Schedule" : "+ My Schedule"}
            </button>
            {isStaff && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditEntry(entry); setShowForm(true); }} style={{ background: T.tealLight, border: `1px solid ${T.teal}33`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: T.teal, cursor: "pointer", fontWeight: 700 }}>Edit</button>
                <button onClick={() => softDelete(entry)} style={{ background: "#fef2f2", border: "1px solid #fca5a533", borderRadius: 6, padding: "4px 8px", fontSize: 11, color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>Del</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const weekByDay = DAYS.reduce((acc, _, i) => { acc[i] = weekly.filter(e => e.day_of_week === i); return acc; }, {});

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {!embedded && <SectionTitle sub="Weekly schedule & special events">Classes</SectionTitle>}

      {/* Sub-tab toggle */}
      <div style={{ display: "flex", background: T.cardAlt, borderRadius: 12, padding: 4, marginBottom: 16, border: `1px solid ${T.border}` }}>
        {[{ id: "week", label: "Weekly Schedule" }, { id: "events", label: "Special Events" }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: subTab === t.id ? T.surface : "transparent", color: subTab === t.id ? T.teal : T.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", boxShadow: subTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}><Spinner size={32} /></div>
      ) : subTab === "week" ? (
        <>
          {DAYS.map((_, i) => {
            const dayIndex = (i + 1) % 7; // Start from Monday (1), wrap to Sunday (0)
            const classes = weekByDay[dayIndex] || [];
            const isToday = dayIndex === todayDow;
            if (classes.length === 0 && !isToday) return null;
            return (
              <div key={dayIndex} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontFamily: "'DM Serif Display'", fontSize: 16, color: isToday ? T.teal : T.text }}>{DAY_FULL[dayIndex]}</div>
                  {isToday && <span style={{ background: T.teal, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Today</span>}
                </div>
                {classes.length === 0 ? (
                  <div style={{ fontSize: 13, color: T.muted, padding: "8px 14px", background: T.cardAlt, borderRadius: 10 }}>No classes scheduled</div>
                ) : (
                  classes.map(entry => <ClassCard key={entry.id} entry={entry} />)
                )}
              </div>
            );
          })}
          {weekly.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontSize: 20, color: T.text, marginBottom: 6 }}>No classes yet</div>
              <div style={{ fontSize: 13, color: T.muted }}>{isStaff ? "Add your first class below." : "Ask your coach to set up the class schedule."}</div>
            </div>
          )}
        </>
      ) : (
        <>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontSize: 20, color: T.text, marginBottom: 6 }}>No upcoming events</div>
              <div style={{ fontSize: 13, color: T.muted }}>{isStaff ? "Add a special event below." : "Check back later for seminars and special events."}</div>
            </div>
          ) : (
            events.map(entry => (
              <div key={entry.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: T.orangeLight, color: T.orange, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>
                    {new Date(entry.event_date + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </div>
                <ClassCard entry={entry} />
              </div>
            ))
          )}
        </>
      )}

      {isStaff && (
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          <Btn onClick={() => { setEditEntry(null); setShowForm(true); }} style={{ width: "100%", padding: "13px" }}>+ Add Class or Event</Btn>
        </div>
      )}

      {showForm && (
        <EntryForm
          gymId={profile.gym_id}
          userId={user.id}
          entry={editEntry}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditEntry(null); }}
        />
      )}
    </div>
  );
}
