var PanelActs=(function(){
function escH(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function diffCls(d){var m={low:"low",moderate:"moderate",severe:"severe",extreme:"extreme",trivial:"trivial"};return m[(d||"").toLowerCase()]||"moderate";}
function buildActPanel(act,actIdx){
  var id="panel-act-"+act.number;
  var html="<div class=act-panel-header><span class=act-num-badge>Act "+act.number+"</span><span class=act-title-text>"+escH(act.title)+"</span></div>";
  html+="<div class=act-location>"+escH(act.location||"")+"</div>";
  html+="<div class=act-levels>Levels "+act.levelStart+"-"+act.levelEnd+"</div>";
  html+="<div class=act-summary>"+escH(act.summary||"")+"</div>";
  html+="<div class=act-grid>";
  html+="<div class=act-section><div class=as-label>Act Encounters</div>";
  if(act.actEncounters){act.actEncounters.forEach(function(enc){
    var crList=(enc.creatures||[]).map(function(cr){return(cr.count&&cr.count>1?cr.count+"x ":"")+escH(cr.name);}).join(", ");
    html+="<div class=encounter-card><div class=ec-header><span class="ec-diff "+diffCls(enc.difficulty)+"">"+(enc.difficulty||"?")+"</span><span class=ec-name>"+escH(enc.label||"Encounter")+"</span></div>";
    if(crList)html+="<div class=ec-creatures>"+crList+"</div>";
    if(enc.totalXP)html+="<div class=ec-xp>XP Budget: "+enc.totalXP+"</div>";
    html+="<div class=ec-btn-row><button class=ec-btn data-act="+act.number+" data-enc="+actIdx+"-"+act.actEncounters.indexOf(enc)+" onclick="RunnerUI.showPanel(\"initiative\");">Send to Initiative</button>";
    if(enc.creatures&&enc.creatures.length){html+="<button class=ec-btn onclick="PanelActs.showStatBlocks("+JSON.stringify(enc.creatures)+")">Stat Blocks</button>";}
    html+="</div></div>";
  });}
  html+="</div>";
  html+="<div class=act-section><div class=as-label>Milestones</div>";
  if(act.milestones){act.milestones.forEach(function(ms,i){
    var key=act.number+"-"+i;
    var checked=RunnerState.getRunState().milestones[key];
    html+="<div class=milestone-item><div class="mi-check"+(checked?" checked":"")+"" data-key="+key+">"+(checked?"v":"")+"</div><div class="mi-text"+(checked?" checked":"")+"">"+escH(ms)+"</div></div>";
  });}
  html+="</div>";
  if(act.sideQuests&&act.sideQuests.length){
    html+="<div class=act-section><div class=as-label>Side Quests</div>";
    act.sideQuests.forEach(function(sq){html+="<div class=sq-item><div class=sq-title>"+escH(sq.title)+"</div><div class=sq-desc>"+escH(sq.desc||"")+"</div><div style=font-size:.75rem;color:var(--gold);margin-top:.18rem>"+escH(sq.reward||"")+"</div></div>";});
    html+="</div>";
  }
  if(act.twist){
    html+="<div class=act-section><div class=as-label>Plot Twist</div><div class=twist-card><div class=tc-label>Twist — "+escH(act.twist.timing||"")+"</div><div class=tc-title>"+escH(act.twist.name||"")+"</div><div class=tc-body>"+escH(act.twist.description||"")+"</div></div></div>";
  }
  if(act.boss){
    var boss=act.boss;
    html+="<div class=act-section full-width><div class=as-label>Act Boss</div><div class=boss-card>";
    html+="<div class=boss-name>"+escH(boss.name)+"</div><div class=boss-creature>"+escH(boss.creature||"")+"</div>";
    if(boss.setup){html+="<div class=boss-section><div class=boss-label>Setup</div>"+escH(boss.setup)+"</div>";}
    if(boss.phase2){html+="<div class=boss-section><div class=boss-label>Phase 2</div>"+escH(boss.phase2)+"</div>";}
    if(boss.tactics){html+="<div class=boss-section><div class=boss-label>Tactics</div>"+escH(boss.tactics)+"</div>";}
    if(boss.statBlock){html+="<div class=ec-btn-row style=margin-top:.55rem><button class=ec-btn onclick="PanelActs.showStatBlocks(["+JSON.stringify({name:boss.name,statBlock:boss.statBlock,count:1})+"])">View Stat Block</button></div>";}
    html+="</div></div>";
  }
  html+="</div>";
  return html;
}
function render(c,rs){
  var dp=document.getElementById("dynamicPanels");
  var actsNav=document.getElementById("actsNav");
  dp.innerHTML="";actsNav.innerHTML="";
  if(!c.acts)return;
  c.acts.forEach(function(act,i){
    var panel=document.createElement("div");
    panel.className="panel";panel.id="panel-act-"+act.number;
    panel.innerHTML=buildActPanel(act,i);
    dp.appendChild(panel);
    panel.querySelectorAll(".mi-check").forEach(function(ch){
      ch.addEventListener("click",function(){var k=this.dataset.key;RunnerState.setMilestone(k,!RunnerState.getRunState().milestones[k]);render(RunnerState.getCampaign(),RunnerState.getRunState());PanelSession.render(RunnerState.getCampaign(),RunnerState.getRunState());});
    });
    var btn=document.createElement("button");
    btn.className="nav-item";btn.dataset.panel="act-"+act.number;
    btn.innerHTML="<span class=nav-icon>"+act.number+"</span>Act "+act.number+": "+escH(act.title.slice(0,22)+(act.title.length>22?"...":""));
    actsNav.appendChild(btn);
  });
}
function showStatBlocks(creatures){
  var html="<div class=modal-title>Stat Blocks</div>";
  (Array.isArray(creatures)?creatures:[creatures]).forEach(function(cr){
    var sb=cr.statBlock||{};
    html+="<div class=stat-block style=margin-bottom:1rem>";
    html+="<div class=sb-name>"+escH(cr.name)+"</div>";
    html+="<div class=sb-type>Level "+escH(sb.level||"?")+" "+escH((sb.traits||[]).join(", "))+"</div>";
    html+="<div class=sb-divider></div>";
    html+="<div class=sb-row><span class=sb-key>AC</span><span class=sb-val>"+escH(sb.ac||"?")+"</span></div>";
    html+="<div class=sb-row><span class=sb-key>HP</span><span class=sb-val>"+escH(sb.hp||"?")+"</span></div>";
    if(sb.saves){html+="<div class=sb-saves>";var saves=sb.saves;["fort","ref","will"].forEach(function(k){html+="<div class=sb-save-item><span class=sb-save-label>"+k.toUpperCase()+"</span><span class=sb-save-val>"+escH(saves[k]||"?")+"</span></div>";});html+="</div>";}
    html+="<div class=sb-row><span class=sb-key>Perception</span><span class=sb-val>"+escH(sb.perception||"?")+"</span></div>";
    html+="<div class=sb-divider></div>";
    if(sb.tactics){html+="<div class=sb-ability><strong>Tactics:</strong> "+escH(sb.tactics)+"</div>";}
    if(sb.actions){sb.actions.forEach(function(a){html+="<div class=sb-ability><strong>"+escH(a.name)+" ["+escH(a.actions)+"]</strong> "+(a.damage?escH(a.damage):"")+" "+(a.traits&&a.traits.length?"("+a.traits.map(escH).join(", ")+")":"")+"</div>";});}
    html+="</div>";
  });
  RunnerUI.showModal(html);
}
return{render:render,showStatBlocks:showStatBlocks};
})();
