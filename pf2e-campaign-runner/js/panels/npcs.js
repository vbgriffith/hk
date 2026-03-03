var PanelNPCs=(function(){
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function avatar(role){var r=(role||'').toLowerCase();if(r.indexOf('villain')>=0||r.indexOf('boss')>=0)return String.fromCodePoint(0x1F480);if(r.indexOf('commander')>=0||r.indexOf('military')>=0)return String.fromCodePoint(0x2694)+String.fromCodePoint(0xFE0F);if(r.indexOf('cleric')>=0||r.indexOf('priest')>=0)return String.fromCodePoint(0x2695)+String.fromCodePoint(0xFE0F);if(r.indexOf('mage')>=0||r.indexOf('wizard')>=0)return String.fromCodePoint(0x1F52E);if(r.indexOf('noble')>=0)return String.fromCodePoint(0x1F451);if(r.indexOf('rival')>=0)return String.fromCodePoint(0x2694)+String.fromCodePoint(0xFE0F);return String.fromCodePoint(0x1F464);}
function render(c,rs){
  var el=document.getElementById('npcsContent');
  var allNpcs=[];
  if(c.npcs&&c.npcs.length)allNpcs=allNpcs.concat(c.npcs);
  if(!allNpcs.length){el.innerHTML='<p class="text-dim italic" style="padding:1rem">No NPCs in this campaign.</p>';return;}
  var search=(document.getElementById('npcSearch')||{}).value||'';
  var lsearch=search.toLowerCase();
  var filtered=allNpcs.filter(function(n){if(!search)return true;return((n.name||'').toLowerCase().indexOf(lsearch)>=0)||((n.role||'').toLowerCase().indexOf(lsearch)>=0);});
  var html='<div class="npc-grid">';
  filtered.forEach(function(npc){
    var status=rs.npcStatus[npc.name]||'unknown';
    var notes=rs.npcNotes[npc.name]||'';
    html+='<div class="npc-card" data-npcname="'+escH(npc.name)+'">';
    html+='<div class="npc-card-header"><div class="npc-avatar">'+avatar(npc.role)+'</div><div class="npc-info"><div class="npc-name">'+escH(npc.name)+'</div><div class="npc-role">'+escH(npc.role||'')+'</div></div><span style="color:var(--text-dim);font-size:.8rem;margin-left:auto">▾</span></div>';
    html+='<div class="npc-card-body">';
    if(npc.personality)html+='<div class="npc-personality">“'+escH(npc.personality)+'”</div>';
    if(npc.desc)html+='<div style="font-size:.82rem;color:var(--text-dim);margin-bottom:.5rem;line-height:1.45">'+escH(npc.desc)+'</div>';
    html+='<div class="npc-status-row">';
    ['ally','hostile','dead','unknown'].forEach(function(s){html+='<button class="npc-status-btn'+(status===s?' active-'+s:'')+' " data-npcname="'+escH(npc.name)+'" data-status="'+s+'">'+s[0].toUpperCase()+s.slice(1)+'</button>';});
    html+='</div><textarea class="npc-notes" data-npcname="'+escH(npc.name)+'" placeholder="GM notes on this NPC...">'+escH(notes)+'</textarea></div></div>';
  });
  html+='</div>';
  el.innerHTML=html;
  el.querySelectorAll('.npc-card-header').forEach(function(h){h.addEventListener('click',function(){this.closest('.npc-card').classList.toggle('expanded');});});
  el.querySelectorAll('.npc-status-btn').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();RunnerState.setNpcStatus(this.dataset.npcname,this.dataset.status);render(RunnerState.getCampaign(),RunnerState.getRunState());});});
  el.querySelectorAll('.npc-notes').forEach(function(ta){ta.addEventListener('input',function(){RunnerState.setNpcNotes(this.dataset.npcname,this.value);});ta.addEventListener('click',function(e){e.stopPropagation();});});
}
function init(){var s=document.getElementById('npcSearch');if(s)s.addEventListener('input',function(){render(RunnerState.getCampaign(),RunnerState.getRunState());});}
return{render:render,init:init};
})();
