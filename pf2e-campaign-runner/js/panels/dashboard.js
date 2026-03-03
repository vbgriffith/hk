
var PanelDashboard=(function(){
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function render(c,rs){
  var base=c.base||{};
  var title=base.title||'Campaign';
  document.getElementById('dashTitle').textContent=title;
  document.getElementById('sidebarTitle').textContent=title;
  document.getElementById('sidebarSub').textContent='Levels '+(c.config?c.config.startLevel:'?')+'\u2013'+(c.config?c.config.endLevel:'?')+' \u00b7 '+(c.acts?c.acts.length:0)+' Acts';
  document.getElementById('dashMeta').textContent=(c.config?c.config.players:4)+' players \u00b7 '+(c.config?c.config.theme||'custom':'custom')+' theme'+(c.generated?' \u00b7 Generated '+new Date(c.generated).toLocaleDateString():'');
  var hookEl=document.getElementById('dashHook');
  hookEl.innerHTML=c.hook?'<em>'+escH(c.hook)+'</em>':'<span class="text-dim italic">No hook set.</span>';
  var vEl=document.getElementById('dashVillainMini');
  if(c.villain){vEl.innerHTML='<div style="font-family:var(--font-display);color:var(--cream);font-size:.92rem;margin-bottom:.3rem">'+escH(c.villain.name)+'</div><div style="font-size:.78rem;color:var(--gold);font-style:italic;margin-bottom:.4rem">'+escH(c.villain.title||'')+'</div><div style="font-size:.82rem;color:var(--text-dim)">'+escH(c.villain.motivation||'')+'</div>';}
  var progressEl=document.getElementById('actProgressList');
  progressEl.innerHTML='';
  if(c.acts){c.acts.forEach(function(act){
    var status=rs.actProgress[act.number]||'not-started';
    var pct=status==='complete'?100:status==='in-progress'?50:0;
    var row=document.createElement('div');row.className='act-progress-item';
    row.innerHTML='<div class="api-label">Act '+act.number+'</div><div class="api-bar"><div class="api-fill'+(status==='complete'?' complete':'')+'" style="width:'+pct+'%"></div></div><div class="api-status"><select class="act-status-sel" data-act="'+act.number+'" style="background:var(--bg3);border:1px solid var(--border2);color:var(--text-dim);font-size:.65rem;border-radius:3px;padding:.05rem .2rem"><option value="not-started"'+(status==='not-started'?' selected':'')+'>Not started</option><option value="in-progress"'+(status==='in-progress'?' selected':'')+'>In progress</option><option value="complete"'+(status==='complete'?' selected':'')+'>Complete</option></select></div>';
    progressEl.appendChild(row);
  });}
  progressEl.querySelectorAll('.act-status-sel').forEach(function(sel){sel.addEventListener('change',function(){RunnerState.setActProgress(parseInt(this.dataset.act),this.value);render(RunnerState.getCampaign(),RunnerState.getRunState());});});
  var fEl=document.getElementById('dashFactionsMini');fEl.innerHTML='';
  if(c.factions){c.factions.slice(0,4).forEach(function(f){var rep=rs.factionRep[f.name]||0;var repStr=rep>0?'+'+rep:''+rep;var repColor=rep>0?'var(--green-bright)':rep<0?'var(--red-bright)':'var(--gold)';fEl.innerHTML+='<div class="faction-chip"><span class="fc-name">'+escH(f.name)+'</span><span class="fc-rep" style="color:'+repColor+'">'+repStr+'</span><span class="fc-role">'+escH(f.role||'')+'</span></div>';});}
  var sessions=rs.sessions||[];var lastSession=sessions[sessions.length-1];
  var sessionEl=document.getElementById('dashSessionMini');
  if(lastSession){sessionEl.innerHTML='<div style="font-family:var(--font-display);color:var(--cream);font-size:.88rem">'+escH(lastSession.title||'Untitled')+'</div><div style="font-size:.75rem;color:var(--text-dim);margin:.18rem 0">'+(lastSession.date||'')+' \u00b7 Act '+(lastSession.actNumber||'?')+'</div><div style="font-size:.82rem;color:var(--text);line-height:1.45;overflow:hidden;max-height:3.2em">'+escH((lastSession.recap||'').slice(0,120))+'</div>';}
  else{sessionEl.innerHTML='<span class="text-dim italic">No sessions logged yet.</span>';}
  var notesEl=document.getElementById('globalNotes');notesEl.value=rs.globalNotes||'';notesEl.oninput=function(){RunnerState.setGlobalNotes(this.value);};
  document.getElementById('btnGoSession').onclick=function(){RunnerUI.showPanel('session');};
}
return{render:render};
})();
