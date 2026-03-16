import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { T, LIGHT, DARK, setTheme, GLOBAL_CSS } from "./theme";
import { Spinner } from "./components/ui";
import AuthScreen from "./screens/AuthScreen";
import TimerScreen from "./screens/TimerScreen";
import TechniqueScreen from "./screens/TechniqueScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import CompScreen from "./screens/CompScreen";
import HomeScreen, { TutorialOverlay } from "./screens/HomeScreen";
import GymJoinScreen from "./screens/GymJoinScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";

export default function OpenmatApp() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined); // undefined = loading, null/obj = loaded
  const [skippedGymJoin, setSkippedGymJoin] = useState(false);
  const [tab, setTab] = useState("home");
  const [showTutorial, setShowTutorial] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("openmat_dark_mode");
    const isDark = saved === "1";
    setTheme(isDark);
    if (typeof document !== "undefined") document.body.style.background = isDark ? DARK.bg : LIGHT.bg;
    return isDark;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      setTheme(next);
      localStorage.setItem("openmat_dark_mode", next ? "1" : "0");
      document.body.style.background = next ? DARK.bg : LIGHT.bg;
      return next;
    });
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data || {});
  };

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !localStorage.getItem("openmat_tutorial_done")) setShowTutorial(true);
      if (session) fetchProfile(session.user.id);
      else setProfile(undefined);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(undefined);
    });
    return () => subscription.unsubscribe();
  }, []);

  const completeTutorial = () => { localStorage.setItem("openmat_tutorial_done", "1"); setShowTutorial(false); };
  const replayTutorial = () => setShowTutorial(true);
  const signOut = async () => { await supabase.auth.signOut(); setTab("home"); setProfile(undefined); };

  if (session === undefined || (session && profile === undefined)) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <Spinner size={40} /><div style={{ fontFamily: "'DM Serif Display'", fontSize: 20, color: T.muted }}>Loading Openmat...</div>
    </div>
  );
  if (!session) return <AuthScreen />;

  // Profile setup gate — new users who haven't set their name yet
  if (profile !== undefined && profile !== null && !profile?.name) {
    return <ProfileSetupScreen user={session.user} onComplete={setProfile} />;
  }

  // Gym join gate — profile loaded but not yet joined a gym (skippable)
  if (!skippedGymJoin && profile !== undefined && !profile?.gym_id) {
    return <GymJoinScreen user={session.user} onJoined={setProfile} onSkip={() => setSkippedGymJoin(true)} />;
  }

  const tabs = [
    { id: "home",       icon: "⊞",  label: "Home" },
    { id: "timer",      icon: "⏱",  label: "Timer" },
    { id: "techniques", icon: "📚", label: "Learn" },
    { id: "schedule",   icon: "🗓",  label: "Schedule" },
    { id: "comp",       icon: "🏆", label: "Compete" },
  ];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "12px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(30,45,64,0.07)" }}>
        <div style={{ fontFamily: "'DM Serif Display'", fontSize: 22, color: T.text }}>Open<span style={{ color: T.teal }}>mat</span></div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 16, paddingBottom: 80 }}>
        {tab === "home"       && <HomeScreen user={session.user} profile={profile} setTab={setTab} onSignOut={signOut} onReplayTutorial={replayTutorial} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onProfileUpdate={setProfile} />}
        {tab === "timer"      && <TimerScreen />}
        {tab === "techniques" && <TechniqueScreen user={session.user} />}
        {tab === "schedule"   && <ScheduleScreen user={session.user} profile={profile} />}
        {tab === "comp"       && <CompScreen user={session.user} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 50, boxShadow: "0 -2px 12px rgba(30,45,64,0.08)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 0 10px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, borderTop: tab === t.id ? `2.5px solid ${T.teal}` : "2.5px solid transparent" }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 7, color: tab === t.id ? T.teal : T.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
      {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
    </div>
  );
}
