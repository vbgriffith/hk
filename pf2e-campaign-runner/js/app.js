/* PF2e Campaign Runner - Main App */
var RunnerUI = (function(){
  var activePanel = "dashboard";
  function showPanel(id){
    document.querySelectorAll(".panel").forEach(function(p){p.classList.remove("active");});
    document.querySelectorAll(".nav-item").forEach(function(n){n.classList.remove("active");});
    var panel = document.getElementById("panel-"+id);
    if(panel){panel.classList.add("active");}
    document.querySelectorAll(".nav-item[data-panel]").forEach(function(n){if(n.dataset.panel===id)n.classList.add("active");});
    activePanel = id;
    var c = RunnerState.getCampaign();
    var rs = RunnerState.getRunState();
    if(id==="dashboard")PanelDashboard.render(c,rs);
    else if(id==="villain")PanelVillain.render(c,rs);
    else if(id==="factions")PanelFactions.render(c,rs);
    else if(id==="npcs")PanelNPCs.render(c,rs);
    else if(id==="session")PanelSession.render(c,rs);
    else if(id==="initiative")PanelInitiative.render(c,rs);
    else if(id==="loot")PanelLoot.render(c,rs);
  }
  function showModal(html){
    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").classList.remove("hidden");
  }
  function hideModal(){document.getElementById("modal").classList.add("hidden");}
  function toast(msg, type){
    var t = document.createElement("div");
    t.className = "toast" + (type ? " toast-"+type : "");
    t.textContent = msg;
    document.getElementById("toastContainer").appendChild(t);
    setTimeout(function(){t.style.opacity="0";t.style.transition="opacity .35s";setTimeout(function(){t.remove();},400);}, 2800);
  }
  return {showPanel:showPanel, showModal:showModal, hideModal:hideModal, toast:toast};
})();

function escHtml(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

function loadCampaign(campaign){
  try{
    if(!campaign||!campaign.villain){throw new Error("Invalid campaign: missing required fields.");}
    RunnerState.setCampaign(campaign);
    initApp(campaign);
  } catch(e){
    showLoadError("Campaign load failed: "+e.message);
  }
}

function initApp(c){
  document.getElementById("loadScreen").classList.remove("active");
  document.getElementById("appScreen").classList.add("active");
  var rs = RunnerState.getRunState();
  PanelActs.render(c, rs);
  PanelSession.init(c);
  PanelInitiative.init(c);
  PanelNPCs.init();
  document.querySelectorAll(".nav-item[data-panel]").forEach(function(btn){
    btn.addEventListener("click", function(){RunnerUI.showPanel(this.dataset.panel);});
  });
  RunnerUI.showPanel("dashboard");
  document.getElementById("btnLoadNew").onclick = function(){
    if(confirm("Load a new campaign? Unsaved state will be lost.")){location.reload();}
  };
  document.getElementById("btnExportNotes").onclick = exportNotes;
  document.getElementById("modalClose").onclick = RunnerUI.hideModal;
  document.getElementById("modal").addEventListener("click",function(e){if(e.target===this)RunnerUI.hideModal();});
}

function exportNotes(){
  var c = RunnerState.getCampaign();
  var rs = RunnerState.getRunState();
  if(!c)return;
  var lines = ["# "+((c.base&&c.base.title)||"Campaign")+" — GM Notes",""];
  if(rs.globalNotes){lines.push("## Global Notes");lines.push(rs.globalNotes);lines.push("");}
  if(rs.villainNotes){lines.push("## Villain Notes");lines.push(rs.villainNotes);lines.push("");}
  if(Object.keys(rs.factionNotes).length){lines.push("## Faction Notes");Object.keys(rs.factionNotes).forEach(function(k){if(rs.factionNotes[k])lines.push("### "+k+"\n"+rs.factionNotes[k]);});lines.push("");}
  if(Object.keys(rs.npcNotes).length){lines.push("## NPC Notes");Object.keys(rs.npcNotes).forEach(function(k){if(rs.npcNotes[k])lines.push("### "+k+"\n"+rs.npcNotes[k]);});lines.push("");}
  if(rs.sessions&&rs.sessions.length){lines.push("## Session Log");rs.sessions.forEach(function(s){lines.push("### "+s.title+" ("+s.date+")");if(s.recap)lines.push(s.recap);lines.push("");});}
  var blob = new Blob([lines.join("\n")],{type:"text/markdown"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ((c.base&&c.base.title)||"campaign")+"-notes.md";
  a.click();
  RunnerUI.toast("Notes exported!","success");
}

function showLoadError(msg){
  var el = document.getElementById("loadError");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(function(){el.classList.add("hidden");},5000);
}

document.addEventListener("DOMContentLoaded", function(){
  var didLoad = RunnerState.load();
  var c = RunnerState.getCampaign();
  if(didLoad && c){ initApp(c); return; }
  document.getElementById("btnLoadFile").onclick = function(){
    document.getElementById("fileInput").click();
  };
  document.getElementById("fileInput").onchange = function(e){
    var file = e.target.files[0]; if(!file)return;
    var reader = new FileReader();
    reader.onload = function(ev){
      try{ loadCampaign(JSON.parse(ev.target.result)); }
      catch(err){ showLoadError("JSON parse error: "+err.message); }
    };
    reader.readAsText(file);
  };
  document.getElementById("btnLoadClipboard").onclick = function(){
    document.getElementById("pasteZone").classList.toggle("hidden");
  };
  document.getElementById("btnPasteConfirm").onclick = function(){
    try{
      var txt = document.getElementById("pasteArea").value.trim();
      loadCampaign(JSON.parse(txt));
    } catch(e){ showLoadError("Parse error: "+e.message); }
  };
  document.getElementById("btnPasteCancel").onclick = function(){
    document.getElementById("pasteZone").classList.add("hidden");
  };
  document.getElementById("btnLoadDemo").onclick = function(){
    if(typeof DEMO_CAMPAIGN !== "undefined"){ loadCampaign(DEMO_CAMPAIGN); }
    else{ showLoadError("Demo data not found."); }
  };
});
