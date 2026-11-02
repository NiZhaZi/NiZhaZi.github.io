(() => {
  'use strict';
  const $=id=>document.getElementById(id),D=OceanData,KEY='ocean-feast-wild-v2';
  const defaultSave=()=>({version:2,stars:Array(48).fill(0),best:Array(48).fill(0),seen:[],lastLevel:0,playerChoice:-1,totalEaten:0,bestChain:0,settings:{sound:false,volume:.45,quality:true,labels:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}});
  let save=defaultSave(),storageAvailable=true;
  try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw&&raw.version===2){save={...save,...raw,settings:{...save.settings,...raw.settings}};save.stars=Array.from({length:48},(_,i)=>Math.max(0,Math.min(3,Number(raw.stars?.[i])||0)));save.best=Array.from({length:48},(_,i)=>Math.max(0,Number(raw.best?.[i])||0));save.seen=Array.isArray(raw.seen)?[...new Set(raw.seen.filter(n=>Number.isInteger(n)&&n>=0&&n<D.species.length))]:[];save.lastLevel=Math.max(0,Math.min(47,Number(raw.lastLevel)||0));}}catch{storageAvailable=false;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch{if(storageAvailable)notice('浏览器暂不能保存进度，本次仍可正常游玩。');storageAvailable=false;}}
  const r=new OceanRender.Renderer($('ocean')),sound=new OceanEngine.AudioEngine();
  let view='home',mapChoice=Math.floor(save.lastLevel/6),filter='all',lastUI=0,toastTimer,encounterTimer,noticeTimer,dialogClose=()=>closeDialog(),lastFocus=null;
  r.quality=save.settings.quality;r.labels=save.settings.labels;r.reduced=save.settings.reduced;r.resize();sound.enabled=save.settings.sound;sound.volume=save.settings.volume;
  const g=new OceanEngine.Game(r,sound,{
    onStart(){ $('tutorial').classList.remove('hidden');g.runSaved=false;setTimeout(()=>{if(g.state==='playing'&&g.elapsed>8)$('tutorial').classList.add('hidden')},12000);updateHUD(true);},
    onToast:gameToast,
    onEncounter(id){if(!save.seen.includes(id)){save.seen.push(id);persist();clearTimeout(encounterTimer);const s=D.species[id];$('encounterToast').innerHTML='<span>✧</span><div><small>NEW DISCOVERY</small>'+s.name+'</div>';$('encounterToast').classList.remove('hidden');encounterTimer=setTimeout(()=>$('encounterToast').classList.add('hidden'),2600);}},
    onPause:showPause,
    onFinish:showResult,
    onExploreCycle(){save.best[g.level.id]=Math.max(save.best[g.level.id],g.score);persist()},
    onUpdate(){updateHUD()}
  });
  function applySound(){sound.enabled=save.settings.sound;$('soundBtn').classList.toggle('muted',!sound.enabled);$('soundBtn').textContent=sound.enabled?'♫':'♪';$('soundBtn').setAttribute('aria-label',sound.enabled?'关闭声音':'开启声音');}
  function notice(text){clearTimeout(noticeTimer);$('notice').textContent=text;$('notice').classList.add('show');noticeTimer=setTimeout(()=>$('notice').classList.remove('show'),3200)}
  function gameToast(title,sub=''){clearTimeout(toastTimer);$('gameToast').textContent=title;if(sub){const small=document.createElement('small');small.textContent=sub;$('gameToast').appendChild(small)}$('gameToast').classList.add('show');toastTimer=setTimeout(()=>$('gameToast').classList.remove('show'),2400)}
  function makeCanvas(w=260,h=140){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function makeSpecimen(id,w=260,h=140){const c=makeCanvas(w,h);r.specimen(c,id);return c;}
  function starsHTML(n){return Array.from({length:3},(_,i)=>'<span class="'+(i<n?'earned':'')+'">'+(i<n?'★':'☆')+'</span>').join('')}
  function showView(next){
    if(!['home','worlds','codex'].includes(next))next='home';
    if(g.state==='playing'||g.state==='paused')recordRun(false);
    g.stop();view=next;closeDialog();$('header').classList.remove('hidden');$('menus').classList.remove('hidden');$('hud').classList.add('hidden');$('shade').classList.remove('playing');$('shade').classList.toggle('subpage',next!=='home');
    document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===next));document.querySelectorAll('.nav').forEach(el=>el.classList.toggle('active',el.dataset.view===next));
    history.replaceState(null,'','#'+next);
    if(next==='worlds')renderWorlds();if(next==='codex')renderCodex();if(next==='home')updateHome();
  }
  function updateHome(){
    const hero=D.maps[mapChoice].player,s=D.species[hero];$('heroSpecies').textContent=s.name;$('heroLatin').textContent=s.latin;
    document.querySelectorAll('.rail-card').forEach((b,i)=>{b.classList.toggle('selected',i===mapChoice);b.setAttribute('aria-pressed',i===mapChoice)});
    $('startBtn').innerHTML=(save.stars.some(n=>n>0)&&mapChoice===Math.floor(save.lastLevel/6)?'继续旅程':'开始旅程')+' <span>↗</span>';
  }
  function buildRail(){const rail=$('worldRail');rail.replaceChildren();D.maps.forEach(m=>{const b=document.createElement('button');b.className='rail-card';b.title=m.name;b.setAttribute('aria-label','预览'+m.name);b.innerHTML='<small>0'+(m.id+1)+'</small><strong>'+m.name+'</strong><span class="arrow">↗</span>';const c=makeCanvas(400,180);r.thumbnail(c,m.id);b.prepend(c);b.onclick=()=>{mapChoice=m.id;updateHome()};rail.appendChild(b)});updateHome()}
  function renderWorlds(){
    $('completedCount').textContent=String(save.stars.filter(n=>n>0).length).padStart(2,'0');const tabs=$('mapTabs');tabs.replaceChildren();
    for(const m of D.maps){const b=document.createElement('button');b.className='map-tab'+(m.id===mapChoice?' selected':'');b.setAttribute('role','tab');b.setAttribute('aria-selected',m.id===mapChoice);b.innerHTML='<small>0'+(m.id+1)+'</small>'+m.name;b.onclick=()=>{mapChoice=m.id;renderWorlds()};tabs.appendChild(b)}
    const m=D.maps[mapChoice];renderPlayerChoice();r.thumbnail($('worldFeatureImage'),m.id);$('worldDepth').textContent=m.depth;$('worldEnglish').textContent=m.en;$('worldTitle').textContent=m.name;$('worldDescription').textContent=m.desc;
    const count=save.stars.slice(m.id*6,m.id*6+6).filter(n=>n>0).length;$('worldCompletion').textContent=count+' / 6 已完成';
    const grid=$('levelGrid');grid.replaceChildren();for(const l of D.levels.filter(l=>l.map===m.id)){const b=document.createElement('button');b.className='level-tile';b.setAttribute('aria-label','第'+(l.id+1)+'关 '+l.title);b.innerHTML='<div class="level-number">'+String(l.id+1).padStart(2,'0')+'</div><div class="level-stars">'+starsHTML(save.stars[l.id])+'</div><div class="level-title">'+l.title+'</div><div class="level-caption">'+(save.best[l.id]?'最佳 '+save.best[l.id].toLocaleString()+' 分':l.subtitle)+'</div>';b.onclick=()=>startGame(l.id);grid.appendChild(b)}
    const f=$('mapFauna');f.replaceChildren();[...new Set([m.player,...m.small.slice(0,2),m.predators[0],...m.ambient.slice(0,2)])].slice(0,6).forEach(id=>{const b=document.createElement('button');b.className='fauna-peek';b.setAttribute('aria-label',D.species[id].name);b.title=D.species[id].name;b.appendChild(makeSpecimen(id,150,100));b.onclick=()=>showSpecies(id);f.appendChild(b)});
  }
  function renderPlayerChoice(){
    const select=$('playerSelect');select.replaceChildren();
    const choices=[[-1,'海域推荐 · '+D.species[D.maps[mapChoice].player].name],...D.classicPlayers.map(id=>[id,D.species[id].name+' · '+D.species[id].character])];
    for(const [id,label] of choices){const option=document.createElement('option');option.value=id;option.textContent=label;select.appendChild(option)}
    const selected=D.classicPlayers.includes(Number(save.playerChoice))?Number(save.playerChoice):-1;select.value=selected;
    $('playerChoiceHint').textContent=selected<0?'随海域变化 · 从幼鱼开始':'经典主角原型 · 各海域均可使用';
    select.onchange=()=>{save.playerChoice=Number(select.value);persist();renderPlayerChoice()};
  }
  function renderCodex(){
    $('discoveredCount').textContent=String(save.seen.length).padStart(2,'0');document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter));
    const query=$('speciesSearch').value.trim().toLowerCase();const matches=D.species.filter(s=>{const category=filter==='all'||filter==='classic'&&s.classic||filter==='seen'&&save.seen.includes(s.id)||filter==='reef'&&s.maps.some(m=>[0,1,2,4].includes(m))||filter==='pelagic'&&s.maps.some(m=>[3,5].includes(m))||filter==='deep'&&s.maps.some(m=>m>=6);return category&&(!query||(s.name+' '+s.en+' '+s.latin+' '+s.character).toLowerCase().includes(query))});
    const grid=$('speciesGrid');grid.replaceChildren();for(const s of matches){const b=document.createElement('button');b.className='species-card';b.setAttribute('aria-label','查看'+s.name);b.innerHTML='<div class="specimen-id">SPECIMEN '+String(s.id+1).padStart(2,'0')+(save.seen.includes(s.id)?'<span class="seen-dot" title="已遇见"></span>':'')+'</div>';b.appendChild(makeSpecimen(s.id,320,180));const label=document.createElement('div');label.innerHTML='<h3>'+s.name+'</h3><div class="latin">'+s.latin+'</div><div class="species-role">'+D.roleNames[s.role]+(s.classic?' · 一代经典原型':'')+'</div>';b.appendChild(label);b.onclick=()=>showSpecies(s.id);grid.appendChild(b)}$('emptySpecies').classList.toggle('hidden',matches.length>0);
  }
  function openDialog(html,setup,close){lastFocus=document.activeElement;const d=$('dialog');d.innerHTML=html;$('dialogBackdrop').classList.remove('hidden');dialogClose=close||(()=>closeDialog());const x=d.querySelector('.dialog-close');if(x)x.onclick=()=>dialogClose();setup?.(d);const f=d.querySelector('button:not(.dialog-close),input,button');f?.focus({preventScroll:true});}
  function closeDialog(){const wasOpen=!$('dialogBackdrop').classList.contains('hidden');$('dialogBackdrop').classList.add('hidden');$('dialog').replaceChildren();if(wasOpen&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
  function showSpecies(id){const s=D.species[id],neutral=s.role==='neutral',danger=s.role==='hazard';openDialog('<button class="dialog-close" aria-label="关闭">×</button><div class="specimen-dialog"><div class="eyebrow">FIELD GUIDE / '+String(id+1).padStart(2,'0')+'</div><div id="specimenArt"></div><h2 id="dialogTitle">'+s.name+'</h2><em>'+s.latin+'</em><p>'+s.note+'</p><div class="specimen-info"><div><small>真实原型栖息环境</small><strong>'+s.habitat+'</strong></div><div><small>游戏中的互动</small><strong>'+(neutral?'安全的环境生物':danger?'始终避开接触':'用嘴接触较小猎物，避开大鱼的嘴')+'</strong></div></div><p class="small-note">出没海域 · '+s.maps.map(mid=>D.maps[mid].name).join('、')+'<br>'+s.en+(s.character?' · '+s.character:'')+' · '+(save.seen.includes(id)?'已在旅途中遇见':'尚未在旅途中遇见')+'</p></div>',()=>{$('specimenArt').appendChild(makeSpecimen(id,650,300))})}
  function startGame(level,mode='classic'){
    if(!r.ready)return;sound.unlock();closeDialog();view='play';$('header').classList.add('hidden');$('menus').classList.add('hidden');$('hud').classList.remove('hidden');$('shade').classList.add('playing');$('shade').classList.remove('subpage');mapChoice=D.levels[level].map;save.lastLevel=level;persist();g.start(level,mode,Number(save.playerChoice));$('hudChapter').textContent=g.map.en+' / '+String(level+1).padStart(2,'0');$('hudTitle').textContent=mode==='classic'?g.level.title:g.map.name+' · 自由探索';$('encounterToast').classList.add('hidden');$('comboBox').classList.add('hidden');
  }
  function recordRun(won,stars=0){if(g.runSaved)return;g.runSaved=true;save.totalEaten+=g.eaten;save.bestChain=Math.max(save.bestChain,g.maxChain);save.best[g.level.id]=Math.max(save.best[g.level.id],g.score);if(won&&g.mode==='classic'){save.stars[g.level.id]=Math.max(save.stars[g.level.id],stars);save.lastLevel=Math.min(47,g.level.id+1)}persist();}
  function showPause(){openDialog('<div class="eyebrow">TAKE A BREATH</div><h2 id="dialogTitle">让海洋等你一会儿。</h2><p>'+g.map.name+' · '+g.level.title+'<br>分数 '+g.score.toLocaleString()+' · 已吞食 '+g.eaten+' 条</p><button id="resumeBtn" class="button primary">继续游动 <span>→</span></button><button id="restartBtn" class="button ghost">重新开始本关 <span>↻</span></button><button id="pauseSettings" class="button ghost">声音与画面设置 <span>⚙</span></button><button id="backToWorlds" class="button ghost">'+(g.mode==='explore'?'结束探索，返回海域':'返回海域选择')+' <span>↗</span></button><div class="page-footnote">Esc / P 继续</div>',()=>{$('resumeBtn').onclick=resumeGame;$('restartBtn').onclick=()=>{recordRun(false);startGame(g.level.id,g.mode)};$('pauseSettings').onclick=()=>showSettings(true);$('backToWorlds').onclick=()=>showView('worlds')},resumeGame)}
  function resumeGame(){closeDialog();sound.unlock();g.resume()}
  function showResult(result){
    recordRun(result.won,result.stars);updateHUD(true);const explore=result.mode==='explore',won=result.won,title=explore?'这一程，也很精彩。':won?(result.level===47?'你征服了深海。':'在海洋中，又长大了一点。'):'海洋，总有下一次机会。';
    const next=result.level<47;openDialog('<div class="eyebrow">'+(explore?'EXPLORATION COMPLETE':won?'LEVEL COMPLETE':'TRY AGAIN')+'</div><h2 id="dialogTitle">'+title+'</h2><p>'+g.map.name+' · '+g.level.title+'</p>'+(won?'<div class="result-stars">'+Array.from({length:3},(_,i)=>i<result.stars?'★':'☆').join('')+'</div>':'<p>'+(explore?'你可以随时选择新的海域继续探索。':g.remaining<=0?'时间耗尽。试着用吸食技能快速补满成长条。':'留意体形差异；冲刺可以帮助你脱离追逐。')+'</p>')+'<div class="result-stats"><div><b>'+result.score.toLocaleString()+'</b><small>本次分数</small></div><div><b>'+result.eaten+'</b><small>吞食数量</small></div><div><b>'+result.maxChain+'</b><small>最高连吃</small></div></div><button id="resultPrimary" class="button primary">'+(won&&next?'下一关':'再游一次')+' <span>→</span></button><button id="resultWorlds" class="button ghost">返回海域选择 <span>↗</span></button>',()=>{$('resultPrimary').onclick=()=>startGame(won&&next?result.level+1:result.level,g.mode);$('resultWorlds').onclick=()=>showView('worlds')},()=>showView('worlds'));
  }
  function showSettings(fromPause=false){
    openDialog('<button class="dialog-close" aria-label="关闭设置">×</button><div class="eyebrow">MAKE IT YOUR OCEAN</div><h2 id="dialogTitle">声音与画面</h2><div class="setting-row"><div>水下音效<small>吞食、冲刺与成长提示音</small></div><button id="settingSound" class="toggle '+(save.settings.sound?'on':'')+'">'+(save.settings.sound?'已开启':'已关闭')+'</button></div><div class="setting-row"><div>音量</div><input id="volumeInput" type="range" min="0" max="100" value="'+Math.round(save.settings.volume*100)+'" aria-label="音量"></div><div class="setting-row"><div>细腻画面<small>动态鱼尾、光束与更多悬浮微粒</small></div><button id="settingQuality" class="toggle '+(save.settings.quality?'on':'')+'">'+(save.settings.quality?'高画质':'节能')+'</button></div><div class="setting-row"><div>附近鱼类提示<small>绿色标记可吞食，暖色标记危险</small></div><button id="settingLabels" class="toggle '+(save.settings.labels?'on':'')+'">'+(save.settings.labels?'显示':'隐藏')+'</button></div><div class="setting-row"><div>减少动态效果<small>关闭鱼尾摆动与漂浮光影</small></div><button id="settingMotion" class="toggle '+(save.settings.reduced?'on':'')+'">'+(save.settings.reduced?'已开启':'已关闭')+'</button></div><div class="divider"></div><div class="keys"><span><kbd>鼠标</kbd>移动 / 触控拖动</span><span><kbd>WASD</kbd>方向键移动</span><span><kbd>空格</kbd>冲刺 / 鼠标右键</span><span><kbd>E</kbd>吸食附近小鱼</span><span><kbd>Esc</kbd>暂停 / 继续</span><span><kbd>M</kbd>切换声音</span></div><div class="page-footnote">本地已记录 '+save.totalEaten+' 次吞食 · 最佳连吃 '+save.bestChain+'</div>',()=>{
      $('settingSound').onclick=()=>{sound.unlock();save.settings.sound=!save.settings.sound;applySound();persist();showSettings(fromPause)};
      $('volumeInput').oninput=e=>{save.settings.volume=+e.target.value/100;sound.volume=save.settings.volume;persist()};
      $('settingQuality').onclick=()=>{save.settings.quality=!save.settings.quality;r.quality=save.settings.quality;r.resize();persist();showSettings(fromPause)};
      $('settingLabels').onclick=()=>{save.settings.labels=!save.settings.labels;r.labels=save.settings.labels;persist();showSettings(fromPause)};
      $('settingMotion').onclick=()=>{save.settings.reduced=!save.settings.reduced;r.reduced=save.settings.reduced;persist();showSettings(fromPause)};
    },()=>fromPause?showPause():closeDialog());
  }
  function showAbout(){openDialog('<button class="dialog-close" aria-label="关闭">×</button><div class="eyebrow">OCEAN FEAST · NATURE EDITION</div><h2 id="dialogTitle">关于这片海</h2><p>一款致敬《Feeding Frenzy》一代核心玩法的原创浏览器游戏。吞食小鱼、躲避大鱼，经历三段成长，完成 8 个海域的 48 道关卡。</p><p>72 种生物使用 AI 生成的写实自然史插画，参考真实生物的体形、鳞片和鳍部。它们并非严格的科学复原：体型比例、捕食关系、跨地域生物组合均按玩法调整；嘴部锚点随转向和成长移动；深海生物及照明采用艺术化呈现。</p><p>鲸鲨、座头鲸、宽吻海豚、海龟、翻车鱼、皇带鱼、吸血鬼乌贼及部分海底生物为安全环境生物。蓑鲉恢复为按相对体型可吞食的经典鱼类；水母仍是接触障碍。珍珠增加分数，蓝色气泡恢复冲刺并在闯关中增加 8 秒。</p><p>图鉴的“一代经典原型”筛选，将原版鱼类类别映射为真实生物参照，并不表示原作逐一指定了这些物种。可在海域页选择神仙鱼、蓑鲉、鮟鱇、海鲂或虎鲸作为主角。</p><div class="divider"></div><div class="eyebrow">继续了解真实海洋</div><div class="about-links"><a href="https://australian.museum/learn/animals/fishes/john-dory-zeus-faber/" target="_blank" rel="noopener">澳大利亚博物馆 · 海鲂</a><a href="https://www.mbari.org/education/animals-of-the-deep/" target="_blank" rel="noopener">MBARI · 深海生物</a><a href="https://www.montereybayaquarium.org/visit/exhibits/open-sea/" target="_blank" rel="noopener">蒙特雷湾水族馆 · 外海</a><a href="https://www.montereybayaquarium.org/visit/exhibits/kelp-forest" target="_blank" rel="noopener">海带森林</a><a href="https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/moon-jelly" target="_blank" rel="noopener">海月水母</a></div><p class="page-footnote">原创美术与程序 · 非官方作品 · 无需账号 · 浏览器本地存档</p>')}
  function updateHUD(force=false){
    const now=performance.now();if(!force&&now-lastUI<75)return;lastUI=now;const p=g.p;if(!p)return;
    $('hudScore').textContent=String(Math.round(g.score)).padStart(6,'0');$('hudHearts').innerHTML=Array.from({length:3},(_,i)=>i<p.lives?'♥':'<i>♥</i>').join(' ');$('hudHearts').setAttribute('aria-label','剩余 '+p.lives+' 条生命');
    const time=Math.ceil(g.remaining);$('hudTime').textContent=g.mode==='explore'?'∞':String(Math.floor(time/60)).padStart(2,'0')+':'+String(time%60).padStart(2,'0');$('hudTime').style.color=g.mode==='classic'&&time<25?'#f6ae99':'';
    const f=Math.min(1,p.xp/g.level.goal),stage=Math.min(2,Math.floor(f*3));$('growthStage').textContent=['幼鱼','成长','成熟'][stage]+' · 阶段 '+(stage+1)+' / 3';$('growthPercent').textContent=Math.floor(f*100)+'%';$('growthFill').style.width=(f*100)+'%';$('growthHint').textContent=['用嘴接触小鱼，逐渐长大','现在可以捕食中型鱼','继续吞食，完成本轮成长'][stage];$('eatenCount').textContent=g.eaten+' 条';$('dashEnergy').style.width=p.energy+'%';$('suckEnergy').style.width=((1-g.suckCooldown/8)*100)+'%';
    $('comboBox').classList.toggle('hidden',g.chain<3&&p.frenzy===0);$('comboNum').textContent=p.frenzy>0?'FRENZY':'×'+Math.min(5,1+Math.floor(g.chain/5));$('comboNum').style.fontSize=p.frenzy>0?'25px':'';$('comboText').textContent=p.frenzy>0?'吞食狂潮 · '+Math.ceil(p.frenzy)+' 秒':g.chain+' 连吃 · 得分倍率';$('comboFill').style.width=(p.frenzy>0?p.frenzy/8:g.chainTime/2.8)*100+'%';
    if(g.elapsed>12)$('tutorial').classList.add('hidden');
  }
  function worldPoint(e){const b=$('ocean').getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*r.W,y:(e.clientY-b.top)/b.height*r.H}}
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();showView('home')});
  $('startBtn').onclick=()=>startGame(Math.floor(save.lastLevel/6)===mapChoice?save.lastLevel:mapChoice*6);
  $('continueBtn').onclick=()=>startGame(mapChoice*6,'explore');$('exploreMapBtn').onclick=()=>startGame(mapChoice*6,'explore');
  $('settingsBtn').onclick=()=>showSettings();$('aboutBtn').onclick=showAbout;$('soundBtn').onclick=()=>{sound.unlock();save.settings.sound=!save.settings.sound;applySound();persist()};
  $('exitPlayBtn').onclick=()=>g.pause();$('dismissTutorial').onclick=()=>$('tutorial').classList.add('hidden');
  $('dashBtn').onclick=()=>{sound.unlock();g.dash()};$('suckBtn').onclick=()=>{sound.unlock();g.suck()};
  $('fullscreenBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{notice('当前浏览器不支持全屏，请使用浏览器的全屏功能。')}};
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;renderCodex()});$('speciesSearch').oninput=renderCodex;
  $('dialogBackdrop').addEventListener('click',e=>{if(e.target===$('dialogBackdrop'))dialogClose()});
  $('ocean').addEventListener('pointerdown',e=>{if(g.state!=='playing')return;sound.unlock();if(e.button===2){g.dash();return}g.touch=e.pointerType==='touch';g.mouse=worldPoint(e);$('ocean').setPointerCapture?.(e.pointerId);});
  $('ocean').addEventListener('pointermove',e=>{if(g.state==='playing'&&(e.pointerType==='mouse'||e.buttons))g.mouse=worldPoint(e)});
  $('ocean').addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')g.mouse=null});$('ocean').addEventListener('pointercancel',()=>g.mouse=null);
  $('ocean').addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('keydown',e=>{
    const input=['INPUT','TEXTAREA'].includes(e.target.tagName);if(input&&e.key!=='Escape')return;
    if(e.key==='Tab'&&!$('dialogBackdrop').classList.contains('hidden')){const list=[...$('dialog').querySelectorAll('button,a,input')].filter(x=>!x.disabled);if(!list.length)return;const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}return;}
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    if(key==='Escape'||key==='p'){if(e.repeat)return;e.preventDefault();if(g.state==='playing')g.pause();else if(!$('dialogBackdrop').classList.contains('hidden'))dialogClose();return;}
    if(key==='m'){if(e.repeat)return;save.settings.sound=!save.settings.sound;sound.unlock();applySound();persist();return;}
    if(g.state!=='playing')return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d',' ','e'].includes(key)){e.preventDefault();sound.unlock();if(key===' '&&!e.repeat)g.dash();else if(key==='e'&&!e.repeat)g.suck();else g.keys.add(key)}
  });
  window.addEventListener('keyup',e=>g.keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)g.pause()});window.addEventListener('blur',()=>{if(g.state==='playing')g.pause()});
  window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(['home','worlds','codex'].includes(route))showView(route)});
  let last=performance.now(),time=0;function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;time+=dt;if(r.ready){if(view==='play'&&g.p){g.update(dt);r.game(g,time)}else r.ambient(mapChoice,time,view==='home')}requestAnimationFrame(frame)}requestAnimationFrame(frame);
  async function init(){try{await r.load((n,total)=>$('loadProgress').textContent='已准备 '+n+' / '+total+' 组海洋素材');buildRail();applySound();showView(location.hash.slice(1)||'home');$('loading').style.opacity='0';setTimeout(()=>$('loading').classList.add('hidden'),500);if(!storageAvailable)notice('浏览器存储不可用，进度暂不能保留。');}catch(err){$('loadProgress').textContent=err.message+'，请刷新重试。';const b=document.createElement('button');b.className='button primary';b.textContent='重新加载';b.onclick=()=>location.reload();$('loading').appendChild(b);console.error(err)}}
  init();
})();
