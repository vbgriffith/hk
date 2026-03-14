/*!
 * phantom-devtools.js  v3.0.0
 * Full-featured drop-in DevTools. No build step, no npm, no imports.
 * Usage: <script src="phantom-devtools.js"></script>
 *        <script>PhantomDevTools.init();</script>
 * Options: position('bottom'|'right'), height, width, theme('dark'|'light'), open, intercept
 * API: .open() .close() .toggle() .clear() .destroy()
 * Keys: Alt+D toggle, Ctrl+F search DOM
 */
(function(root){'use strict';
if(root.PhantomDevTools)return;

/* ── CSS ─────────────────────────────────────────────────── */
var CSS=["@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap');",
"*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
":host{--bg0:#17171b;--bg1:#1e1e23;--bg2:#25252c;--bg3:#2c2c35;--bg4:#33333e;--bgh:#3a3a47;",
"--bd:#3c3c4a;--bdh:#4e4e60;--t0:#eaeaf2;--t1:#b4b4c8;--t2:#82829a;--t3:#50505f;",
"--acc:#0088ff;--acc2:#00c8d4;--grn:#57c47a;--tag:#e3694e;--attr:#6db4d4;",
"--val:#a5c261;--num:#d19a66;--bool:#c678dd;--fn:#e5c07b;",
"--wbg:#282200;--wfg:#e8c56a;--wbd:#4a3c00;--ebg:#281010;--efg:#f47070;--ebd:#4a1818;",
"--ibg:#001828;--ifg:#6ab4d6;--ibd:#003050;--sbg:#18395c;",
"--mbg:rgba(255,200,0,.14);--mbd:rgba(255,200,0,.75);",
"--r:3px;--mono:'JetBrains Mono','Fira Code',monospace;--ui:'IBM Plex Sans',system-ui,sans-serif;",
"all:initial;display:block;position:fixed;z-index:2147483647;font-family:var(--ui);font-size:13px;color:var(--t0)}",
":host(.light){--bg0:#f9f9fb;--bg1:#fff;--bg2:#f1f1f5;--bg3:#e8e8ee;--bg4:#dddde8;--bgh:#d4d4e0;",
"--bd:#d0d0dc;--bdh:#b0b0c8;--t0:#1a1a2e;--t1:#3a3a5c;--t2:#60608a;--t3:#a0a0c0;",
"--tag:#c0440e;--attr:#1060a0;--val:#2a7a10;--num:#8a4800;--bool:#7a28cc;--fn:#8a6000;",
"--wbg:#fff8e0;--wfg:#7a5c00;--wbd:#e8d070;--ebg:#fff0f0;--efg:#c02020;--ebd:#f0a0a0;",
"--ibg:#e8f4ff;--ifg:#0060b0;--ibd:#90c8f0;--sbg:#e0eeff;",
"--mbg:rgba(200,160,0,.15);--mbd:rgba(180,140,0,.7)}",
"#fab{position:fixed;bottom:12px;right:14px;width:38px;height:38px;background:var(--bg1);border:1px solid var(--bdh);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2147483647;transition:background .15s,border-color .15s,transform .15s;box-shadow:0 2px 10px rgba(0,0,0,.5)}",
"#fab:hover{background:var(--bg4);border-color:var(--acc);transform:scale(1.07)}#fab.haserr{border-color:var(--efg)}#fab svg{width:17px;height:17px}",
"#pip{position:absolute;top:-2px;right:-2px;background:var(--efg);color:#fff;border-radius:8px;font-size:9px;font-family:var(--mono);padding:1px 4px;min-width:14px;text-align:center;display:none}",
"#panel{position:fixed;background:var(--bg0);border-top:2px solid var(--acc);display:grid;grid-template-rows:34px 1fr;overflow:hidden;transition:transform .2s cubic-bezier(.22,1,.36,1),opacity .15s;font-family:var(--ui)}",
"#panel.pbot{left:0;right:0;bottom:0;box-shadow:0 -4px 24px rgba(0,0,0,.55)}",
"#panel.prgt{top:0;right:0;bottom:0;border-top:none;border-left:2px solid var(--acc);box-shadow:-4px 0 24px rgba(0,0,0,.55)}",
"#panel.hide{transform:translateY(100%);opacity:0;pointer-events:none}#panel.prgt.hide{transform:translateX(100%)}",
"#rh{position:absolute;background:transparent;z-index:10;transition:background .1s}#rh:hover{background:rgba(0,136,255,.3)}",
"#panel.pbot #rh{top:0;left:0;right:0;height:4px;cursor:ns-resize}#panel.prgt #rh{top:0;left:0;bottom:0;width:4px;cursor:ew-resize}",
"#tabs{display:flex;align-items:stretch;background:var(--bg1);border-bottom:1px solid var(--bd);padding:0 4px;overflow-x:auto;scrollbar-width:none;flex-shrink:0}",
"#tabs::-webkit-scrollbar{display:none}",
".tab{font-family:var(--ui);font-size:11px;color:var(--t2);background:transparent;border:none;border-bottom:2px solid transparent;padding:0 10px;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;transition:color .1s;margin-bottom:-1px;flex-shrink:0}",
".tab:hover{color:var(--t0)}.tab.on{color:var(--t0);border-bottom-color:var(--acc);background:var(--bg0)}",
".tbg{background:var(--ebg);color:var(--efg);border-radius:8px;font-size:9px;font-family:var(--mono);padding:1px 5px;min-width:16px;text-align:center;display:none}",
".tbg.w{background:var(--wbg);color:var(--wfg)}.tbg.i{background:var(--ibg);color:var(--ifg)}",
"#tr{margin-left:auto;display:flex;align-items:center;gap:3px;padding-right:4px;flex-shrink:0}",
".ib{background:transparent;border:1px solid transparent;border-radius:var(--r);color:var(--t2);cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 6px;display:flex;align-items:center;gap:3px;transition:all .1s;white-space:nowrap}",
".ib:hover{background:var(--bg4);color:var(--t0);border-color:var(--bd)}.ib.on{background:rgba(0,136,255,.15);color:var(--acc);border-color:rgba(0,136,255,.35)}",
".ib svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round}",
"#panels{overflow:hidden;display:flex;flex-direction:column;flex:1}",
".pan{display:none;flex:1;overflow:hidden;flex-direction:column}.pan.on{display:flex}",
".phdr{font-family:var(--ui);font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--t2);padding:5px 10px 4px;border-bottom:1px solid var(--bd);background:var(--bg2);flex-shrink:0}",
".mut{color:var(--t2);padding:10px;font-size:11px}",
"#selbar{background:var(--bg2);border-bottom:1px solid var(--bd);padding:4px 8px;display:flex;gap:5px;align-items:center;flex-shrink:0}",
"#csi{flex:1;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 6px;outline:none;transition:border-color .15s}",
"#csi:focus{border-color:var(--acc)}#csi.ok{border-color:var(--val)}#csi.bad{border-color:var(--efg);color:var(--efg)}",
"#sct{font-family:var(--mono);font-size:11px;color:var(--t2);white-space:nowrap;min-width:60px}",
"#dsb{background:var(--bg3);border-bottom:1px solid var(--bd);padding:3px 8px;display:none;align-items:center;gap:5px;flex-shrink:0}#dsb.vis{display:flex}",
"#dsi{flex:1;background:var(--bg2);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 6px;outline:none}",
"#dsi:focus{border-color:var(--acc)}#dsc{font-size:10px;color:var(--t2);font-family:var(--mono);white-space:nowrap}",
".snv{background:transparent;border:1px solid var(--bd);border-radius:var(--r);color:var(--t1);cursor:pointer;font-size:10px;padding:2px 6px}.snv:hover{background:var(--bg4)}",
"#ibdy{display:grid;grid-template-columns:1fr 3px 260px;flex:1;overflow:hidden}",
"#dp{overflow:auto;padding:4px 0;scrollbar-width:thin;scrollbar-color:var(--bd) transparent;font-family:var(--mono);font-size:12px;line-height:1.65}",
"#idv{background:var(--bd);cursor:col-resize;transition:background .1s}#idv:hover{background:var(--acc)}",
"#ss{display:flex;flex-direction:column;overflow:hidden}",
"#ist{display:flex;background:var(--bg1);border-bottom:1px solid var(--bd);flex-shrink:0}",
".stb{font-size:10px;color:var(--t2);background:transparent;border:none;border-bottom:2px solid transparent;padding:4px 10px;cursor:pointer;transition:color .1s;font-family:var(--ui);margin-bottom:-1px}",
".stb:hover{color:var(--t0)}.stb.on{color:var(--t0);border-bottom-color:var(--acc)}",
".sp2{display:none;flex:1;flex-direction:column;overflow:hidden;min-height:0}.sp2.on{display:flex}",
"#cmp{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}",
"#sr{flex:1;min-height:0;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".srow{display:flex;gap:5px;padding:2px 10px;font-family:var(--mono);font-size:11px;line-height:1.7;border-bottom:1px solid rgba(255,255,255,.025);transition:background .06s;align-items:baseline}",
".srow:hover{background:var(--bgh)}.srow:hover .sdl{opacity:1}",
".sprp{color:var(--attr);flex-shrink:0;min-width:120px;cursor:text}",
".sval{color:var(--val);word-break:break-all;cursor:text;flex:1;outline:none;border-radius:2px}",
".sval:focus{outline:1px solid var(--acc);background:var(--bg3);padding:0 2px}",
".sval.sw::before{content:'';display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid rgba(255,255,255,.18);background:var(--_sw)}",
".sval.inv{color:var(--efg);text-decoration:underline wavy var(--efg)}",
".sdl{opacity:0;color:var(--t3);cursor:pointer;font-size:13px;line-height:1;padding:0 2px;flex-shrink:0;transition:color .1s,opacity .1s;background:none;border:none;font-family:inherit}",
".sdl:hover{color:var(--efg)}",
"#arr{display:flex;align-items:center;gap:5px;padding:5px 8px;border-top:1px solid var(--bd);background:var(--bg1);flex-shrink:0}",
"#arpp,#arv{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 5px;outline:none;transition:border-color .15s}",
"#arpp{width:100px}#arpp:focus,#arv:focus{border-color:var(--acc)}#arv{flex:1}",
"#arb{background:var(--acc);border:none;border-radius:var(--r);color:#fff;cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 8px;font-weight:500;flex-shrink:0;transition:background .1s}",
"#arb:hover{background:#006ee0}",
"#sfi{background:var(--bg3);border:1px dashed var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 6px;outline:none;transition:border-color .15s;width:100%}",
"#sfi:focus{border-color:var(--acc)}",
"#rlp{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".rlb{border-bottom:1px solid rgba(255,255,255,.05);padding:6px 10px}",
".rls{color:var(--acc2);font-family:var(--mono);font-size:11px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:baseline}",
".rlsrc{color:var(--t3);font-size:10px}",
".rld{font-family:var(--mono);font-size:11px;padding:1px 0 1px 12px;color:var(--t1)}",
".rldp{color:var(--attr)}.rldv{color:var(--val)}",
"#evp{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".evt{font-family:var(--mono);font-size:11px;color:var(--fn);padding:5px 10px 2px;border-bottom:1px solid var(--bd);font-weight:600;background:var(--bg2)}",
".evi{padding:3px 10px 3px 20px;font-family:var(--mono);font-size:11px;color:var(--t1);border-bottom:1px solid rgba(255,255,255,.03);cursor:pointer;transition:background .05s}",
".evi:hover{background:var(--bgh)}.evlc{color:var(--acc);font-size:10px}",
"#a1p{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent;padding:8px}",
".a1r{display:flex;gap:8px;padding:3px 0;font-family:var(--mono);font-size:11px;border-bottom:1px solid rgba(255,255,255,.03)}",
".a1k{color:var(--attr);min-width:110px;flex-shrink:0}.a1v{color:var(--t0)}",
"#bmp{flex-shrink:0;overflow:hidden}",
"#bmh{display:flex;align-items:center;cursor:pointer}#bmh:hover{background:var(--bg3)}",
".bx{border:1px solid;position:relative;display:flex;align-items:center;justify-content:center}",
".bxm{border-color:#9e7b52;background:rgba(158,123,82,.1);color:#c9a87a;padding:10px}",
".bxb{border-color:#6b8e6b;background:rgba(107,142,107,.1);color:#8ab88a;padding:10px}",
".bxp{border-color:#5b8a9e;background:rgba(91,138,158,.1);color:#7ab4d0;padding:10px}",
".bxc{border-color:var(--acc);background:rgba(0,136,255,.08);color:var(--acc);padding:8px;min-height:34px}",
".bxv{font-family:var(--mono);font-size:10px;position:absolute}",
".bxt{top:2px;left:50%;transform:translateX(-50%)}.bxr{right:3px;top:50%;transform:translateY(-50%)}",
".bxbt{bottom:2px;left:50%;transform:translateX(-50%)}.bxl{left:3px;top:50%;transform:translateY(-50%)}",
".bxd{font-family:var(--mono);font-size:11px;color:var(--acc);text-align:center}",
".dr{display:flex;align-items:baseline;padding:1px 0;cursor:pointer;white-space:nowrap;border:1px solid transparent;border-radius:2px;transition:background .05s}",
".dr:hover{background:var(--bg4)}.dr.sel{background:var(--sbg);border-color:rgba(0,136,255,.5)}",
".dr.hl{outline:1px solid var(--mbd);background:var(--mbg)}",
".dr.sh{background:rgba(255,200,0,.25);outline:1px solid rgba(255,200,0,.8)}",
".dr.sc{background:rgba(255,160,0,.35);outline:2px solid rgba(255,160,0,.9)}",
".dt{display:inline-block;width:14px;text-align:center;color:var(--t3);font-size:9px;cursor:pointer;flex-shrink:0;transition:transform .1s;user-select:none}",
".dt.o{transform:rotate(90deg)}.tn{color:var(--tag)}.tc{color:var(--tag);opacity:.6}.an{color:var(--attr)}.av{color:var(--val)}.tx{color:var(--t2);font-style:italic}.cm{color:var(--t3);font-style:italic}",
".dc{display:none}.dc.o{display:block}",
".avei{background:var(--bg3);border:1px solid var(--acc);border-radius:2px;color:var(--t0);font-family:var(--mono);font-size:12px;padding:0 3px;outline:none;min-width:40px}",
"#ctx{position:fixed;background:var(--bg1);border:1px solid var(--bdh);border-radius:5px;padding:4px 0;z-index:2147483648;min-width:160px;box-shadow:0 4px 16px rgba(0,0,0,.5);display:none}",
".ci{padding:5px 14px;font-size:12px;font-family:var(--ui);color:var(--t1);cursor:pointer;transition:background .05s}",
".ci:hover{background:var(--bgh);color:var(--t0)}.csep{height:1px;background:var(--bd);margin:3px 0}",
"#bc{background:var(--bg1);border-top:1px solid var(--bd);padding:3px 8px;font-family:var(--mono);font-size:11px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}",
"#bc .bct{color:var(--tag)}#bc .bcs{color:var(--t3);margin:0 3px}",
"#cot{background:var(--bg2);border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:4px;padding:4px 8px;flex-shrink:0;flex-wrap:wrap}",
".fb{background:transparent;border:1px solid transparent;border-radius:var(--r);color:var(--t2);cursor:pointer;font-size:11px;font-family:var(--ui);padding:2px 7px;transition:all .1s}",
".fb:hover{background:var(--bg4);color:var(--t0)}.fb.on{border-color:var(--bdh);background:var(--bg4);color:var(--t0)}",
".fb.warn.on{border-color:var(--wbd);color:var(--wfg);background:var(--wbg)}",
".fb.error.on{border-color:var(--ebd);color:var(--efg);background:var(--ebg)}",
".fb.info.on{border-color:var(--ibd);color:var(--ifg);background:var(--ibg)}",
"#cof{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 7px;outline:none;width:120px;transition:border-color .15s}",
"#cof:focus{border-color:var(--acc)}.tsep{width:1px;background:var(--bd);height:16px;flex-shrink:0}",
"#mc{font-size:11px;color:var(--t3);margin-left:auto;font-family:var(--mono)}",
"#la{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".le{display:grid;grid-template-columns:18px 1fr auto;grid-template-rows:auto auto;border-bottom:1px solid rgba(255,255,255,.03);font-family:var(--mono);font-size:12px;line-height:1.55;cursor:pointer;transition:background .05s}",
".le:hover{background:var(--bg4)}.le.warn{background:var(--wbg);border-color:var(--wbd)}",
".le.error{background:var(--ebg);border-color:var(--ebd)}.le.info{background:var(--ibg);border-color:var(--ibd)}.le.debug{opacity:.65}",
".le.grph{background:var(--bg2);font-weight:500}",
".lexp{grid-column:1;grid-row:1;cursor:pointer;color:var(--t3);font-size:9px;padding:5px 0 0 5px;transition:transform .12s;user-select:none}",
".lexp.o{transform:rotate(90deg);color:var(--t1)}",
".lbdy{grid-column:2;grid-row:1;padding:4px 6px 4px 2px;word-break:break-word;overflow-wrap:anywhere}",
".ltm{grid-column:3;grid-row:1;padding:5px 8px 0 0;font-size:10px;color:var(--t3);white-space:nowrap}",
".lsk{grid-column:1 / -1;grid-row:2;display:none;padding:0 8px 5px 20px;border-top:1px solid rgba(255,255,255,.04);background:rgba(0,0,0,.18)}",
".lsk.o{display:block}",
".lgc{grid-column:1 / -1;display:none;padding-left:16px;border-left:2px solid var(--bd);margin-left:12px}",
".lgc.o{display:block}",
".sf{display:flex;gap:8px;padding:2px 0;font-size:11px;line-height:1.5}",
".sfat{color:var(--t3)}.sffn{color:var(--fn)}.sfloc{color:var(--acc);text-decoration:underline dotted;cursor:pointer}",
".sfloc:hover{color:var(--acc2)}",
".ltbl{grid-column:1 / -1;padding:4px 8px 6px;overflow-x:auto}",
".ct{border-collapse:collapse;font-family:var(--mono);font-size:11px;min-width:100%}",
".ct th{background:var(--bg3);color:var(--t2);padding:3px 8px;text-align:left;border:1px solid var(--bd);font-weight:500}",
".ct td{padding:2px 8px;border:1px solid rgba(255,255,255,.06);color:var(--t1)}",
".ct tr:nth-child(even) td{background:rgba(255,255,255,.02)}",
".vs{color:var(--val)}.vs::before{content:'\"'}.vs::after{content:'\"'}",
".vn{color:var(--num)}.vb{color:var(--bool)}.vnl{color:var(--t2);font-style:italic}",
".vf{color:var(--fn)}.vt{color:var(--tag)}.ve{color:var(--efg)}.vk{color:var(--attr)}.vp{color:var(--t3)}",
".ot{display:inline}",
".ottog{cursor:pointer;user-select:none;color:var(--acc);font-size:10px;display:inline-block;width:12px;text-align:center;transition:transform .1s;vertical-align:middle}",
".ottog.o{transform:rotate(90deg)}.otpv{cursor:pointer;color:inherit}",
".otch{display:none;padding-left:14px;border-left:1px solid var(--bd);margin:2px 0 2px 4px}",
".otch.o{display:block}.otrw{display:block;line-height:1.6}",
".otk{color:var(--attr)}.otc{color:var(--t3)}.oti{color:var(--num)}",
"#rb{background:var(--bg2);border-top:1px solid var(--bd);display:flex;align-items:center;padding:0 8px;gap:6px;flex-shrink:0;min-height:34px}",
"#rpfx{color:var(--t3);font-family:var(--mono);font-size:13px;flex-shrink:0;user-select:none}",
"#ri{flex:1;background:transparent;border:none;color:var(--t0);font-family:var(--mono);font-size:12px;outline:none;padding:6px 0}",
"#rrun{background:var(--acc);border:none;border-radius:var(--r);color:#fff;cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 9px;font-weight:500;transition:background .1s}",
"#rrun:hover{background:#006ee0}",
"#nett{background:var(--bg2);border-bottom:1px solid var(--bd);padding:4px 8px;display:flex;gap:5px;align-items:center;flex-shrink:0}",
"#netf{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 6px;outline:none;width:140px}",
"#netf:focus{border-color:var(--acc)}",
".ntb{background:transparent;border:1px solid transparent;border-radius:var(--r);color:var(--t2);cursor:pointer;font-size:10px;font-family:var(--ui);padding:2px 7px;transition:all .1s}",
".ntb:hover{background:var(--bg4);color:var(--t0)}.ntb.on{border-color:var(--bdh);background:var(--bg4);color:var(--t0)}",
"#netcl{background:transparent;border:1px solid transparent;border-radius:var(--r);color:var(--t2);cursor:pointer;font-size:11px;font-family:var(--ui);padding:2px 7px;margin-left:auto;transition:all .1s}",
"#netcl:hover{background:var(--bg4);color:var(--efg);border-color:var(--ebd)}",
"#netb{display:flex;flex:1;overflow:hidden}",
"#netl{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent;font-family:var(--mono);font-size:11px}",
".neth{display:grid;grid-template-columns:50px 1fr 55px 52px 52px;background:var(--bg2);border-bottom:1px solid var(--bd);padding:3px 6px;font-size:10px;color:var(--t2);flex-shrink:0;position:sticky;top:0;z-index:1}",
".netr{display:grid;grid-template-columns:50px 1fr 55px 52px 52px;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,.03);cursor:pointer;transition:background .05s;align-items:center}",
".netr:hover{background:var(--bgh)}.netr.sel{background:var(--sbg)}",
".netr.nerr .nst{color:var(--efg)}.netr.npnd .nst{color:var(--wfg)}",
".nm{color:var(--fn);font-size:10px}.nst{font-size:10px}.nst.ok{color:var(--grn)}.nst.rd{color:var(--wfg)}",
".nurl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--t1)}.nurl span{color:var(--t3)}",
".ndur,.nsz{color:var(--t2);text-align:right;font-size:10px}",
"#netd{width:220px;border-left:1px solid var(--bd);overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent;display:none;flex-direction:column}",
"#netd.vis{display:flex}",
".ndsc{border-bottom:1px solid var(--bd)}",
".ndh{font-family:var(--ui);font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--t2);padding:4px 8px;background:var(--bg2);cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none}",
".ndh:hover{background:var(--bg3)}.ndb{padding:4px 8px;font-family:var(--mono);font-size:11px;color:var(--t1);overflow-x:auto}",
".ndb.col{display:none}.ndr{display:flex;gap:5px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.03)}",
".ndk{color:var(--attr);min-width:80px;flex-shrink:0;word-break:break-all}.ndv{color:var(--t1);word-break:break-all}",
"#stabs{display:flex;background:var(--bg2);border-bottom:1px solid var(--bd);flex-shrink:0}",
".stb2{font-size:11px;color:var(--t2);background:transparent;border:none;border-bottom:2px solid transparent;padding:5px 12px;cursor:pointer;transition:color .1s;font-family:var(--ui);margin-bottom:-1px}",
".stb2:hover{color:var(--t0)}.stb2.on{color:var(--t0);border-bottom-color:var(--acc)}",
".stpan{display:none;flex:1;flex-direction:column;overflow:hidden}.stpan.on{display:flex}",
".sttb{background:var(--bg2);border-bottom:1px solid var(--bd);padding:4px 8px;display:flex;gap:5px;align-items:center;flex-shrink:0}",
".stsr{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:3px 6px;outline:none;flex:1}",
".stsr:focus{border-color:var(--acc)}",
".sta{background:transparent;border:1px solid var(--bd);border-radius:var(--r);color:var(--t1);cursor:pointer;font-size:11px;font-family:var(--ui);padding:2px 7px;transition:all .1s}",
".sta:hover{background:var(--bg4);color:var(--t0)}.sta.del:hover{color:var(--efg);border-color:var(--ebd)}",
".stg{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".sgh{display:grid;grid-template-columns:1fr 1fr 55px;background:var(--bg2);border-bottom:1px solid var(--bd);padding:3px 8px;font-size:10px;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;position:sticky;top:0}",
".sgr{display:grid;grid-template-columns:1fr 1fr 55px;padding:3px 8px;border-bottom:1px solid rgba(255,255,255,.03);font-family:var(--mono);font-size:11px;cursor:pointer;transition:background .05s;align-items:center}",
".sgr:hover{background:var(--bgh)}.sgr.sel{background:var(--sbg)}",
".sgk{color:var(--attr);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
".sgv{color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sgsz{color:var(--t3);font-size:10px;text-align:right}",
".steb{background:var(--bg1);border-top:1px solid var(--bd);padding:5px 8px;flex-shrink:0;display:none;gap:5px;align-items:center;flex-direction:column}",
".steb.vis{display:flex}",
".steb input,.steb textarea{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);color:var(--t0);font-family:var(--mono);font-size:11px;padding:4px 6px;outline:none;width:100%}",
".steb input:focus,.steb textarea:focus{border-color:var(--acc)}.steb textarea{resize:vertical;min-height:50px}",
".stebb{display:flex;gap:6px;align-self:flex-end}",
".ckh{display:grid;grid-template-columns:1fr 1fr 70px 70px;background:var(--bg2);border-bottom:1px solid var(--bd);padding:3px 8px;font-size:10px;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;position:sticky;top:0}",
".ckr{display:grid;grid-template-columns:1fr 1fr 70px 70px;padding:3px 8px;border-bottom:1px solid rgba(255,255,255,.03);font-family:var(--mono);font-size:11px;cursor:pointer;transition:background .05s}",
".ckr:hover{background:var(--bgh)}",
"#pft{background:var(--bg2);border-bottom:1px solid var(--bd);padding:4px 8px;display:flex;gap:5px;align-items:center;flex-shrink:0}",
"#pfrec{background:var(--efg);border:none;border-radius:var(--r);color:#fff;cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 10px;font-weight:500;transition:background .1s}",
"#pfrec:hover{background:#d04040}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}",
"#pfrec.rec{animation:pulse 1s infinite}",
"#pfcl{background:transparent;border:1px solid var(--bd);border-radius:var(--r);color:var(--t1);cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 8px;transition:all .1s}",
"#pfcl:hover{background:var(--bg4)}",
"#pfb{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".pfsh{font-family:var(--ui);font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--t2);padding:6px 10px 3px;border-bottom:1px solid var(--bd);background:var(--bg2);position:sticky;top:0}",
".pfmr{display:flex;gap:8px;padding:3px 10px;font-family:var(--mono);font-size:11px;border-bottom:1px solid rgba(255,255,255,.03);align-items:center}",
".pmn{color:var(--fn);flex:1}.pmt{color:var(--num);text-align:right;min-width:70px}.pmd{color:var(--acc2);font-size:10px;min-width:60px;text-align:right}",
".pmtm{color:var(--wfg);font-size:9px}.pmms{color:var(--ifg);font-size:9px}",
".vitg{display:grid;grid-template-columns:1fr 1fr;gap:0}",
".vitc{padding:10px 12px;border-right:1px solid var(--bd);border-bottom:1px solid var(--bd)}",
".vitl{font-size:10px;color:var(--t2);font-family:var(--ui);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}",
".vitv{font-family:var(--mono);font-size:18px;font-weight:600}",
".vitv.good{color:var(--grn)}.vitv.ok{color:var(--wfg)}.vitv.bad{color:var(--efg)}.vitv.na{color:var(--t3)}",
"#mutt{background:var(--bg2);border-bottom:1px solid var(--bd);padding:4px 8px;display:flex;gap:5px;align-items:center;flex-shrink:0}",
"#mtog{background:var(--grn);border:none;border-radius:var(--r);color:#fff;cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 10px;font-weight:500;transition:background .1s}",
"#mtog.off{background:var(--bg4);color:var(--t1);border:1px solid var(--bd)}",
"#mcl{background:transparent;border:1px solid var(--bd);border-radius:var(--r);color:var(--t1);cursor:pointer;font-size:11px;font-family:var(--ui);padding:3px 8px;transition:all .1s}",
"#mcl:hover{background:var(--bg4)}#mcnt{font-size:11px;color:var(--t3);margin-left:auto;font-family:var(--mono)}",
"#ml{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}",
".mutr{padding:4px 10px;border-bottom:1px solid rgba(255,255,255,.03);font-family:var(--mono);font-size:11px;cursor:pointer;transition:background .05s}",
".mutr:hover{background:var(--bgh)}",
".mtype{font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;margin-right:6px}",
".mtype.attributes{background:rgba(109,180,212,.2);color:var(--attr)}.mtype.childList{background:rgba(87,196,122,.2);color:var(--grn)}.mtype.characterData{background:rgba(229,192,123,.2);color:var(--fn)}",
".mtgt{color:var(--tag)}.mdt{color:var(--t2);font-size:10px;margin-top:2px}",
"::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}",
"::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--bdh)}"
].join('');

/* ── ICONS ─────────────────────────────────────────────── */
var IC={
  cur:'<svg viewBox="0 0 14 14"><path d="M2 2 L12 7 L8 8.5 L6 12 Z" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  clr:'<svg viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>',
  logo:'<svg viewBox="0 0 14 14" fill="none"><polygon points="7,1 13,4.5 13,9.5 7,13 1,9.5 1,4.5" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.6"/></svg>',
  insp:'<svg viewBox="0 0 14 14"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><line x1="3" y1="5.5" x2="11" y2="5.5" stroke="currentColor" stroke-width="1"/><line x1="3" y1="8" x2="8" y2="8" stroke="currentColor" stroke-width="1"/></svg>',
  con:'<svg viewBox="0 0 14 14"><polyline points="2,4.5 5.5,8 2,11.5" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="7" y1="11" x2="12" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>',
  net:'<svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M2 7 Q7 2 12 7 Q7 12 2 7" stroke="currentColor" stroke-width="1" fill="none"/><line x1="7" y1="1.5" x2="7" y2="12.5" stroke="currentColor" stroke-width="1"/></svg>',
  st:'<svg viewBox="0 0 14 14"><ellipse cx="7" cy="4" rx="5" ry="2.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M2 4 v6 M12 4 v6" stroke="currentColor" stroke-width="1.1"/><ellipse cx="7" cy="10" rx="5" ry="2.5" stroke="currentColor" stroke-width="1.1" fill="none"/><ellipse cx="7" cy="7" rx="5" ry="2.5" stroke="currentColor" stroke-width="1.1" fill="none"/></svg>',
  pf:'<svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.1" fill="none"/><polyline points="7,3.5 7,7 9.5,9" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
  mu:'<svg viewBox="0 0 14 14"><path d="M2 7 Q7 1 12 7 Q7 13 2 7" stroke="currentColor" stroke-width="1.1" fill="none"/><circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
  cl2:'<svg viewBox="0 0 14 14"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>',
  sun:'<svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.1" fill="none"/><line x1="7" y1="1" x2="7" y2="2.5"/><line x1="7" y1="11.5" x2="7" y2="13"/><line x1="1" y1="7" x2="2.5" y2="7"/><line x1="11.5" y1="7" x2="13" y2="7"/><line x1="2.9" y1="2.9" x2="3.9" y2="3.9"/><line x1="10.1" y1="10.1" x2="11.1" y2="11.1"/><line x1="11.1" y1="2.9" x2="10.1" y2="3.9"/><line x1="3.9" y1="10.1" x2="2.9" y2="11.1"/></svg>'
};

/* ── HTML ──────────────────────────────────────────────── */
function buildHTML(){
  return '<div id="fab" title="Phantom DevTools (Alt+D)">'+IC.logo+'<span id="pip"></span></div>'
  +'<div id="panel" class="pbot hide"><div id="rh"></div>'
  +'<div id="tabs">'
  +'<button class="tab on" data-tab="inspector">'+IC.insp+' Inspector</button>'
  +'<button class="tab" data-tab="console">'+IC.con+' Console <span class="tbg" id="eb">0</span><span class="tbg w" id="wb">0</span></button>'
  +'<button class="tab" data-tab="network">'+IC.net+' Network <span class="tbg i" id="nb">0</span></button>'
  +'<button class="tab" data-tab="storage">'+IC.st+' Storage</button>'
  +'<button class="tab" data-tab="performance">'+IC.pf+' Performance</button>'
  +'<button class="tab" data-tab="mutations">'+IC.mu+' Mutations</button>'
  +'<div id="tr">'
  +'<button class="ib" id="pkb">'+IC.cur+'</button>'
  +'<button class="ib" id="thb">'+IC.sun+'</button>'
  +'<button class="ib" id="clb">'+IC.clr+'</button>'
  +'<button class="ib" id="csb">'+IC.cl2+'</button>'
  +'</div></div>'
  +'<div id="panels">'
  // INSPECTOR
  +'<div class="pan on" data-panel="inspector">'
  +'<div id="selbar"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="color:var(--t2);flex-shrink:0;stroke:currentColor;stroke-width:1.2"><circle cx="5" cy="5" r="3.5"/><line x1="8" y1="8" x2="11" y2="11"/></svg>'
  +'<input id="csi" type="text" placeholder="CSS selector — div.class, #id, :hover…" autocomplete="off"/>'
  +'<span id="sct">—</span><button class="ib" id="pkb2">'+IC.cur+' Pick</button></div>'
  +'<div id="dsb"><input id="dsi" type="text" placeholder="Search DOM…" autocomplete="off"/><span id="dsc"></span>'
  +'<button class="snv" id="dspv">↑</button><button class="snv" id="dsnx">↓</button><button class="ib" id="dscl" style="font-size:12px">×</button></div>'
  +'<div id="ibdy"><div id="dp"><div class="mut">Loading…</div></div><div id="idv"></div>'
  +'<div id="ss">'
  +'<div id="ist"><button class="stb on" data-stab="styles">Styles</button><button class="stb" data-stab="rules">Rules</button><button class="stb" data-stab="events">Events</button><button class="stb" data-stab="a11y">A11y</button></div>'
  +'<div class="sp2 on" data-stab="styles"><div id="cmp">'
  +'<div class="phdr" style="display:flex;align-items:center;gap:5px;padding-right:6px"><span style="flex:1">Computed Styles</span><span style="font-size:9px;color:var(--t3);font-family:var(--mono)" id="ovc"></span></div>'
  +'<div style="padding:4px 8px;border-bottom:1px solid var(--bd);background:var(--bg2)"><input id="sfi" type="text" placeholder="Filter properties…" autocomplete="off"/></div>'
  +'<div id="sr"><div class="mut">Select an element</div></div>'
  +'<div id="arr"><input id="arpp" type="text" placeholder="property" autocomplete="off" spellcheck="false"/>'
  +'<span style="color:var(--t3);font-family:var(--mono);font-size:11px">:</span>'
  +'<input id="arv" type="text" placeholder="value" autocomplete="off" spellcheck="false"/>'
  +'<button id="arb">+</button></div></div>'
  +'<div id="bmp"><div class="phdr" id="bmh" style="display:flex;align-items:center;cursor:pointer"><span style="flex:1">Box Model</span>'
  +'<span id="bmarr" style="font-size:9px;color:var(--t3);transition:transform .15s;display:inline-block;transform:rotate(90deg)">▶</span></div>'
  +'<div id="bd2" style="padding:8px"><div class="mut" style="padding:0">No element selected</div></div></div></div>'
  +'<div class="sp2" data-stab="rules"><div class="phdr">CSS Rules</div><div id="rlp"><div class="mut">Select an element</div></div></div>'
  +'<div class="sp2" data-stab="events"><div class="phdr">Event Listeners</div><div id="evp"><div class="mut">Select an element</div></div></div>'
  +'<div class="sp2" data-stab="a11y"><div class="phdr">Accessibility</div><div id="a1p"><div class="mut">Select an element</div></div></div>'
  +'</div></div><div id="bc">No element selected</div></div>'
  // CONSOLE
  +'<div class="pan" data-panel="console">'
  +'<div id="cot">'
  +'<button class="fb on" data-f="all">All</button><button class="fb" data-f="log">Log</button>'
  +'<button class="fb info" data-f="info">Info</button><button class="fb warn" data-f="warn">Warn</button>'
  +'<button class="fb error" data-f="error">Error</button><button class="fb" data-f="debug">Debug</button>'
  +'<div class="tsep"></div><input id="cof" type="text" placeholder="Filter…"/>'
  +'<span id="mc">0 messages</span></div>'
  +'<div id="la"></div>'
  +'<div id="rb"><span id="rpfx">&gt;&gt;&gt;</span>'
  +'<input id="ri" type="text" placeholder="JavaScript expression…" autocomplete="off" spellcheck="false"/>'
  +'<button id="rrun">Run</button></div></div>'
  // NETWORK
  +'<div class="pan" data-panel="network">'
  +'<div id="nett"><input id="netf" type="text" placeholder="Filter URLs…" autocomplete="off"/>'
  +'<button class="ntb on" data-nt="all">All</button><button class="ntb" data-nt="fetch">Fetch</button><button class="ntb" data-nt="xhr">XHR</button>'
  +'<button id="netcl">Clear</button></div>'
  +'<div class="neth"><span>Method</span><span>URL</span><span>Status</span><span>Time</span><span>Size</span></div>'
  +'<div id="netb"><div id="netl"><div class="mut">No requests yet.</div></div>'
  +'<div id="netd">'
  +'<div class="ndsc"><div class="ndh" data-s="gen">General <span>▼</span></div><div class="ndb" id="ndg"></div></div>'
  +'<div class="ndsc"><div class="ndh" data-s="rqh">Request Headers <span>▼</span></div><div class="ndb" id="ndrq"></div></div>'
  +'<div class="ndsc"><div class="ndh" data-s="rsh">Response Headers <span>▼</span></div><div class="ndb" id="ndrs"></div></div>'
  +'<div class="ndsc"><div class="ndh" data-s="prv">Preview <span>▼</span></div><div class="ndb" id="ndpv" style="max-height:180px;overflow:auto;white-space:pre-wrap;font-size:10px"></div></div>'
  +'<div class="ndsc"><div class="ndh" data-s="tim">Timing <span>▼</span></div><div class="ndb" id="ndtm"></div></div>'
  +'</div></div></div>'
  // STORAGE
  +'<div class="pan" data-panel="storage">'
  +'<div id="stabs"><button class="stb2 on" data-store="local">localStorage</button><button class="stb2" data-store="session">sessionStorage</button><button class="stb2" data-store="cookies">Cookies</button></div>'
  +'<div class="stpan on" data-store="local">'
  +'<div class="sttb"><input class="stsr" id="lss" type="text" placeholder="Filter…" autocomplete="off"/><button class="sta" id="lsr">↻</button><button class="sta del" id="lsca">Clear All</button></div>'
  +'<div class="sgh"><span>Key</span><span>Value</span><span>Size</span></div>'
  +'<div class="stg" id="lsg"><div class="mut">No entries</div></div>'
  +'<div class="steb" id="lseb"><input id="lsek" type="text" placeholder="Key" autocomplete="off"/><textarea id="lsev" placeholder="Value (JSON or string)"></textarea>'
  +'<div class="stebb"><button class="sta" id="lssv">Save</button><button class="sta del" id="lsdl">Delete</button><button class="sta" id="lscn">Cancel</button></div></div></div>'
  +'<div class="stpan" data-store="session">'
  +'<div class="sttb"><input class="stsr" id="sss" type="text" placeholder="Filter…" autocomplete="off"/><button class="sta" id="ssr">↻</button><button class="sta del" id="ssca">Clear All</button></div>'
  +'<div class="sgh"><span>Key</span><span>Value</span><span>Size</span></div>'
  +'<div class="stg" id="ssg"><div class="mut">No entries</div></div>'
  +'<div class="steb" id="sseb"><input id="ssek" type="text" placeholder="Key" autocomplete="off"/><textarea id="ssev" placeholder="Value"></textarea>'
  +'<div class="stebb"><button class="sta" id="sssv">Save</button><button class="sta del" id="ssdl">Delete</button><button class="sta" id="sscn">Cancel</button></div></div></div>'
  +'<div class="stpan" data-store="cookies">'
  +'<div class="sttb"><input class="stsr" id="cks" type="text" placeholder="Filter…" autocomplete="off"/><button class="sta" id="ckr">↻</button></div>'
  +'<div class="ckh"><span>Name</span><span>Value</span><span>Path</span><span>Expires</span></div>'
  +'<div class="stg" id="ckg"><div class="mut">No cookies</div></div></div></div>'
  // PERFORMANCE
  +'<div class="pan" data-panel="performance">'
  +'<div id="pft"><button id="pfrec">⏺ Start Recording</button><button id="pfcl">Clear</button>'
  +'<button class="sta" id="pfss" style="margin-left:auto">Snapshot</button></div>'
  +'<div id="pfb"><div class="vitg" id="vitg"></div>'
  +'<div class="pfsh">Marks &amp; Measures</div><div id="pfmk"><div class="mut">No marks. Use performance.mark() or Snapshot.</div></div>'
  +'<div class="pfsh" style="margin-top:4px">Navigation Timing</div><div id="pfnv"><div class="mut">Loading…</div></div></div></div>'
  // MUTATIONS
  +'<div class="pan" data-panel="mutations">'
  +'<div id="mutt"><button id="mtog">● Observing</button><button id="mcl">Clear</button><span id="mcnt">0 mutations</span></div>'
  +'<div id="ml"><div class="mut">DOM mutations appear here in real-time.</div></div></div>'
  +'</div></div>'
  // Context menu
  +'<div id="ctx">'
  +'<div class="ci" id="cx-sel">Copy CSS selector</div>'
  +'<div class="ci" id="cx-html">Copy outerHTML</div>'
  +'<div class="ci" id="cx-txt">Copy text content</div>'
  +'<div class="csep"></div>'
  +'<div class="ci" id="cx-scr">Scroll into view</div>'
  +'<div class="ci" id="cx-exp">Expand all children</div>'
  +'<div class="ci" id="cx-foc">Focus element</div>'
  +'<div class="csep"></div>'
  +'<div class="ci" id="cx-ins">Inspect in console</div>'
  +'</div>'
  +'<div id="phantom-pick-overlay"></div>';
}

var OCSS='#phantom-pick-overlay{display:none;position:fixed;inset:0;z-index:2147483646;cursor:crosshair}.pdthl{position:fixed;pointer-events:none;z-index:2147483645;background:rgba(0,136,255,.08);outline:2px dashed rgba(0,200,255,.8)}';

/* ── MAIN CLASS ────────────────────────────────────────── */
function PDT(){}

PDT.prototype.init=function(opts){
  opts=opts||{};
  var S=this;
  S.o={position:opts.position||'bottom',height:opts.height||340,width:opts.width||500,
       theme:opts.theme||'dark',open:opts.open||false,intercept:opts.intercept!==false};
  S.s={logs:[],filter:'all',tf:'',ec:0,wc:0,nc:0,mc:0,
       picking:false,node:null,selMatch:[],
       replHist:[],replIdx:-1,isOpen:false,
       styleFilter:'',light:S.o.theme==='light',
       netReqs:[],netSel:null,netFilter:'',netType:'all',
       mutObs:null,mutOn:true,mutCnt:0,
       perfRec:false,schM:[],schI:0,
       storeKey:null,ssKey:null,groupStack:[],timers:{}};
  S._buildDOM();S._bindAll();S._interceptConsole();S._interceptNet();
  S._startMut();S._buildTree();S._vitals();S._navTiming();
  if(S.s.light)S.sh.host.classList.add('light');
  if(S.o.open)S.open();
  S._log('info',[{t:'string',v:'Phantom DevTools v3 — Alt+D toggle · Ctrl+F search DOM'}],[]);
  return S;
};

PDT.prototype._buildDOM=function(){
  var S=this;
  var host=document.createElement('div');
  host.id='phantom-dt-host';
  host.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;top:0;left:0';
  document.body.appendChild(host);
  S._host=host;
  var sh=host.attachShadow({mode:'open'});S.sh=sh;
  var sEl=document.createElement('style');sEl.textContent=CSS;sh.appendChild(sEl);
  var wrap=document.createElement('div');wrap.style.cssText='pointer-events:auto';
  wrap.innerHTML=buildHTML();sh.appendChild(wrap);
  var oSt=document.createElement('style');oSt.textContent=OCSS;document.head.appendChild(oSt);S._oSt=oSt;
  S._ov=document.createElement('div');S._ov.id='phantom-pick-overlay';document.body.appendChild(S._ov);
  S._hl=document.createElement('div');S._hl.className='pdthl';S._hl.style.display='none';document.body.appendChild(S._hl);
  var q=function(sel){return sh.querySelector(sel);};S.q=q;
  S._fab=q('#fab');S._panel=q('#panel');S._eb=q('#eb');S._wb=q('#wb');S._nb=q('#nb');
  S._pip=q('#pip');S._la=q('#la');S._dp=q('#dp');
  S._csi=q('#csi');S._sct=q('#sct');
  S._sr=q('#sr');S._arpp=q('#arpp');S._arv=q('#arv');S._sfi=q('#sfi');
  S._bd2=q('#bd2');S._bc=q('#bc');S._ri=q('#ri');
  S._mc=q('#mc');S._cof=q('#cof');S._ibdy=q('#ibdy');
  S._netl=q('#netl');S._netd=q('#netd');
  S._ctx=q('#ctx');
  S._applyLayout();
};

PDT.prototype._applyLayout=function(){
  var S=this,p=S._panel,o=S.o;
  p.classList.remove('pbot','prgt');p.classList.add(o.position==='right'?'prgt':'pbot');
  if(o.position==='bottom'){p.style.height=o.height+'px';p.style.width='';}
  else{p.style.width=o.width+'px';p.style.height='';}
  S._fab.style.bottom=(o.position==='bottom'&&S.s.isOpen)?(o.height+16)+'px':'12px';
};

PDT.prototype._bindAll=function(){
  var S=this,sh=S.sh,q=S.q;
  S._fab.addEventListener('click',function(){S.toggle();});
  q('#csb').addEventListener('click',function(){S.close();});
  q('#thb').addEventListener('click',function(){S._toggleTheme();});
  sh.querySelectorAll('.tab').forEach(function(b){b.addEventListener('click',function(){S._tab(b.dataset.tab);});});
  sh.querySelectorAll('.stb').forEach(function(b){b.addEventListener('click',function(){S._stab(b.dataset.stab);});});
  sh.querySelectorAll('.fb').forEach(function(b){b.addEventListener('click',function(){S._setFilter(b);});});
  S._cof.addEventListener('input',function(){S.s.tf=S._cof.value;S._rebuildLog();});
  q('#clb').addEventListener('click',function(){S.clear();});
  q('#pkb').addEventListener('click',function(){S._picker();});
  q('#pkb2').addEventListener('click',function(){S._picker();});
  S._ri.addEventListener('keydown',function(e){S._rk(e);});
  q('#rrun').addEventListener('click',function(){S._repl();});
  var _d=null;
  S._csi.addEventListener('input',function(){clearTimeout(_d);_d=setTimeout(function(){S._runSel(S._csi.value);},200);});
  S._csi.addEventListener('keydown',function(e){if(e.key==='Escape'){S._csi.value='';S._clrSel();S._sct.textContent='—';S._csi.className='';}if(e.key==='Enter')S._runSel(S._csi.value);});
  q('#dsi').addEventListener('input',function(e){S._search(e.target.value);});
  q('#dspv').addEventListener('click',function(){S._sNav(-1);});
  q('#dsnx').addEventListener('click',function(){S._sNav(1);});
  q('#dscl').addEventListener('click',function(){S._sClose();});
  S._sfi.addEventListener('input',function(){S.s.styleFilter=S._sfi.value.toLowerCase();S._renderCS(S.s.node);});
  var doAdd=function(){
    var p=S._arpp.value.trim(),v=S._arv.value.trim();
    if(!p||!v||!S.s.node)return;
    try{S.s.node.style.setProperty(p,v);S._arpp.value='';S._arv.value='';S._renderCS(S.s.node);S._renderBM(S.s.node);}catch(e){}
  };
  q('#arb').addEventListener('click',doAdd);
  S._arv.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doAdd();}});
  S._arpp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();S._arv.focus();}});
  q('#bmh').addEventListener('click',function(){
    var p=q('#bmp'),a=q('#bmarr'),c=p.classList.toggle('collapsed');
    a.style.transform=c?'rotate(0deg)':'rotate(90deg)';
    var bd=q('#bd2');bd.style.display=c?'none':'';
  });
  // Inspector divider
  q('#idv').addEventListener('mousedown',function(e){
    e.preventDefault();
    var sx=e.clientX,cols=S._ibdy.style.gridTemplateColumns||'1fr 3px 260px',sw=parseInt(cols.split(' ')[2])||260;
    var mm=function(me){var d=sx-me.clientX;S._ibdy.style.gridTemplateColumns='1fr 3px '+Math.max(160,Math.min(550,sw+d))+'px';};
    var mu=function(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);};
    document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
  });
  // Panel resize
  q('#rh').addEventListener('mousedown',function(e){
    e.preventDefault();
    var isB=S.o.position==='bottom',sc=isB?e.clientY:e.clientX,ss=isB?S.o.height:S.o.width;
    var mm=function(me){var d=sc-(isB?me.clientY:me.clientX);
      if(isB){S.o.height=Math.max(200,Math.min(window.innerHeight-60,ss+d));S._panel.style.height=S.o.height+'px';}
      else{S.o.width=Math.max(280,Math.min(window.innerWidth-60,ss-d));S._panel.style.width=S.o.width+'px';}
      S._applyLayout();
    };
    var mu=function(){document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);};
    document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
  });
  // Picker overlay
  S._ov.addEventListener('mousemove',function(e){
    if(!S.s.picking)return;
    var el=S._elAt(e.clientX,e.clientY);
    if(el){var r=el.getBoundingClientRect();S._hl.style.cssText='display:block;position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;pointer-events:none;z-index:2147483645;background:rgba(0,136,255,.08);outline:2px dashed rgba(0,200,255,.8)';}
  });
  S._ov.addEventListener('click',function(e){
    var el=S._elAt(e.clientX,e.clientY);
    if(el){S._picker();S._tab('inspector');S._buildTree();setTimeout(function(){S._expandTo(el);},80);}
  });
  // Context menu
  q('#cx-sel').addEventListener('click',function(){S._ctx_act('sel');});
  q('#cx-html').addEventListener('click',function(){S._ctx_act('html');});
  q('#cx-txt').addEventListener('click',function(){S._ctx_act('txt');});
  q('#cx-scr').addEventListener('click',function(){S._ctx_act('scr');});
  q('#cx-exp').addEventListener('click',function(){S._ctx_act('exp');});
  q('#cx-foc').addEventListener('click',function(){S._ctx_act('foc');});
  q('#cx-ins').addEventListener('click',function(){S._ctx_act('ins');});
  document.addEventListener('click',function(){S._hideCtx();});
  // Network
  q('#netf').addEventListener('input',function(e){S.s.netFilter=e.target.value;S._renderNetList();});
  sh.querySelectorAll('.ntb').forEach(function(b){b.addEventListener('click',function(){sh.querySelectorAll('.ntb').forEach(function(x){x.classList.remove('on');});b.classList.add('on');S.s.netType=b.dataset.nt;S._renderNetList();});});
  q('#netcl').addEventListener('click',function(){S.s.netReqs=[];S.s.netSel=null;S.s.nc=0;S._nb.style.display='none';S._netl.innerHTML='<div class="mut">No requests yet.</div>';S._netd.classList.remove('vis');});
  sh.querySelectorAll('.ndh').forEach(function(h){h.addEventListener('click',function(){var b=h.nextElementSibling;b.classList.toggle('col');h.querySelector('span').textContent=b.classList.contains('col')?'▶':'▼';});});
  // Storage tabs
  sh.querySelectorAll('.stb2').forEach(function(b){b.addEventListener('click',function(){
    sh.querySelectorAll('.stb2').forEach(function(x){x.classList.remove('on');});
    sh.querySelectorAll('.stpan').forEach(function(x){x.classList.remove('on');});
    b.classList.add('on');sh.querySelector('.stpan[data-store="'+b.dataset.store+'"]').classList.add('on');
    if(b.dataset.store==='local')S._renderLS();else if(b.dataset.store==='session')S._renderSS();else S._renderCK();
  });});
  // localStorage
  q('#lss').addEventListener('input',function(e){S._renderLS(e.target.value);});
  q('#lsr').addEventListener('click',function(){S._renderLS();});
  q('#lsca').addEventListener('click',function(){if(confirm('Clear all localStorage?')){localStorage.clear();S._renderLS();}});
  q('#lssv').addEventListener('click',function(){S._lsSave();});
  q('#lsdl').addEventListener('click',function(){S._lsDel();});
  q('#lscn').addEventListener('click',function(){S._lsHide();});
  // sessionStorage
  q('#sss').addEventListener('input',function(e){S._renderSS(e.target.value);});
  q('#ssr').addEventListener('click',function(){S._renderSS();});
  q('#ssca').addEventListener('click',function(){if(confirm('Clear all sessionStorage?')){sessionStorage.clear();S._renderSS();}});
  q('#sssv').addEventListener('click',function(){S._ssSave();});
  q('#ssdl').addEventListener('click',function(){S._ssDel();});
  q('#sscn').addEventListener('click',function(){S._ssHide();});
  // Cookies
  q('#cks').addEventListener('input',function(e){S._renderCK(e.target.value);});
  q('#ckr').addEventListener('click',function(){S._renderCK();});
  // Performance
  q('#pfrec').addEventListener('click',function(){S._pfRec();});
  q('#pfcl').addEventListener('click',function(){S._pfClear();});
  q('#pfss').addEventListener('click',function(){S._pfSnap();});
  // Mutations
  q('#mtog').addEventListener('click',function(){S._mutToggle();});
  q('#mcl').addEventListener('click',function(){S._mutClear();});
  // Keyboard
  document.addEventListener('keydown',function(e){
    if(e.altKey&&e.key==='d'){e.preventDefault();S.toggle();}
    if((e.ctrlKey||e.metaKey)&&e.key==='f'&&S.s.isOpen){
      var ip=S.sh.querySelector('.pan.on');
      if(ip&&ip.dataset.panel==='inspector'){e.preventDefault();S._sOpen();}
    }
  });
  window.addEventListener('message',function(e){
    if(!e.data||!e.data.__pdt)return;
    var d=e.data;
    if(d.type==='console'&&d.method!=='clear')S._log(d.method,d.args,d.stack||[]);
    if(d.type==='console'&&d.method==='clear')S.clear();
  });
};

PDT.prototype.open=function(){this._panel.classList.remove('hide');this.s.isOpen=true;this._applyLayout();};
PDT.prototype.close=function(){this._panel.classList.add('hide');this.s.isOpen=false;this._applyLayout();};
PDT.prototype.toggle=function(){this.s.isOpen?this.close():this.open();};
PDT.prototype._toggleTheme=function(){this.s.light=!this.s.light;this.sh.host.classList.toggle('light',this.s.light);};

PDT.prototype._tab=function(name){
  var S=this,sh=S.sh;
  sh.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('on',t.dataset.tab===name);});
  sh.querySelectorAll('.pan[data-panel]').forEach(function(p){p.classList.toggle('on',p.dataset.panel===name);});
  if(name==='inspector')S._buildTree();
  else if(name==='storage')S._renderLS();
  else if(name==='performance'){S._pfSnap();S._navTiming();}
};

PDT.prototype._stab=function(name){
  var S=this,sh=S.sh;
  sh.querySelectorAll('.stb').forEach(function(b){b.classList.toggle('on',b.dataset.stab===name);});
  sh.querySelectorAll('.sp2[data-stab]').forEach(function(p){p.classList.toggle('on',p.dataset.stab===name);});
  if(name==='rules')S._renderRules(S.s.node);
  else if(name==='events')S._renderEvents(S.s.node);
  else if(name==='a11y')S._renderA11y(S.s.node);
};

/* ── CONSOLE INTERCEPT ─────────────────────────────────── */
PDT.prototype._interceptConsole=function(){
  var S=this;if(!S.o.intercept)return;
  var M=['log','warn','error','info','debug','table','dir','assert','count','clear',
         'group','groupCollapsed','groupEnd','time','timeEnd','timeLog'];
  S._origC={};
  M.forEach(function(m){
    S._origC[m]=console[m]?console[m].bind(console):function(){};
    console[m]=function(){
      var args=Array.prototype.slice.call(arguments);
      S._origC[m].apply(console,args);
      if(m==='clear'){S.clear();return;}
      if(m==='assert'){if(args[0])return;args=['Assertion failed:'].concat(args.slice(1));}
      if(m==='time'){S.s.timers[args[0]||'default']=performance.now();return;}
      if(m==='timeEnd'||m==='timeLog'){
        var k=args[0]||'default',el=performance.now()-(S.s.timers[k]||0);
        S._log('log',[{t:'string',v:k+': '+el.toFixed(2)+'ms'}],[]);
        if(m==='timeEnd')delete S.s.timers[k];return;
      }
      S._log(m,args.map(function(a){return S._ser(a,0);}),S._getStack(3));
    };
  });
  window.addEventListener('error',function(e){
    S._log('error',[{t:'error',v:(e.error?e.error.message:e.message)}],
      [{fn:'(global)',file:(e.filename||'').split('/').slice(-1)[0],line:String(e.lineno),col:String(e.colno)}]);
  },true);
  window.addEventListener('unhandledrejection',function(e){
    S._log('error',[{t:'error',v:'Unhandled Promise Rejection: '+(e.reason&&e.reason.message||String(e.reason))}],S._getStack(2));
  },true);
};

/* ── NETWORK INTERCEPT ─────────────────────────────────── */
PDT.prototype._interceptNet=function(){
  var S=this;if(window.__pdt_net)return;window.__pdt_net=true;
  var oF=window.fetch;
  window.fetch=function(){
    var args=Array.prototype.slice.call(arguments);
    var url=typeof args[0]==='string'?args[0]:(args[0]&&args[0].url)||String(args[0]);
    var method=(args[1]&&args[1].method)||'GET';
    var rqH={};try{new Headers(args[1]&&args[1].headers||{}).forEach(function(v,k){rqH[k]=v;});}catch(e){}
    var id=Math.random().toString(36).slice(2),t0=performance.now();
    S._addReq({id:id,url:url,method:method,type:'fetch',status:'pending',rqH:rqH,rsH:{},preview:'',duration:0,size:0,t0:t0,ts:Date.now()});
    return oF.apply(this,args).then(function(r){
      var clone=r.clone(),dur=Math.round(performance.now()-t0),rsH={};
      r.headers.forEach(function(v,k){rsH[k]=v;});
      var sz=parseInt(r.headers.get('content-length')||'0');
      clone.text().then(function(body){S._upReq(id,{status:r.status,statusText:r.statusText,rsH:rsH,preview:body.slice(0,2000),duration:dur,size:sz||body.length});}).catch(function(){S._upReq(id,{status:r.status,statusText:r.statusText,rsH:rsH,duration:dur,size:sz});});
      return r;
    },function(err){S._upReq(id,{status:0,statusText:err.message,duration:Math.round(performance.now()-t0),error:true});throw err;});
  };
  var OX=window.XMLHttpRequest;
  window.XMLHttpRequest=function(){
    var xhr=new OX(),id=Math.random().toString(36).slice(2),xm='GET',xu='',t0;
    var oOpen=xhr.open.bind(xhr),oSend=xhr.send.bind(xhr);
    xhr.open=function(m,u){xm=m;xu=u;return oOpen.apply(xhr,arguments);};
    xhr.send=function(){
      t0=performance.now();
      S._addReq({id:id,url:xu,method:xm,type:'xhr',status:'pending',rqH:{},rsH:{},preview:'',duration:0,size:0,t0:t0,ts:Date.now()});
      xhr.addEventListener('load',function(){var dur=Math.round(performance.now()-t0),body=xhr.responseText||'';S._upReq(id,{status:xhr.status,statusText:xhr.statusText,preview:body.slice(0,2000),duration:dur,size:body.length});});
      xhr.addEventListener('error',function(){S._upReq(id,{status:0,statusText:'Network error',duration:Math.round(performance.now()-t0),error:true});});
      return oSend.apply(xhr,arguments);
    };
    return xhr;
  };
};

PDT.prototype._addReq=function(req){
  var S=this;S.s.netReqs.push(req);S.s.nc++;
  S._nb.style.display='';S._nb.textContent=S.s.nc;
  S._renderNetList();
};
PDT.prototype._upReq=function(id,data){
  var S=this,req=S.s.netReqs.find(function(r){return r.id===id;});
  if(req)Object.assign(req,data);
  S._renderNetList();
  if(S.s.netSel===id)S._showNetDetail(req);
};
PDT.prototype._fmtSz=function(b){if(b<1024)return b+'B';if(b<1048576)return (b/1024).toFixed(1)+'KB';return (b/1048576).toFixed(1)+'MB';};

PDT.prototype._renderNetList=function(){
  var S=this,f=S.s.netFilter.toLowerCase(),t=S.s.netType;
  var filt=S.s.netReqs.filter(function(r){
    if(f&&r.url.toLowerCase().indexOf(f)<0)return false;
    if(t!=='all'&&r.type!==t)return false;
    return true;
  });
  if(!filt.length){S._netl.innerHTML='<div class="mut">No matching requests.</div>';return;}
  var html=filt.map(function(r){
    var sel=r.id===S.s.netSel?' sel':'';
    var eCls=r.error?' nerr':(r.status==='pending'?' npnd':'');
    var stCls=r.status>=200&&r.status<300?' ok':r.status>=300&&r.status<400?' rd':'';
    var host='',path=r.url;
    try{var u=new URL(r.url);host='<span>'+u.hostname+'</span>';path=u.pathname+(u.search||'');}catch(e){}
    return '<div class="netr'+sel+eCls+'" data-id="'+r.id+'">'
      +'<span class="nm">'+r.method+'</span>'
      +'<span class="nurl" title="'+S._esc(r.url)+'">'+host+S._esc(path.slice(0,60))+'</span>'
      +'<span class="nst'+stCls+'">'+r.status+'</span>'
      +'<span class="ndur">'+(r.duration?r.duration+'ms':'…')+'</span>'
      +'<span class="nsz">'+(r.size?S._fmtSz(r.size):'—')+'</span>'
      +'</div>';
  }).join('');
  S._netl.innerHTML=html;
  S._netl.querySelectorAll('.netr').forEach(function(row){
    row.addEventListener('click',function(){
      var req=S.s.netReqs.find(function(r){return r.id===row.dataset.id;});
      if(req){S.s.netSel=req.id;S._showNetDetail(req);S._renderNetList();}
    });
  });
};

PDT.prototype._showNetDetail=function(req){
  var S=this,q=S.q;
  S._netd.classList.add('vis');
  var g=q('#ndg');
  g.innerHTML='<div class="ndr"><span class="ndk">URL</span><span class="ndv">'+S._esc(req.url)+'</span></div>'
    +'<div class="ndr"><span class="ndk">Method</span><span class="ndv">'+req.method+'</span></div>'
    +'<div class="ndr"><span class="ndk">Status</span><span class="ndv">'+req.status+(req.statusText?' '+req.statusText:'')+'</span></div>'
    +'<div class="ndr"><span class="ndk">Type</span><span class="ndv">'+req.type+'</span></div>'
    +'<div class="ndr"><span class="ndk">Duration</span><span class="ndv">'+(req.duration||'—')+'ms</span></div>'
    +'<div class="ndr"><span class="ndk">Size</span><span class="ndv">'+(req.size?S._fmtSz(req.size):'—')+'</span></div>';
  var rqh=q('#ndrq');
  rqh.innerHTML=Object.entries(req.rqH||{}).map(function(kv){return '<div class="ndr"><span class="ndk">'+S._esc(kv[0])+'</span><span class="ndv">'+S._esc(kv[1])+'</span></div>';}).join('')||'<span style="color:var(--t2);font-size:11px">No request headers captured</span>';
  var rsh=q('#ndrs');
  rsh.innerHTML=Object.entries(req.rsH||{}).map(function(kv){return '<div class="ndr"><span class="ndk">'+S._esc(kv[0])+'</span><span class="ndv">'+S._esc(kv[1])+'</span></div>';}).join('')||'<span style="color:var(--t2);font-size:11px">No response headers</span>';
  var pv=q('#ndpv'),body=req.preview||'';
  try{var p=JSON.parse(body);pv.textContent=JSON.stringify(p,null,2);}catch(e){pv.textContent=body||'(empty)';}
  q('#ndtm').innerHTML='<div class="ndr"><span class="ndk">Started</span><span class="ndv">'+new Date(req.ts).toTimeString().slice(0,12)+'</span></div>'
    +'<div class="ndr"><span class="ndk">Total</span><span class="ndv">'+(req.duration||0)+'ms</span></div>'
    +'<div style="height:4px;background:var(--acc);border-radius:2px;margin:6px 0;width:'+Math.min(100,Math.max(2,(req.duration||1)/10))+'%;min-width:4px"></div>';
};

/* ── STORAGE ───────────────────────────────────────────── */
PDT.prototype._renderLS=function(f){
  var S=this,g=S.q('#lsg'),rows=[],flt=(f||'').toLowerCase();
  try{for(var k in localStorage){if(!localStorage.hasOwnProperty(k))continue;if(flt&&k.toLowerCase().indexOf(flt)<0&&(localStorage[k]||'').toLowerCase().indexOf(flt)<0)continue;rows.push({k:k,v:localStorage[k]});}}catch(e){}
  if(!rows.length){g.innerHTML='<div class="mut">No entries</div>';return;}
  g.innerHTML=rows.map(function(r){return '<div class="sgr" data-k="'+S._esc(r.k)+'"><span class="sgk">'+S._esc(r.k)+'</span><span class="sgv">'+S._esc((r.v||'').slice(0,80))+'</span><span class="sgsz">'+(r.v||'').length+'B</span></div>';}).join('');
  g.querySelectorAll('.sgr').forEach(function(row){row.addEventListener('click',function(){S._lsShow(row.dataset.k);});});
};
PDT.prototype._lsShow=function(k){var S=this;S.s.storeKey=k;S.q('#lsek').value=k||'';S.q('#lsev').value=k?localStorage.getItem(k)||'':'';S.q('#lseb').classList.add('vis');S.q('#lsek').focus();};
PDT.prototype._lsSave=function(){var S=this,k=S.q('#lsek').value.trim(),v=S.q('#lsev').value;if(!k)return;if(S.s.storeKey&&S.s.storeKey!==k)localStorage.removeItem(S.s.storeKey);localStorage.setItem(k,v);S._lsHide();S._renderLS();};
PDT.prototype._lsDel=function(){var S=this;if(S.s.storeKey){localStorage.removeItem(S.s.storeKey);S._lsHide();S._renderLS();}};
PDT.prototype._lsHide=function(){this.q('#lseb').classList.remove('vis');this.s.storeKey=null;};

PDT.prototype._renderSS=function(f){
  var S=this,g=S.q('#ssg'),rows=[],flt=(f||'').toLowerCase();
  try{for(var k in sessionStorage){if(!sessionStorage.hasOwnProperty(k))continue;if(flt&&k.toLowerCase().indexOf(flt)<0&&(sessionStorage[k]||'').toLowerCase().indexOf(flt)<0)continue;rows.push({k:k,v:sessionStorage[k]});}}catch(e){}
  if(!rows.length){g.innerHTML='<div class="mut">No entries</div>';return;}
  g.innerHTML=rows.map(function(r){return '<div class="sgr" data-k="'+S._esc(r.k)+'"><span class="sgk">'+S._esc(r.k)+'</span><span class="sgv">'+S._esc((r.v||'').slice(0,80))+'</span><span class="sgsz">'+(r.v||'').length+'B</span></div>';}).join('');
  g.querySelectorAll('.sgr').forEach(function(row){row.addEventListener('click',function(){S._ssShow(row.dataset.k);});});
};
PDT.prototype._ssShow=function(k){var S=this;S.s.ssKey=k;S.q('#ssek').value=k||'';S.q('#ssev').value=k?sessionStorage.getItem(k)||'':'';S.q('#sseb').classList.add('vis');};
PDT.prototype._ssSave=function(){var S=this,k=S.q('#ssek').value.trim(),v=S.q('#ssev').value;if(!k)return;if(S.s.ssKey&&S.s.ssKey!==k)sessionStorage.removeItem(S.s.ssKey);sessionStorage.setItem(k,v);S._ssHide();S._renderSS();};
PDT.prototype._ssDel=function(){var S=this;if(S.s.ssKey){sessionStorage.removeItem(S.s.ssKey);S._ssHide();S._renderSS();}};
PDT.prototype._ssHide=function(){this.q('#sseb').classList.remove('vis');this.s.ssKey=null;};

PDT.prototype._renderCK=function(f){
  var S=this,g=S.q('#ckg'),flt=(f||'').toLowerCase();
  var ck=document.cookie.split(';').map(function(c){var p=c.trim().split('=');return{name:p[0],value:decodeURIComponent(p.slice(1).join('=')||'')};})
    .filter(function(c){return c.name&&(!flt||c.name.toLowerCase().indexOf(flt)>-1||c.value.toLowerCase().indexOf(flt)>-1);});
  if(!ck.length){g.innerHTML='<div class="mut">No cookies</div>';return;}
  g.innerHTML=ck.map(function(c){return '<div class="ckr"><span class="sgk">'+S._esc(c.name)+'</span><span class="sgv">'+S._esc(c.value.slice(0,40))+'</span><span style="color:var(--t2);font-size:10px">/</span><span style="color:var(--t2);font-size:10px">Session</span></div>';}).join('');
};

/* ── PERFORMANCE ───────────────────────────────────────── */
PDT.prototype._vitals=function(){
  var S=this,m={FCP:'—',LCP:'—',FID:'—',CLS:'—',TTFB:'—',TTI:'—'};
  function g(k,v){var n=parseFloat(v);if(isNaN(n))return 'na';if(k==='FCP')return n<1800?'good':n<3000?'ok':'bad';if(k==='LCP')return n<2500?'good':n<4000?'ok':'bad';if(k==='FID')return n<100?'good':n<300?'ok':'bad';if(k==='CLS')return n<0.1?'good':n<0.25?'ok':'bad';if(k==='TTFB')return n<200?'good':n<500?'ok':'bad';return 'na';}
  function rend(){S.q('#vitg').innerHTML=Object.entries(m).map(function(kv){return '<div class="vitc"><div class="vitl">'+kv[0]+'</div><div class="vitv '+g(kv[0],kv[1])+'">'+kv[1]+'</div></div>';}).join('');}
  try{
    new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.entryType==='largest-contentful-paint')m.LCP=e.startTime.toFixed(0)+'ms';});rend();}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.entryType==='first-input')m.FID=(e.processingStart-e.startTime).toFixed(0)+'ms';});rend();}).observe({type:'first-input',buffered:true});
    new PerformanceObserver(function(l){var cls=0;l.getEntries().forEach(function(e){if(!e.hadRecentInput)cls+=e.value;});m.CLS=cls.toFixed(3);rend();}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.name==='first-contentful-paint')m.FCP=e.startTime.toFixed(0)+'ms';});rend();}).observe({type:'paint',buffered:true});
  }catch(e){}
  try{var nt=performance.getEntriesByType('navigation')[0];if(nt){m.TTFB=nt.responseStart.toFixed(0)+'ms';m.TTI=nt.domInteractive.toFixed(0)+'ms';}}catch(e){}
  rend();
};
PDT.prototype._navTiming=function(){
  var S=this,el=S.q('#pfnv');
  try{
    var nt=performance.getEntriesByType('navigation')[0];
    if(!nt){el.innerHTML='<div class="mut">No navigation timing</div>';return;}
    var rows=[['DNS',nt.domainLookupStart,nt.domainLookupEnd],['TCP',nt.connectStart,nt.connectEnd],['Request',nt.requestStart,nt.responseStart],['Response',nt.responseStart,nt.responseEnd],['DOM Parse',nt.responseEnd,nt.domContentLoadedEventEnd],['Load',nt.domContentLoadedEventEnd,nt.loadEventEnd]];
    el.innerHTML=rows.map(function(r){return '<div class="pfmr"><span class="pmn">'+r[0]+'</span><span class="pmd">'+Math.round(r[2]-r[1])+'ms</span></div>';}).join('');
  }catch(e){el.innerHTML='<div class="mut">Unavailable</div>';}
};
PDT.prototype._pfSnap=function(){
  var S=this,el=S.q('#pfmk');
  try{
    var entries=performance.getEntriesByType('mark').concat(performance.getEntriesByType('measure')).sort(function(a,b){return a.startTime-b.startTime;});
    if(!entries.length){el.innerHTML='<div class="mut">No marks. Use performance.mark() / performance.measure().</div>';return;}
    el.innerHTML=entries.map(function(e){return '<div class="pfmr"><span class="pm'+(e.entryType==='mark'?'tm':'ms')+'">'+e.entryType.toUpperCase().slice(0,4)+'</span><span class="pmn">'+S._esc(e.name)+'</span>'+(e.duration?'<span class="pmd">'+e.duration.toFixed(2)+'ms</span>':'')+'<span class="pmt">'+e.startTime.toFixed(1)+'ms</span></div>';}).join('');
  }catch(e){}
};
PDT.prototype._pfClear=function(){try{performance.clearMarks();performance.clearMeasures();}catch(e){}this.q('#pfmk').innerHTML='<div class="mut">Cleared.</div>';};
PDT.prototype._pfRec=function(){
  var S=this,btn=S.q('#pfrec');
  S.s.perfRec=!S.s.perfRec;
  if(S.s.perfRec){performance.mark('pdt-start');btn.textContent='⏹ Stop Recording';btn.classList.add('rec');}
  else{performance.mark('pdt-end');try{performance.measure('pdt-recording','pdt-start','pdt-end');}catch(e){}btn.textContent='⏺ Start Recording';btn.classList.remove('rec');S._pfSnap();}
};

/* ── MUTATION OBSERVER ─────────────────────────────────── */
PDT.prototype._startMut=function(){
  var S=this;
  if(S.s.mutObs)S.s.mutObs.disconnect();
  S.s.mutObs=new MutationObserver(function(muts){
    if(!S.s.mutOn)return;
    muts.forEach(function(m){
      S.s.mutCnt++;
      var el=m.target,tag='';
      if(el.nodeType===1){tag=el.tagName.toLowerCase()+(el.id?'#'+el.id:el.className?'.'+String(el.className).split(' ')[0]:'');}
      else{tag='"'+(el.textContent||'').slice(0,20)+'"';}
      var det='';
      if(m.type==='attributes')det='['+m.attributeName+'] = "'+((el.getAttribute&&el.getAttribute(m.attributeName))||'')+'"';
      else if(m.type==='characterData')det='"'+(m.target.textContent||'').slice(0,40)+'"';
      else det=m.addedNodes.length+' added, '+m.removedNodes.length+' removed';
      S._addMut({type:m.type,tag:tag,det:det,ts:Date.now()});
    });
  });
  try{S.s.mutObs.observe(document.body,{attributes:true,childList:true,subtree:true,characterData:true});}catch(e){}
};
PDT.prototype._addMut=function(m){
  var S=this,list=S.q('#ml');
  if(list.querySelector('.mut'))list.innerHTML='';
  S.q('#mcnt').textContent=S.s.mutCnt+' mutations';
  var row=document.createElement('div');row.className='mutr';
  row.innerHTML='<span class="mtype '+m.type+'">'+m.type.toUpperCase().slice(0,4)+'</span>'
    +'<span class="mtgt">'+S._esc(m.tag)+'</span>'
    +'<div class="mdt">'+S._esc(m.det)+'</div>';
  list.insertBefore(row,list.firstChild);
  if(list.children.length>300)list.removeChild(list.lastChild);
};
PDT.prototype._mutToggle=function(){var S=this,btn=S.q('#mtog');S.s.mutOn=!S.s.mutOn;btn.textContent=S.s.mutOn?'● Observing':'○ Paused';btn.classList.toggle('off',!S.s.mutOn);};
PDT.prototype._mutClear=function(){var S=this;S.s.mutCnt=0;S.q('#ml').innerHTML='<div class="mut">Cleared.</div>';S.q('#mcnt').textContent='0 mutations';};

/* ── STACK / SERIALIZE ─────────────────────────────────── */
PDT.prototype._getStack=function(skip){
  try{throw new Error();}catch(e){
    return (e.stack||'').split('\n').slice(skip||3)
      .filter(function(l){return l.trim()&&l.indexOf('phantom-devtools')<0;})
      .slice(0,8).map(function(line){
        var m=line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)||
              line.match(/at\s+(.+?):(\d+):(\d+)/)||
              line.match(/(.+?)@(.+?):(\d+):(\d+)/);
        if(!m)return{fn:line.trim(),file:'',line:'',col:''};
        if(m.length===5)return{fn:m[1],file:m[2].split('/').slice(-2).join('/'),line:m[3],col:m[4]};
        return{fn:m[1],file:m[1].split('/').slice(-1)[0],line:m[2],col:m[3]};
      });
  }
};
PDT.prototype._ser=function(v,d){
  if(d===undefined)d=0;
  if(v===null)return{t:'null',v:'null'};
  if(v===undefined)return{t:'undefined',v:'undefined'};
  if(typeof v==='string')return{t:'string',v:v.slice(0,2000)};
  if(typeof v==='number')return{t:'number',v:v};
  if(typeof v==='boolean')return{t:'boolean',v:v};
  if(typeof v==='function')return{t:'function',v:'ƒ '+(v.name||'anonymous')+'()'};
  if(v instanceof Error)return{t:'error',v:v.message};
  if(v instanceof Element)return{t:'element',v:'<'+v.tagName.toLowerCase()+(v.id?'#'+v.id:'')+'>'};
  if(Array.isArray(v)){if(d>3)return{t:'array',v:'Array('+v.length+')',len:v.length};var S=this;return{t:'array',v:v.slice(0,50).map(function(x){return S._ser(x,d+1);}),len:v.length};}
  if(typeof v==='object'){if(d>3)return{t:'object',v:'[Object]'};try{var S2=this,keys=Object.keys(v).slice(0,50),e={};keys.forEach(function(k){e[k]=S2._ser(v[k],d+1);});return{t:'object',v:e,len:Object.keys(v).length};}catch(err){return{t:'object',v:'[Object]'};}}
  return{t:'primitive',v:String(v)};
};

/* ── CONSOLE LOG ───────────────────────────────────────── */
PDT.prototype._log=function(method,args,stack){
  var S=this;
  var NM={warn:'warn',error:'error',info:'info',debug:'debug',table:'table',group:'group',groupCollapsed:'group',groupEnd:'groupEnd'};
  var type=NM[method]||'log';
  if(type==='groupEnd'){if(S.s.groupStack.length)S.s.groupStack.pop();return;}
  var entry={id:Math.random().toString(36).slice(2),type:type,method:method,args:args,stack:stack||[],time:Date.now(),indent:S.s.groupStack.length};
  S.s.logs.push(entry);
  if(type==='error'){S.s.ec++;S._eb.style.display='';S._eb.textContent=S.s.ec;S._pip.style.display='';S._pip.textContent=S.s.ec;S._fab.classList.add('haserr');}
  if(type==='warn'){S.s.wc++;S._wb.style.display='';S._wb.textContent=S.s.wc;}
  if(type==='group')S.s.groupStack.push(entry.id);
  S._renderEntry(entry,true);S._updateCount();
};

PDT.prototype._renderEntry=function(entry,scroll){
  var S=this,st=S.s;
  if(st.filter!=='all'&&st.filter!==entry.type&&!(st.filter==='log'&&entry.type==='group'))return;
  if(st.tf&&S._argsText(entry.args).toLowerCase().indexOf(st.tf.toLowerCase())<0)return;
  var div=document.createElement('div');
  div.className='le '+entry.type;
  if(entry.indent>0)div.style.paddingLeft=(entry.indent*14)+'px';
  // console.table
  if(entry.method==='table'){
    var tb=document.createElement('div');tb.className='lbdy';tb.textContent='table';div.appendChild(tb);
    var tw=document.createElement('div');tw.className='ltbl';tw.appendChild(S._mkTable(entry.args[0]));div.appendChild(tw);
    S._la.appendChild(div);if(scroll)S._la.scrollTop=S._la.scrollHeight;return;
  }
  // group header
  if(entry.type==='group'){
    div.classList.add('grph');
    var ge=document.createElement('div');ge.className='lexp';ge.textContent='▶';
    var gb=document.createElement('div');gb.className='lbdy';gb.appendChild(S._renderArgs(entry.args));
    var gt=document.createElement('div');gt.className='ltm';gt.textContent=new Date(entry.time).toTimeString().slice(0,8);
    var gk=document.createElement('div');gk.className='lgc';
    ge.addEventListener('click',function(e){e.stopPropagation();var o=ge.classList.toggle('o');gk.classList.toggle('o',o);});
    div.appendChild(ge);div.appendChild(gb);div.appendChild(gt);div.appendChild(gk);
    S._la.appendChild(div);if(scroll)S._la.scrollTop=S._la.scrollHeight;return;
  }
  var hasStk=entry.stack&&entry.stack.length>0;
  var exp=document.createElement('div');exp.className='lexp';exp.textContent=hasStk?'▶':' ';
  if(hasStk)exp.addEventListener('click',function(e){e.stopPropagation();exp.classList.toggle('o');var sk=div.querySelector('.lsk');if(sk)sk.classList.toggle('o');});
  div.appendChild(exp);
  var body=document.createElement('div');body.className='lbdy';body.appendChild(S._renderArgs(entry.args));div.appendChild(body);
  var tm=document.createElement('div');tm.className='ltm';var d=new Date(entry.time);tm.textContent=d.toTimeString().slice(0,8)+'.'+String(d.getMilliseconds()).padStart(3,'0');div.appendChild(tm);
  if(hasStk){
    var sk=document.createElement('div');sk.className='lsk';
    sk.innerHTML=entry.stack.map(function(f){return '<div class="sf"><span class="sfat">at</span> <span class="sffn">'+S._esc(f.fn||'(anonymous)')+'</span>'+(f.file?' <span class="sfloc">'+S._esc(f.file)+(f.line?':'+f.line:'')+(f.col?':'+f.col:'')+'</span>':'')+'</div>';}).join('');
    div.appendChild(sk);
  }
  // Append into group if nested
  var pGrp=entry.indent>0?S._la.querySelector('.le.grph:last-of-type .lgc'):null;
  if(pGrp)pGrp.appendChild(div);else S._la.appendChild(div);
  if(scroll)S._la.scrollTop=S._la.scrollHeight;
};

PDT.prototype._mkTable=function(data){
  var S=this,tbl=document.createElement('table');tbl.className='ct';
  if(!data||typeof data!=='object'){var sp=document.createElement('span');sp.textContent=String(data);return sp;}
  var rows=Array.isArray(data)?data:Object.entries(data).map(function(kv){var r={};r['(index)']=kv[0];if(typeof kv[1]==='object'&&kv[1])Object.assign(r,kv[1]);else r.value=kv[1];return r;});
  if(!rows.length)return tbl;
  var cols=Array.from(new Set(rows.reduce(function(a,r){return a.concat(Object.keys(r));},[])));
  var thead=document.createElement('thead'),tr=document.createElement('tr');
  cols.forEach(function(c){var th=document.createElement('th');th.textContent=c;tr.appendChild(th);});thead.appendChild(tr);tbl.appendChild(thead);
  var tbody=document.createElement('tbody');
  rows.forEach(function(row){var tr2=document.createElement('tr');cols.forEach(function(c){var td=document.createElement('td');var v=row[c];td.textContent=v===null?'null':v===undefined?'':typeof v==='object'?JSON.stringify(v):String(v);tr2.appendChild(td);});tbody.appendChild(tr2);});
  tbl.appendChild(tbody);return tbl;
};

PDT.prototype._argsText=function(args){
  return (args||[]).map(function(a){if(!a||typeof a!=='object')return String(a);if(a.t==='string')return a.v;if(a.t==='object'||a.t==='array'){try{return JSON.stringify(a.v);}catch(e){}}return String(a.v);}).join(' ');
};
PDT.prototype._renderArgs=function(args){
  var S=this,frag=document.createDocumentFragment();
  (args||[]).forEach(function(a,i){if(i>0){var sp=document.createElement('span');sp.className='vp';sp.textContent=' ';frag.appendChild(sp);}frag.appendChild(S._mkVal(a,0));});
  return frag;
};
PDT.prototype._mkVal=function(v,depth){
  var S=this,wrap=document.createElement('span');wrap.className='ot';
  if(!v||typeof v!=='object'){wrap.textContent=String(v);return wrap;}
  var t=v.t,val=v.v,len=v.len;
  if(t==='null'){wrap.className+=' vnl';wrap.textContent='null';return wrap;}
  if(t==='undefined'){wrap.className+=' vnl';wrap.textContent='undefined';return wrap;}
  if(t==='string'){
    wrap.className+=' vs';
    if(typeof val==='string'&&val.length>200){var sh=document.createElement('span');sh.textContent=val.slice(0,200);var mx=document.createElement('span');mx.className='vnl';mx.textContent='…';mx.style.cursor='pointer';mx.title='Expand';mx.addEventListener('click',function(){sh.textContent=val;mx.remove();});wrap.appendChild(sh);wrap.appendChild(mx);}
    else wrap.textContent=val;
    return wrap;
  }
  if(t==='number'){wrap.className+=' vn';wrap.textContent=String(val);return wrap;}
  if(t==='boolean'){wrap.className+=' vb';wrap.textContent=String(val);return wrap;}
  if(t==='function'){wrap.className+=' vf';wrap.textContent=val;return wrap;}
  if(t==='element'){wrap.className+=' vt';wrap.textContent=val;return wrap;}
  if(t==='error'){wrap.className+=' ve';wrap.textContent=val;return wrap;}
  if(t==='array'||t==='object'){
    var isArr=t==='array';
    var items=isArr?val:typeof val==='object'&&val!==null?Object.entries(val):null;
    if(!items){wrap.className+=' vnl';wrap.textContent=isArr?'Array('+len+')':'[Object]';return wrap;}
    return S._mkExpandable(wrap,isArr?'[':'{',isArr?']':'}',items,len,depth,isArr);
  }
  wrap.className+=' vnl';wrap.textContent=String(val);return wrap;
};
PDT.prototype._mkExpandable=function(wrap,open,close,items,len,depth,isArr){
  var S=this;
  var tog=document.createElement('span');tog.className='ottog';tog.textContent='▶';
  var oSp=document.createElement('span');oSp.className='vp';oSp.textContent=open;
  var cSp=document.createElement('span');cSp.className='vp';cSp.textContent=close;
  var pv=document.createElement('span');pv.className='otpv';
  var prev=(isArr?items:items).slice(0,isArr?4:3);
  prev.forEach(function(item,i){
    if(i>0){var c=document.createElement('span');c.className='vp';c.textContent=', ';pv.appendChild(c);}
    if(!isArr){var k=document.createElement('span');k.className='vk';k.textContent=item[0];var col=document.createElement('span');col.className='vp';col.textContent=': ';pv.appendChild(k);pv.appendChild(col);pv.appendChild(S._mkVal(item[1],depth+1));}
    else pv.appendChild(S._mkVal(item,depth+1));
  });
  if(len>(isArr?4:3)){var mx=document.createElement('span');mx.className='vnl';mx.textContent=', …';pv.appendChild(mx);}
  var coll=document.createElement('span');coll.appendChild(oSp.cloneNode(true));coll.appendChild(pv);coll.appendChild(cSp.cloneNode(true));
  var ch=document.createElement('div');ch.className='otch';
  (isArr?items:items).forEach(function(item,idx){
    var row=document.createElement('div');row.className='otrw';
    var k=document.createElement('span');k.className=isArr?'oti':'otk';k.textContent=(isArr?idx:item[0])+': ';row.appendChild(k);
    row.appendChild(S._mkVal(isArr?item:item[1],depth+1));ch.appendChild(row);
  });
  if(len>items.length){var el=document.createElement('div');el.className='otrw vnl';el.textContent='… '+(len-items.length)+' more';ch.appendChild(el);}
  var exp=document.createElement('span');exp.appendChild(oSp.cloneNode(true));exp.appendChild(ch);exp.appendChild(cSp.cloneNode(true));exp.style.display='none';
  function doTog(e){if(e)e.stopPropagation();var o=tog.classList.toggle('o');ch.classList.toggle('o',o);coll.style.display=o?'none':'';exp.style.display=o?'':'none';}
  tog.addEventListener('click',doTog);coll.addEventListener('click',doTog);
  wrap.appendChild(tog);wrap.appendChild(coll);wrap.appendChild(exp);return wrap;
};
PDT.prototype._esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
PDT.prototype._setFilter=function(btn){this.sh.querySelectorAll('.fb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');this.s.filter=btn.dataset.f;this._rebuildLog();};
PDT.prototype._rebuildLog=function(){var S=this;S._la.innerHTML='';S.s.logs.forEach(function(e){S._renderEntry(e,false);});S._updateCount();};
PDT.prototype._updateCount=function(){this._mc.textContent=this.s.logs.length+' message'+(this.s.logs.length!==1?'s':'');};
PDT.prototype.clear=function(){var S=this;S.s.logs=[];S.s.ec=0;S.s.wc=0;S.s.groupStack=[];S._eb.style.display='none';S._wb.style.display='none';S._pip.style.display='none';S._fab.classList.remove('haserr');S._la.innerHTML='';S._updateCount();};

/* ── REPL ──────────────────────────────────────────────── */
PDT.prototype._repl=function(){
  var S=this,code=S._ri.value.trim();if(!code)return;
  S.s.replHist.unshift(code);S.s.replIdx=-1;
  S._log('log',[{t:'string',v:'> '+code}],[]);
  try{var r=(new Function('return ('+code+')'))();S._log('log',[S._ser(r,0)],[]);}
  catch(e){S._log('error',[{t:'error',v:e.message}],(e.stack||'').split('\n').slice(1,5).map(function(l){return{fn:l.trim(),file:'',line:'',col:''}}));}
  S._ri.value='';
};
PDT.prototype._rk=function(e){
  var S=this,h=S.s.replHist;
  if(e.key==='Enter'){S._repl();return;}
  if(e.key==='ArrowUp'){S.s.replIdx=Math.min(S.s.replIdx+1,h.length-1);S._ri.value=h[S.s.replIdx]||'';e.preventDefault();}
  if(e.key==='ArrowDown'){S.s.replIdx=Math.max(S.s.replIdx-1,-1);S._ri.value=S.s.replIdx>=0?h[S.s.replIdx]:'';e.preventDefault();}
};

/* ── DOM TREE ──────────────────────────────────────────── */
PDT.prototype._buildTree=function(){
  var S=this;S._dp.innerHTML='';
  S._renderNode(document.documentElement,S._dp,0);
};
PDT.prototype._renderNode=function(node,container,depth){
  var S=this;if(!node)return;
  if(node.nodeType===Node.TEXT_NODE){
    var txt=node.textContent.trim();if(!txt||txt.length<2)return;
    var row=document.createElement('div');row.className='dr';row.style.paddingLeft=(depth*14+6)+'px';
    row.innerHTML='<span class="dt"> </span><span class="tx">"'+S._esc(txt.slice(0,80))+(txt.length>80?'…':'')+'"</span>';
    row.addEventListener('click',function(){S._selectNode(node,row);});container.appendChild(row);return;
  }
  if(node.nodeType===Node.COMMENT_NODE){
    var row2=document.createElement('div');row2.className='dr';row2.style.paddingLeft=(depth*14+6)+'px';
    row2.innerHTML='<span class="dt"> </span><span class="cm">&lt;!-- '+S._esc(node.textContent.trim().slice(0,60))+' --&gt;</span>';
    container.appendChild(row2);return;
  }
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(node.id==='phantom-dt-host'||node.id==='phantom-pick-overlay')return;
  var tag=node.tagName.toLowerCase();
  var kids=Array.from(node.childNodes).filter(function(n){
    if(n.nodeType===Node.TEXT_NODE)return n.textContent.trim().length>1;
    return(n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.COMMENT_NODE)&&n.id!=='phantom-dt-host';
  });
  var hasKids=kids.length>0;
  var attrs=Array.from(node.attributes||[]).slice(0,6).map(function(a){
    return ' <span class="an">'+S._esc(a.name)+'</span>=<span class="av" data-attr="'+S._esc(a.name)+'">'+S._esc(a.value.slice(0,60))+'"</span>';
  }).join('');
  var row3=document.createElement('div');row3.className='dr';row3.style.paddingLeft=(depth*14+6)+'px';row3._node=node;
  var tog=document.createElement('span');tog.className='dt';tog.textContent=hasKids?'▶':' ';
  var lbl=document.createElement('span');
  lbl.innerHTML='<span class="tn">&lt;'+tag+'&gt;</span>'+attrs+(hasKids?'':'<span class="tc">&lt;/'+tag+'&gt;</span>');
  row3.appendChild(tog);row3.appendChild(lbl);container.appendChild(row3);
  // double-click attribute to edit
  lbl.querySelectorAll('.av').forEach(function(av){
    av.addEventListener('dblclick',function(e){
      e.stopPropagation();
      var aName=av.dataset.attr,old=node.getAttribute(aName)||'';
      var inp=document.createElement('input');inp.className='avei';inp.value=old;inp.style.width=Math.max(60,old.length*8)+'px';
      av.replaceWith(inp);inp.focus();inp.select();
      inp.addEventListener('blur',function(){node.setAttribute(aName,inp.value);S._buildTree();});
      inp.addEventListener('keydown',function(e2){if(e2.key==='Enter')inp.blur();if(e2.key==='Escape')S._buildTree();});
    });
  });
  // right-click context menu
  row3.addEventListener('contextmenu',function(e){e.preventDefault();S.s.ctxNode=node;S._showCtx(e.clientX,e.clientY);});
  if(hasKids){
    var cc=document.createElement('div');cc.className='dc';container.appendChild(cc);var built=false;
    tog.addEventListener('click',function(e){
      e.stopPropagation();var open=tog.classList.toggle('o');cc.classList.toggle('o',open);
      if(open&&!built){
        built=true;kids.forEach(function(c){S._renderNode(c,cc,depth+1);});
        var cl=document.createElement('div');cl.style.cssText='padding-left:'+(depth*14+20)+'px;font-family:var(--mono);font-size:12px;';
        cl.innerHTML='<span class="tc">&lt;/'+tag+'&gt;</span>';cc.appendChild(cl);
      }
    });
    row3.addEventListener('click',function(e){if(e.target===tog)return;tog.click();S._selectNode(node,row3);});
  }else{row3.addEventListener('click',function(){S._selectNode(node,row3);});}
};

/* ── DOM SEARCH ────────────────────────────────────────── */
PDT.prototype._sOpen=function(){this.q('#dsb').classList.add('vis');this.q('#dsi').focus();};
PDT.prototype._sClose=function(){
  var S=this;S.q('#dsb').classList.remove('vis');S.q('#dsi').value='';
  S.sh.querySelectorAll('.dr.sh,.dr.sc').forEach(function(r){r.classList.remove('sh','sc');});
  S.s.schM=[];S.s.schI=0;S.q('#dsc').textContent='';
};
PDT.prototype._search=function(q){
  var S=this;
  S.sh.querySelectorAll('.dr.sh,.dr.sc').forEach(function(r){r.classList.remove('sh','sc');});
  S.s.schM=[];S.s.schI=0;
  if(!q.trim()){S.q('#dsc').textContent='';return;}
  var ql=q.toLowerCase();
  S.sh.querySelectorAll('.dr').forEach(function(row){
    if(row._node&&row._node.nodeType===Node.ELEMENT_NODE){
      var el=row._node,outer=(el.outerHTML||'').toLowerCase();
      if(outer.indexOf(ql)>-1||el.textContent.toLowerCase().indexOf(ql)>-1){S.s.schM.push(row);row.classList.add('sh');}
    }
  });
  S._sUpdCnt();
  if(S.s.schM.length){S.s.schM[0].classList.add('sc');S.s.schM[0].scrollIntoView({block:'nearest'});}
};
PDT.prototype._sNav=function(dir){
  var S=this,m=S.s.schM;if(!m.length)return;
  m[S.s.schI].classList.remove('sc');
  S.s.schI=(S.s.schI+dir+m.length)%m.length;
  m[S.s.schI].classList.add('sc');m[S.s.schI].scrollIntoView({block:'nearest'});S._sUpdCnt();
};
PDT.prototype._sUpdCnt=function(){var S=this,m=S.s.schM;S.q('#dsc').textContent=m.length?(S.s.schI+1)+'/'+m.length:'0 results';};

/* ── SELECT NODE ───────────────────────────────────────── */
PDT.prototype._selectNode=function(node,rowEl){
  var S=this;
  S.sh.querySelectorAll('.dr.sel').forEach(function(r){r.classList.remove('sel');});
  if(rowEl)rowEl.classList.add('sel');
  S.s.node=node;
  if(node.nodeType!==Node.ELEMENT_NODE){S._bc.innerHTML='<span style="color:var(--t2)">Text node</span>';S._renderCS(null);S._renderBM(null);return;}
  var path=[],cur=node;
  while(cur&&cur.tagName){
    var id=cur.id?'#'+cur.id:'';
    var cl=cur.className&&typeof cur.className==='string'?'.'+cur.className.trim().split(/\s+/).slice(0,2).join('.'):'';
    path.unshift('<span class="bct">'+cur.tagName.toLowerCase()+S._esc(id+cl)+'</span>');cur=cur.parentElement;
  }
  S._bc.innerHTML=path.join('<span class="bcs"> › </span>');
  try{
    var prev=document.querySelector('.__pdt_sel');
    if(prev){prev.style.outline=prev.__pdt_orig||'';prev.classList.remove('__pdt_sel');}
    node.__pdt_orig=node.style.outline;node.style.outline='2px solid #0088ff';
    node.classList.add('__pdt_sel');node.scrollIntoView({block:'nearest',behavior:'smooth'});
  }catch(e){}
  S._renderCS(node);S._renderBM(node);
  var as=S.sh.querySelector('.stb.on');
  if(as){if(as.dataset.stab==='rules')S._renderRules(node);else if(as.dataset.stab==='events')S._renderEvents(node);else if(as.dataset.stab==='a11y')S._renderA11y(node);}
};

/* ── CSS RULES ─────────────────────────────────────────── */
PDT.prototype._renderRules=function(node){
  var S=this,el=S.q('#rlp');
  if(!node||node.nodeType!==Node.ELEMENT_NODE){el.innerHTML='<div class="mut">Select an element</div>';return;}
  var rules=[];
  try{Array.from(document.styleSheets).forEach(function(ss){
    try{Array.from(ss.cssRules||[]).forEach(function(rule){
      if(rule.selectorText){try{if(node.matches(rule.selectorText))rules.push({sel:rule.selectorText,text:rule.style.cssText,src:(ss.href?ss.href.split('/').slice(-1)[0]:'<inline>')});}catch(e){}}}); }catch(e){}
  });}catch(e){}
  if(!rules.length){el.innerHTML='<div class="mut">No matching CSS rules</div>';return;}
  el.innerHTML=rules.map(function(r){
    var decls=r.text.split(';').filter(function(d){return d.trim();}).map(function(d){var p=d.split(':');return '<div class="rld"><span class="rldp">'+S._esc((p[0]||'').trim())+'</span>: <span class="rldv">'+S._esc(p.slice(1).join(':').trim())+'</span></div>';}).join('');
    return '<div class="rlb"><div class="rls"><span>'+S._esc(r.sel)+'</span><span class="rlsrc">'+S._esc(r.src)+'</span></div>'+decls+'</div>';
  }).join('');
};

/* ── EVENT LISTENERS ───────────────────────────────────── */
PDT.prototype._renderEvents=function(node){
  var S=this,el=S.q('#evp');
  if(!node||node.nodeType!==Node.ELEMENT_NODE){el.innerHTML='<div class="mut">Select an element</div>';return;}
  var listeners={};
  try{if(typeof getEventListeners==='function'){Object.assign(listeners,getEventListeners(node));}}catch(e){}
  Array.from(node.attributes||[]).forEach(function(a){if(a.name.startsWith('on')){var t=a.name.slice(2);if(!listeners[t])listeners[t]=[];listeners[t].push({src:a.value,fromAttr:true});}});
  try{if(window.$&&window.$.data){var jq=window.$.data(node,'events')||{};Object.entries(jq).forEach(function(kv){if(!listeners[kv[0]])listeners[kv[0]]=[];kv[1].forEach(function(h){listeners[kv[0]].push({src:h.handler,jq:true});});});}}catch(e){}
  if(!Object.keys(listeners).length){el.innerHTML='<div class="mut">No event listeners detected.<br><small style="color:var(--t2)">Note: addEventListener() calls may not be accessible. Inline handlers are shown.</small></div>';return;}
  var html=Object.entries(listeners).map(function(kv){
    var items=kv[1].map(function(l){var src='';try{src=typeof l.listener==='function'?l.listener.toString().slice(0,80):l.src||'[native]';}catch(e){}return '<div class="evi">'+S._esc(src)+'<span class="evlc">'+(l.fromAttr?' [attr]':'')+(l.jq?' [jQuery]':'')+(l.useCapture?' [capture]':'')+'</span></div>';}).join('');
    return '<div class="evt">'+kv[0]+'</div>'+items;
  }).join('');
  el.innerHTML=html;
};

/* ── ACCESSIBILITY ─────────────────────────────────────── */
PDT.prototype._renderA11y=function(node){
  var S=this,el=S.q('#a1p');
  if(!node||node.nodeType!==Node.ELEMENT_NODE){el.innerHTML='<div class="mut">Select an element</div>';return;}
  var role=node.getAttribute('role')||node.tagName.toLowerCase();
  var label=node.getAttribute('aria-label')||node.getAttribute('aria-labelledby')||node.getAttribute('title')||node.getAttribute('alt')||node.textContent.trim().slice(0,40)||'—';
  var focusable=node.tabIndex>=0||['a','button','input','select','textarea'].includes(node.tagName.toLowerCase());
  var rows=[['Tag',node.tagName.toLowerCase()],['Role',role],['Accessible name',label],
    ['aria-level',node.getAttribute('aria-level')||'—'],['aria-expanded',node.getAttribute('aria-expanded')!=null?node.getAttribute('aria-expanded'):'—'],
    ['aria-hidden',node.getAttribute('aria-hidden')!=null?node.getAttribute('aria-hidden'):'—'],['aria-required',node.getAttribute('aria-required')!=null?node.getAttribute('aria-required'):'—'],
    ['Disabled',node.getAttribute('disabled')!=null||node.getAttribute('aria-disabled')==='true'?'Yes':'No'],
    ['Focusable',focusable?'Yes':'No'],['tabIndex',node.tabIndex!==-1?node.tabIndex:'—']];
  var issues=[];
  if(!node.getAttribute('alt')&&node.tagName==='IMG')issues.push('Image missing alt attribute');
  if(['button','a'].includes(node.tagName.toLowerCase())&&!node.getAttribute('aria-label')&&!node.textContent.trim())issues.push('Interactive element has no accessible name');
  if(node.getAttribute('aria-hidden')==='true'&&focusable)issues.push('aria-hidden on focusable element');
  el.innerHTML=rows.map(function(r){return '<div class="a1r"><span class="a1k">'+r[0]+'</span><span class="a1v">'+S._esc(String(r[1]))+'</span></div>';}).join('')
    +(issues.length?'<div style="margin-top:8px;padding:8px;border:1px solid var(--ebd);border-radius:3px;background:var(--ebg)"><div style="font-size:10px;color:var(--efg);margin-bottom:4px">ISSUES ('+issues.length+')</div>'+issues.map(function(i){return '<div style="font-size:11px;color:var(--efg);margin-bottom:3px">⚠ '+S._esc(i)+'</div>';}).join('')+'</div>':'<div style="margin-top:8px;padding:6px 8px;background:rgba(87,196,122,.1);border-radius:3px;font-size:11px;color:var(--grn)">✓ No obvious a11y issues</div>');
};

/* ── COMPUTED STYLES ───────────────────────────────────── */
var CPROPS=['display','position','width','height','min-width','max-width','min-height','max-height',
  'margin','margin-top','margin-right','margin-bottom','margin-left',
  'padding','padding-top','padding-right','padding-bottom','padding-left',
  'border','border-width','border-color','border-style','border-radius',
  'background','background-color','background-image',
  'color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-decoration',
  'flex','flex-direction','flex-wrap','justify-content','align-items','align-self','gap',
  'grid','grid-template-columns','grid-template-rows',
  'overflow','overflow-x','overflow-y','z-index','opacity','transform','transition','box-shadow',
  'cursor','pointer-events','visibility','white-space','text-overflow'];

PDT.prototype._renderCS=function(node){
  var S=this;
  if(!node||node.nodeType!==Node.ELEMENT_NODE){S._sr.innerHTML='<div class="mut">Select an element</div>';S.q('#ovc').textContent='';return;}
  var cs;try{cs=window.getComputedStyle(node);}catch(e){return;}
  S._sr.innerHTML='';
  var cRx=/^(#|rgb|hsl|rgba|hsla|oklch)/i,fv=(S.s.styleFilter||'').toLowerCase(),ov=0;
  CPROPS.forEach(function(prop){
    var cv=cs.getPropertyValue(prop);
    if(!cv||cv==='none'||cv==='normal')return;
    if(fv&&prop.indexOf(fv)<0&&cv.toLowerCase().indexOf(fv)<0)return;
    var iv=node.style.getPropertyValue(prop),dv=iv||cv;
    if(iv)ov++;
    var isC=cRx.test(dv.trim());
    var row=document.createElement('div');row.className='srow';row.dataset.prop=prop;
    var ps=document.createElement('span');ps.className='sprp';ps.textContent=prop;row.appendChild(ps);
    var vs=document.createElement('span');vs.className='sval'+(isC?' sw':'');
    if(isC)vs.style.setProperty('--_sw',dv);
    vs.textContent=dv;vs.contentEditable='true';vs.spellcheck=false;
    vs.addEventListener('focus',function(){try{var r=document.createRange();r.selectNodeContents(vs);var sel=S.sh.getSelection?S.sh.getSelection():window.getSelection();if(sel){sel.removeAllRanges();sel.addRange(r);}}catch(e){}});
    vs.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();vs.blur();}
      if(e.key==='Escape'){vs.textContent=iv||cv;vs.classList.remove('inv');vs.blur();}
      if(e.key==='Tab'){e.preventDefault();var rows2=Array.from(S._sr.querySelectorAll('.sval'));var idx=rows2.indexOf(vs);if(idx<rows2.length-1)rows2[idx+1].focus();}
    });
    vs.addEventListener('input',function(){var nv=vs.textContent.trim();try{node.style.setProperty(prop,nv);vs.classList.remove('inv');if(cRx.test(nv)){vs.classList.add('sw');vs.style.setProperty('--_sw',nv);}else vs.classList.remove('sw');}catch(e){vs.classList.add('inv');}});
    vs.addEventListener('blur',function(){
      var nv=vs.textContent.trim();
      if(!nv){node.style.removeProperty(prop);vs.textContent=cv;vs.classList.remove('inv');}
      else{try{node.style.setProperty(prop,nv);vs.classList.remove('inv');if(cRx.test(nv)){vs.classList.add('sw');vs.style.setProperty('--_sw',nv);}}catch(e){vs.classList.add('inv');}}
      var geo=['width','height','margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left'];
      if(geo.indexOf(prop)>-1)S._renderBM(node);
    });
    row.appendChild(vs);
    var del=document.createElement('button');del.className='sdl';del.textContent='×';del.title='Remove override';
    del.addEventListener('click',function(){node.style.removeProperty(prop);S._renderCS(node);S._renderBM(node);});
    row.appendChild(del);S._sr.appendChild(row);
  });
  if(!S._sr.children.length)S._sr.innerHTML='<div class="mut">No matching properties</div>';
  S.q('#ovc').textContent=ov?ov+' overrides':'';
};

/* ── BOX MODEL ─────────────────────────────────────────── */
PDT.prototype._renderBM=function(node){
  var S=this;
  if(!node||node.nodeType!==Node.ELEMENT_NODE){S._bd2.innerHTML='<div class="mut" style="padding:0">No element selected</div>';return;}
  var cs,rect;try{cs=window.getComputedStyle(node);rect=node.getBoundingClientRect();}catch(e){return;}
  var mt=cs.marginTop,mr=cs.marginRight,mb=cs.marginBottom,ml=cs.marginLeft;
  var pt=cs.paddingTop,pr=cs.paddingRight,pb=cs.paddingBottom,pl=cs.paddingLeft;
  var bt=cs.borderTopWidth,brr=cs.borderRightWidth,bb=cs.borderBottomWidth,bl2=cs.borderLeftWidth;
  var w=Math.round(rect.width),h=Math.round(rect.height);
  function v(t,r,b,l){return '<div class="bxv bxt">'+t+'</div><div class="bxv bxr">'+r+'</div><div class="bxv bxbt">'+b+'</div><div class="bxv bxl">'+l+'</div>';}
  S._bd2.innerHTML='<div class="bx bxm"><span class="bx-lbl">margin</span>'+v(mt,mr,mb,ml)+'<div class="bx bxb"><span class="bx-lbl">border</span>'+v(bt,brr,bb,bl2)+'<div class="bx bxp"><span class="bx-lbl">padding</span>'+v(pt,pr,pb,pl)+'<div class="bx bxc"><div class="bxd">'+w+' × '+h+'</div></div></div></div></div>';
};

/* ── CSS SELECTOR ──────────────────────────────────────── */
PDT.prototype._runSel=function(val){
  var S=this;S._clrSel();
  if(!val.trim()){S._csi.className='';S._sct.textContent='—';return;}
  try{
    var m=Array.from(document.querySelectorAll(val)).filter(function(el){return el.id!=='phantom-dt-host'&&!el.closest('#phantom-dt-host');});
    S.s.selMatch=m;S._csi.classList.remove('bad');S._csi.classList.toggle('ok',m.length>0);
    S._sct.textContent=m.length+' match'+(m.length!==1?'es':'');
    m.forEach(function(el){el.__pdt_so=el.style.outline;el.style.outline='2px solid rgba(255,200,0,.9)';el.classList.add('__pdt_match');});
    S.sh.querySelectorAll('.dr').forEach(function(row){if(row._node&&m.indexOf(row._node)>-1)row.classList.add('hl');});
    if(m[0])try{m[0].scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}
  }catch(e){S._csi.classList.remove('ok');S._csi.classList.add('bad');S._sct.textContent='invalid';}
};
PDT.prototype._clrSel=function(){
  document.querySelectorAll('.__pdt_match').forEach(function(el){el.style.outline=el.__pdt_so||'';el.classList.remove('__pdt_match');});
  this.sh.querySelectorAll('.dr.hl').forEach(function(r){r.classList.remove('hl');});
};

/* ── PICKER ────────────────────────────────────────────── */
PDT.prototype._picker=function(){
  var S=this;S.s.picking=!S.s.picking;
  S.q('#pkb').classList.toggle('on',S.s.picking);S.q('#pkb2').classList.toggle('on',S.s.picking);
  S._ov.style.display=S.s.picking?'block':'none';
  if(!S.s.picking)S._hl.style.display='none';
};
PDT.prototype._elAt=function(x,y){
  this._ov.style.pointerEvents='none';
  var el=document.elementFromPoint(x,y);
  this._ov.style.pointerEvents='';
  if(!el||el.id==='phantom-dt-host'||(el.closest&&el.closest('#phantom-dt-host')))return null;
  return el;
};

/* ── CONTEXT MENU ──────────────────────────────────────── */
PDT.prototype._showCtx=function(x,y){this._ctx.style.cssText='display:block;left:'+x+'px;top:'+y+'px';};
PDT.prototype._hideCtx=function(){this._ctx.style.display='none';};
PDT.prototype._ctx_act=function(a){
  var S=this,node=S.s.ctxNode||S.s.node;S._hideCtx();if(!node)return;
  if(a==='sel')try{navigator.clipboard.writeText(S._getCSSSelector(node));}catch(e){}
  if(a==='html')try{navigator.clipboard.writeText(node.outerHTML);}catch(e){}
  if(a==='txt')try{navigator.clipboard.writeText(node.textContent);}catch(e){}
  if(a==='scr')node.scrollIntoView({behavior:'smooth',block:'center'});
  if(a==='foc')try{node.focus();}catch(e){}
  if(a==='exp')S._expandAll(node);
  if(a==='ins'){S._log('log',[S._ser(node,0)],[]);S._tab('console');}
};
PDT.prototype._getCSSSelector=function(el){
  var path=[],cur=el;
  while(cur&&cur.nodeType===Node.ELEMENT_NODE){
    var sel=cur.tagName.toLowerCase();
    if(cur.id){path.unshift('#'+cur.id);break;}
    var cls=Array.from(cur.classList).slice(0,2).join('.');if(cls)sel+='.'+cls;
    var sibs=cur.parentElement?Array.from(cur.parentElement.children).filter(function(s){return s.tagName===cur.tagName;}):[];
    if(sibs.length>1)sel+=':nth-of-type('+(sibs.indexOf(cur)+1)+')';
    path.unshift(sel);cur=cur.parentElement;
  }
  return path.join(' > ');
};
PDT.prototype._expandAll=function(node){
  var S=this;
  S.sh.querySelectorAll('.dr').forEach(function(row){
    if(row._node===node||(row._node&&node.contains&&node.contains(row._node))){var t=row.querySelector('.dt');if(t&&!t.classList.contains('o'))t.click();}
  });
};

/* ── EXPAND TO NODE ────────────────────────────────────── */
PDT.prototype._expandTo=function(el){
  var S=this,path=[],cur=el;
  while(cur&&cur.tagName){path.unshift(cur);cur=cur.parentElement;}
  path.forEach(function(a){S.sh.querySelectorAll('.dr').forEach(function(row){if(row._node===a){var t=row.querySelector('.dt');if(t&&!t.classList.contains('o'))t.click();}});});
  setTimeout(function(){S.sh.querySelectorAll('.dr').forEach(function(row){if(row._node===el){row.scrollIntoView({block:'center'});S._selectNode(el,row);}});},60);
};

/* ── DESTROY ───────────────────────────────────────────── */
PDT.prototype.destroy=function(){
  var S=this;
  if(S._origC){['log','warn','error','info','debug','table','dir','assert','count','clear','group','groupCollapsed','groupEnd','time','timeEnd','timeLog'].forEach(function(m){if(S._origC[m])console[m]=S._origC[m];});}
  if(S.s.mutObs)S.s.mutObs.disconnect();
  [S._host,S._oSt,S._ov,S._hl].forEach(function(el){if(el&&el.parentNode)el.parentNode.removeChild(el);});
  root.PhantomDevTools=null;
};

/* ── EXPORT ────────────────────────────────────────────── */
var inst=new PDT();
root.PhantomDevTools={
  init:function(o){return inst.init(o);},
  open:function(){return inst.open();},
  close:function(){return inst.close();},
  toggle:function(){return inst.toggle();},
  clear:function(){return inst.clear();},
  destroy:function(){return inst.destroy();}
};

// data-autoload
var scripts=document.querySelectorAll('script[src*="phantom-devtools"]');
for(var i=0;i<scripts.length;i++){
  if(scripts[i].hasAttribute('data-autoload')){
    var at=function(k,d){var v=scripts[i].getAttribute(k);return v!==null?v:d;};
    root.PhantomDevTools.init({position:at('data-position','bottom'),height:parseInt(at('data-height','340')),
      width:parseInt(at('data-width','500')),open:at('data-open','false')==='true',intercept:at('data-intercept','true')==='true'});
    break;
  }
}
}(window));
