export const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
export const todayStr = () => new Date().toISOString().split("T")[0];
export const dayName = d => new Date(d).toLocaleDateString("en", {weekday:"short"});
export const isDatePast = (dateStr) => { if(!dateStr) return false; return new Date(dateStr+"T23:59:59") < new Date(); };
