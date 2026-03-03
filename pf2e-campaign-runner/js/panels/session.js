var PanelSession=(function(){
function escH(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
var sessionNPCTags=[];
function renderHistory(rs){
  var el=document.getElementById("sessionHistory");
  var sessions=rs.sessions||[];
  if(!sessions.length){el.innerHTML="<p class=text-dim>No sessions saved yet.</p>";return;}
  el.innerHTML=sessions.slice().reverse().map(function(s){
    return "<div class=session-history-item><div class=shi-title>"+escH(s.title||"Untitled")+"</div><div class=shi-meta>"+(s.date||"")+" · Act "+(s.actNumber||"?")+(s.npcTags&&s.npcTags.length?" · "+s.npcTags.slice(0,3).map(escH).join(", "):"")+"</div></div>";
  }).join("");
}
function renderMilestones(c,rs){
  var el=document.getElementById("milestoneTracker");
  if(!c.acts){el.innerHTML="";return;}
  var html="";
  c.acts.forEach(function(act){
    html+="<div style=margin-bottom:.7rem><div style=font-family:var(--font-display);font-size:.72rem;color:var(--gold);margin-bottom:.25rem>Act "+act.number+": "+escH(act.title||"")+"</div>";
    (act.milestones||[]).forEach(function(ms,i){
      var key=act.number+"-"+i;
      var checked=rs.milestones[key];
      html+="<div class=milestone-item><div class="mi-check"+(checked?" checked":""")+"" data-key="+key+">"+(checked?"v":"")+"</div><div class="mi-text"+(checked?" checked":"")+"">"+escH(ms)+"</div></div>";
    });
    html+="</div>";
  });
  el.innerHTML=html;
  el.querySelectorAll(".mi-check").forEach(function(ch){
    ch.addEventListener("click",function(){
      var k=this.dataset.key;
      RunnerState.setMilestone(k,!RunnerState.getRunState().milestones[k]);
      renderMilestones(RunnerState.getCampaign(),RunnerState.getRunState());
    });
  });
}
function renderTags(){
  var el=document.getElementById("sessionNPCTags");
  el.innerHTML=sessionNPCTags.map(function(t){return"<span class=tag-item>"+escH(t)+" <span class=tag-remove data-tag=""+escH(t)+"">&times;</span></span>";}).join("");
  el.querySelectorAll(".tag-remove").forEach(function(btn){btn.addEventListener("click",function(){sessionNPCTags=sessionNPCTags.filter(function(x){return x!==this.dataset.tag;}.bind(this));renderTags();}.bind(btn));});
}
function populateActSelect(c){
  var sel=document.getElementById("sessionActSelect");sel.innerHTML="";
  if(c.acts){c.acts.forEach(function(a){var o=document.createElement("option");o.value=a.number;o.textContent="Act "+a.number+": "+a.title;sel.appendChild(o);});}
}
function init(c){
  populateActSelect(c);
  var today=new Date().toISOString().split("T")[0];
  document.getElementById("sessionDate").value=today;
  document.getElementById("sessionNPCInput").addEventListener("keydown",function(e){
    if(e.key==="Enter"&&this.value.trim()){sessionNPCTags.push(this.value.trim());this.value="";renderTags();}
  });
  document.getElementById("btnNewSession").onclick=function(){
    document.getElementById("sessionTitleInput").value="";
    document.getElementById("sessionRecap").value="";
    document.getElementById("sessionThreadsOpened").value="";
    document.getElementById("sessionThreadsClosed").value="";
    document.getElementById("sessionSurprise").value="";
    document.getElementById("sessionDate").value=today;
    sessionNPCTags=[];renderTags();
    document.getElementById("scSaveStatus").textContent="";
  };
  document.getElementById("btnSaveSession").onclick=function(){
    var rs=RunnerState.getRunState();
    var sessions=rs.sessions||[];
    var session={
      id:Date.now(),
      title:document.getElementById("sessionTitleInput").value||"Session "+(sessions.length+1),
      actNumber:parseInt(document.getElementById("sessionActSelect").value)||1,
      date:document.getElementById("sessionDate").value,
      recap:document.getElementById("sessionRecap").value,
      npcTags:sessionNPCTags.slice(),
      threadsOpened:document.getElementById("sessionThreadsOpened").value,
      threadsClosed:document.getElementById("sessionThreadsClosed").value,
      surprise:document.getElementById("sessionSurprise").value,
    };
    RunnerState.saveSession(session);
    var count=(RunnerState.getRunState().sessions||[]).length;
    document.getElementById("sessionBadge").textContent="Session "+count;
    document.getElementById("scSaveStatus").textContent="Saved!";
    setTimeout(function(){document.getElementById("scSaveStatus").textContent="";},2000);
    renderHistory(RunnerState.getRunState());
    PanelDashboard.render(RunnerState.getCampaign(),RunnerState.getRunState());
    RunnerUI.toast("Session saved","success");
  };
}
function render(c,rs){
  populateActSelect(c);
  document.getElementById("sessionBadge").textContent="Session "+(rs.sessions?rs.sessions.length:0);
  renderHistory(rs);
  renderMilestones(c,rs);
}
return{init:init,render:render};
})();
