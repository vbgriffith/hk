var PanelFactions=(function(){
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function repLabel(v){var labels=['Hostile','Unfriendly','Cool','Neutral','Warm','Friendly','Devoted'];return labels[v+3]||v;}
function render(c,rs){
  var el=document.getElementById('factionsContent');
  if(!c.factions||!c.factions.length){el.innerHTML='<p class="text-dim italic">No factions in this campaign.</p>';return;}
  var html='<div class="factions-grid">';
  c.factions.forEach(function(f){
    var rep=rs.factionRep[f.name]||0;
    var role=(f.role||'').toLowerCase();
    var roleCls=role.indexOf('ally')>=0?'ally':role.indexOf('villain')>=0||role.indexOf('secondary')>=0?'villain':'wildcard';
    html+='<div class="faction-card"><div class="faction-card-header"><span class="fch-name">'+escH(f.name)+'</span><span class="fch-role '+roleCls+'">'+escH(f.role||'')+'</span></div>';
    html+='<div class="faction-rep-row"><div class="rep-track">';
    for(var i=-5;i<=5;i++){
      var cls='rep-pip';
      if(i===0)cls+=' center-pip';
      else if(i>0&&i<=rep)cls+=' filled-pos';
      else if(i<0&&i>=rep)cls+=' filled-neg';
      html+='<div class="'+cls+'" data-faction="'+escH(f.name)+'" data-val="'+i+'" title="'+i+'"></div>';
    }
    html+='</div><div class="rep-label">'+repLabel(rep)+'</div></div>';
    html+='<div class="faction-desc">'+escH(f.desc||f.alignment||'')+'</div>';
    html+='<textarea class="faction-notes" data-faction="'+escH(f.name)+'" placeholder="Notes on this faction...">'+escH(rs.factionNotes[f.name]||'')+'</textarea>';
    html+='</div>';
  });
  html+='</div>';
  el.innerHTML=html;
  el.querySelectorAll('.rep-pip').forEach(function(pip){
    pip.addEventListener('click',function(){
      var name=this.dataset.faction;var val=parseInt(this.dataset.val);
      RunnerState.setFactionRep(name,val);
      render(RunnerState.getCampaign(),RunnerState.getRunState());
      PanelDashboard.render(RunnerState.getCampaign(),RunnerState.getRunState());
    });
  });
  el.querySelectorAll('.faction-notes').forEach(function(ta){
    ta.addEventListener('input',function(){RunnerState.setFactionNotes(this.dataset.faction,this.value);});
  });
}
return{render:render};
})();