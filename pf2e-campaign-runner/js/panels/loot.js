var PanelLoot=(function(){
function escH(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
var activeAct=null;
function renderActList(c){
  var el=document.getElementById("lootActsList");el.innerHTML="";
  if(!c.rewards){el.innerHTML="<p class=text-dim>No reward data.</p>";return;}
  c.rewards.forEach(function(r){
    var act=c.acts&&c.acts.find(function(a){return a.number===r.act;});
    var btn=document.createElement("button");
    btn.className="loot-act-btn"+(activeAct===r.act?" active":"");
    btn.innerHTML="<strong>Act "+r.act+"</strong><span class=lab-levels>"+(act?"Levels "+act.levelStart+"-"+act.levelEnd:"")+"</span>";
    btn.onclick=function(){activeAct=r.act;renderActList(c);renderHoard(c,r.act);};
    el.appendChild(btn);
  });
}
function renderHoard(c,actNum){
  var el=document.getElementById("lootDetail");
  var rewardData=c.rewards&&c.rewards.find(function(r){return r.act===actNum;});
  if(!rewardData||!rewardData.hoard){el.innerHTML="<div class=loot-empty>No hoard data.</div>";return;}
  var act=c.acts&&c.acts.find(function(a){return a.number===actNum;});
  var h=rewardData.hoard;var rs=RunnerState.getRunState();
  var html="<div class=loot-hoard><div class=lh-title>Act "+actNum+" Hoard</div>";
  if(act)html+="<div class=lh-levels>Party Levels "+act.levelStart+"-"+act.levelEnd+"</div>";
  if(h.currency){
    html+="<div class=lh-section><div class=lhs-label>Currency</div><div class=currency-row>";
    var cur=h.currency;
    if(cur.pp)html+="<div class=cur-item><span class=cur-icon>PP</span><span class=cur-amt>"+cur.pp+"</span><span class=cur-label>Platinum</span></div>";
    if(cur.gp)html+="<div class=cur-item><span class=cur-icon>GP</span><span class=cur-amt>"+cur.gp+"</span><span class=cur-label>Gold</span></div>";
    if(cur.sp)html+="<div class=cur-item><span class=cur-icon>SP</span><span class=cur-amt>"+cur.sp+"</span><span class=cur-label>Silver</span></div>";
    if(cur.cp)html+="<div class=cur-item><span class=cur-icon>CP</span><span class=cur-amt>"+cur.cp+"</span><span class=cur-label>Copper</span></div>";
    html+="</div></div>";
  }
  function itemRows(items,prefix){if(!items||!items.length)return"";var s="";items.forEach(function(item,i){var key=prefix+"-"+i;var claimed=rs.lootClaimed[key];s+="<div class=loot-item-row><div class="lir-check"+(claimed?" claimed":"")+"" data-key="+key+">"+(claimed?"v":"")+"</div><div class="lir-name"+(claimed?" claimed":"")+"">"+escH(item.name)+"</div><div class=lir-level>Lv "+escH(item.level||"?")+"</div></div>";});return s;}
  if(h.permanentItems&&h.permanentItems.length){html+="<div class=lh-section><div class=lhs-label>Permanent Items</div>"+itemRows(h.permanentItems,"a"+actNum+"-perm")+"</div>";}
  if(h.consumables&&h.consumables.length){html+="<div class=lh-section><div class=lhs-label>Consumables</div>"+itemRows(h.consumables,"a"+actNum+"-cons")+"</div>";}
  html+="</div>";el.innerHTML=html;
  el.querySelectorAll(".lir-check").forEach(function(ch){
    ch.addEventListener("click",function(){var k=this.dataset.key;RunnerState.setLootClaimed(k,!RunnerState.getRunState().lootClaimed[k]);renderHoard(c,actNum);});
  });
}
function render(c,rs){renderActList(c);if(activeAct)renderHoard(c,activeAct);}
return{render:render};
})();
