export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--openmat-bg,#f5f0eb);color:var(--openmat-text,#1e2d40);font-family:'Plus Jakarta Sans',sans-serif;overscroll-behavior:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#ede8e3;}
::-webkit-scrollbar-thumb{background:#3d7a96;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes popIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;}
.fullscreen-timer{position:fixed;inset:0;z-index:999;background:#0d1b2a;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.fullscreen-timer .fs-time{font-family:'DM Serif Display';font-size:22vw;color:#fff;line-height:1;letter-spacing:-2px;}
.fullscreen-timer .fs-label{font-family:'JetBrains Mono';font-size:4vw;letter-spacing:4px;text-transform:uppercase;margin-top:2vw;}
@media(orientation:portrait){.fullscreen-timer .fs-time{font-size:28vw;}.fullscreen-timer .fs-label{font-size:5vw;}}
`;

export const LIGHT = {
  bg:"#f5f0eb", surface:"#ffffff", card:"#ffffff", cardAlt:"#faf7f4",
  border:"#e4ddd6", teal:"#3d7a96", tealLight:"#eaf3f7",
  orange:"#e07b39", orangeLight:"#fdf1e8", green:"#3a7d5e", greenLight:"#eaf5ef",
  text:"#1e2d40", muted:"#7a8a96", subtle:"#d4cdc6",
  shadow:"0 2px 12px rgba(30,45,64,0.08)",
};

export const DARK = {
  bg:"#0d1b2a", surface:"#1b2838", card:"#1b2838", cardAlt:"#162232",
  border:"#2a3a4a", teal:"#4da3c4", tealLight:"#1a2e3d",
  orange:"#e8944e", orangeLight:"#2a2218", green:"#4daa7a", greenLight:"#1a2e24",
  text:"#e8e3dc", muted:"#8a9aaa", subtle:"#3a4a5a",
  shadow:"0 2px 12px rgba(0,0,0,0.3)",
};

export let T = {...LIGHT};
export const setTheme = (dark) => { Object.assign(T, dark ? DARK : LIGHT); };
