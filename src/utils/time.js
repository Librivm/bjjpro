export const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
export const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
export const dayName = d => new Date(d).toLocaleDateString("en", {weekday:"short"});
export const isDatePast = (dateStr) => { if(!dateStr) return false; return new Date(dateStr+"T23:59:59") < new Date(); };

const localDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export const getWeekKey = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  const dow = d.getDay();
  const diffToMon = (dow === 0 ? -6 : 1 - dow);
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  return localDateStr(mon);
};

export const calcStreak = (entryList, goal) => {
  if (!goal || goal <= 0) return 0;
  const weekCounts = {};
  entryList.forEach(e => { const wk = getWeekKey(e.date); weekCounts[wk] = (weekCounts[wk]||0)+1; });
  const thisWeekKey = getWeekKey(todayStr());
  let s = 0;
  let cursor = new Date(thisWeekKey + "T12:00:00");
  for (let i = 0; i < 200; i++) {
    const key = localDateStr(cursor);
    if (weekCounts[key] && weekCounts[key] >= goal) { s++; cursor.setDate(cursor.getDate()-7); }
    else if (key === thisWeekKey) { cursor.setDate(cursor.getDate()-7); continue; }
    else break;
  }
  return s;
};
