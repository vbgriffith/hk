var PanelInitiative=(function(){
var combatants=[];var round=1;var activeTurn=0;
var CONDITIONS=[{name:'Blinded',desc:'Cannot see. -4 Perc, all targets concealed.'},{name:'Clumsy',desc:'Clumsy 1-4: -penalty to Dex-based checks and AC.'},{name:'Confused',desc:'Hostile to everyone. Attacks random target.'},{name:'Dazzled',desc:'All creatures are concealed from you.'},{name:'Deafened',desc:'-2 Perc, -2 init, spell failure chance.'},{name:'Dying',desc:'Dying 1-4: Unconscious. Make recovery checks.'},{name:'Enfeebled',desc:'Enfeebled 1-4: -penalty to Str-based checks and attack.'},{name:'Fascinated',desc:'Flat-footed to source. Cannot act unless effect ends.'},{name:'Fatigued',desc:'-1 AC and saves. Cannot use exploration activities.'},{name:'Frightened',desc:'Frightened 1-4: -penalty to all checks and DCs.'},{name:'Grabbed',desc:'Immobilized, flat-footed.'},{name:'Paralyzed',desc:'Cannot act. Flat-footed. Crit-fail vs spells likely.'},{name:'Persistent',desc:'Persistent damage: end-of-turn damage, DC 15 to end.'},{name:'Prone',desc:'-2 attack, melee attackers +1. Stand costs Stride action.'},{name:'Restrained',desc:'Cannot move. Flat-footed. -2 attacks.'},{name:'Sickened',desc:'Sickened 1-4: -penalty to all checks and DCs.'},{name:'Slowed',desc:'Slowed 1-3: Lose that many actions per turn.'},{name:'Stunned',desc:'Stunned X: Lose that many actions (stacks with Slowed).'},{name:'Unconscious',desc:'Cannot act. Blind, flat-footed, prone. -4 AC.'}];
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function hpCls(pct){return pct>50?'high':pct>25?'mid':'low';}
function renderList(){
  var el=document.getElementById('initiativeList');
  if(!combatants.length){el.innerHTML='<div class="init-empty">No combatants yet.<br>Add manually or load an encounter.</div>';return;}
  var sorted=[].concat(combatants).sort(function(a,b){return b.init-a.init;});
  el.innerHTML='';
  sorted.forEach(function(c,i){
    var pct=c.maxHp?Math.max(0,Math.round(c.hp/c.maxHp*100)):100;
    var row=document.createElement('div');
    row.className='combatant-row'+(c.active?' active-turn':'')+(c.dead?' dead':'');
    row.dataset.id=c.id;
    var condHtml=c.conditions.map(function(cond){return'<span class="condition-tag" data-id="'+c.id+'" data-cond="'+escH(cond)+'" title="Click to remove">'+escH(cond)+'</span>';}).join('');
    row.innerHTML='<div class="cr-init">'+c.init+'</div>'+
      '<div class="cr-badge '+c.type+'">'+c.type+'</div>'+
      '<div class="cr-name">'+escH(c.name)+'</div>'+
      '<div class="cr-hp-bar"><div class="cr-hp-track"><div class="cr-hp-fill '+hpCls(pct)+'" style="width:'+pct+'%"></div></div>'+
      '<div class="cr-hp-text" data-id="'+c.id+'" title="Click to edit HP">'+c.hp+'/'+c.maxHp+'</div></div>'+
      '<div class="cr-actions">'+
        '<button class="cr-btn" data-id="'+c.id+'" data-action="dmg" title="Damage">DMG</button>'+
        '<button class="cr-btn" data-id="'+c.id+'" data-action="heal" title="Heal">HEAL</button>'+
        '<button class="cr-btn" data-id="'+c.id+'" data-action="cond" title="Add condition">+COND</button>'+
        '<button class="cr-btn" data-id="'+c.id+'" data-action="dead" title="Toggle dead">'+"†"+'</button>'+
        '<button class="cr-btn" data-id="'+c.id+'" data-action="remove" title="Remove">X</button>'+
      '</div>'+
      (condHtml?'<div class="cr-conditions">'+condHtml+'</div>':'');
    el.appendChild(row);
  });
  el.querySelectorAll('.cr-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var id=parseInt(this.dataset.id);var action=this.dataset.action;var c=combatants.find(function(x){return x.id===id;});
      if(!c)return;
      if(action==='dmg'){var v=prompt('Damage amount:','');if(v&&!isNaN(parseInt(v))){c.hp=Math.max(0,c.hp-parseInt(v));if(c.hp===0)c.dead=true;}}
      else if(action==='heal'){var v=prompt('Heal amount:','');if(v&&!isNaN(parseInt(v))){c.hp=Math.min(c.maxHp,c.hp+parseInt(v));c.dead=false;}}
      else if(action==='cond'){var v=prompt('Condition name (e.g. Frightened 2):','');if(v)c.conditions.push(v);}
      else if(action==='dead'){c.dead=!c.dead;}
      else if(action==='remove'){combatants=combatants.filter(function(x){return x.id!==id;});}
      renderList();
    });
  });
  el.querySelectorAll('.condition-tag').forEach(function(tag){
    tag.addEventListener('click',function(){
      var id=parseInt(this.dataset.id);var cond=this.dataset.cond;
      var c=combatants.find(function(x){return x.id===id;});
      if(c){c.conditions=c.conditions.filter(function(x){return x!==cond;});renderList();}
    });
  });
}
function renderCondRef(){
  var el=document.getElementById('conditionsRef');if(!el)return;
  var tooltip=null;
  el.innerHTML=CONDITIONS.map(function(c){return'<span class="cond-chip" data-desc="'+escH(c.desc)+'">'+escH(c.name)+'</span>';}).join('');
  el.querySelectorAll('.cond-chip').forEach(function(chip){
    chip.addEventListener('mouseenter',function(e){
      if(tooltip){tooltip.remove();}tooltip=document.createElement('div');
      tooltip.className='cond-tooltip';tooltip.textContent=this.dataset.desc;
      document.body.appendChild(tooltip);
      var r=this.getBoundingClientRect();tooltip.style.left=(r.left-tooltip.offsetWidth-8)+'px';tooltip.style.top=r.top+'px';
    });
    chip.addEventListener('mouseleave',function(){if(tooltip){tooltip.remove();tooltip=null;}});
  });
}
function populateActSelects(c){
  var sel=document.getElementById('initActSelect');if(!sel)return;
  sel.innerHTML='<option value="">Select act...</option>';
  if(c.acts){c.acts.forEach(function(a){var o=document.createElement('option');o.value=a.number;o.textContent='Act '+a.number+': '+a.title;sel.appendChild(o);});}
  sel.onchange=function(){
    var actNum=parseInt(this.value);var act=c.acts&&c.acts.find(function(a){return a.number===actNum;});
    var encSel=document.getElementById('initEncSelect');encSel.innerHTML='<option value="">Select encounter...</option>';
    if(act&&act.actEncounters){act.actEncounters.forEach(function(enc,i){var o=document.createElement('option');o.value=actNum+'-'+i;o.textContent=enc.label||('Encounter '+(i+1));encSel.appendChild(o);});}
    if(act&&act.boss){var o=document.createElement('option');o.value=actNum+'-boss';o.textContent='Boss: '+act.boss.name;encSel.appendChild(o);}
  };
}
function init(c){
  renderCondRef();populateActSelects(c);
  document.getElementById('btnConfirmAdd').onclick=function(){
    var name=document.getElementById('initName').value.trim();if(!name)return;
    var init=parseInt(document.getElementById('initRoll').value)||0;
    var hp=parseInt(document.getElementById('initHP').value)||10;
    var type=document.getElementById('initType').value;
    combatants.push({id:Date.now(),name:name,init:init,hp:hp,maxHp:hp,ac:parseInt(document.getElementById('initAC').value)||0,type:type,conditions:[],active:false,dead:false});
    renderList();
    document.getElementById('initName').value='';document.getElementById('initRoll').value='';document.getElementById('initHP').value='';document.getElementById('initAC').value='';
  };
  document.getElementById('btnNextTurn').onclick=function(){
    var sorted=[].concat(combatants).sort(function(a,b){return b.init-a.init;});
    var living=sorted.filter(function(c){return!c.dead;});if(!living.length)return;
    var cur=living.findIndex(function(c){return c.active;});
    living.forEach(function(c){c.active=false;});
    var next=(cur+1)%living.length;living[next].active=true;
    combatants.forEach(function(c){var m=living.find(function(x){return x.id===c.id;});if(m)Object.assign(c,{active:m.active});});
    renderList();
  };
  document.getElementById('btnNextRound').onclick=function(){
    round++;document.getElementById('roundNum').textContent=round;
    combatants.forEach(function(c){c.active=false;});
    var sorted=[].concat(combatants).sort(function(a,b){return b.init-a.init;});
    var living=sorted.filter(function(c){return!c.dead;});if(living.length)living[0].active=true;
    renderList();
  };
  document.getElementById('btnClearCombat').onclick=function(){if(confirm('Clear all combatants?')){combatants=[];round=1;document.getElementById('roundNum').textContent='1';renderList();}};
  document.getElementById('btnAddCombatant').onclick=function(){document.getElementById('initAddPanel').scrollIntoView&&document.getElementById('initAddPanel').scrollIntoView({behavior:'smooth'});};
  document.getElementById('btnLoadEncounter').onclick=function(){
    var v=document.getElementById('initEncSelect').value;if(!v)return;
    var actNum=parseInt(v.split('-')[0]);var encKey=v.split('-')[1];
    var act=c.acts&&c.acts.find(function(a){return a.number===actNum;});if(!act)return;
    var enc=encKey==='boss'?act.boss:(act.actEncounters&&act.actEncounters[parseInt(encKey)]);
    if(!enc)return;
    var creatures=enc.creatures||(enc.statBlock?[{name:enc.name,statBlock:enc.statBlock,count:1}]:[]);
    var added=0;
    creatures.forEach(function(cr){
      var cnt=cr.count||1;
      for(var i=0;i<cnt;i++){
        var nm=cnt>1?cr.name+' '+(i+1):cr.name;
        var sb=cr.statBlock||{};
        combatants.push({id:Date.now()+added,name:nm,init:Math.floor(Math.random()*20)+1,hp:sb.hp||10,maxHp:sb.hp||10,ac:sb.ac||10,type:'enemy',conditions:[],active:false,dead:false});
        added++;
      }
    });
    renderList();RunnerUI.toast('Loaded '+(enc.label||enc.name||'encounter'),'success');
  };
}
function render(c,rs){populateActSelects(c);renderList();}
return{init:init,render:render};
})();
