/* Deterministic rules separated from presentation for simulation checks. */
window.OceanEngine = (() => {
  const {clamp}=OceanRender,G=OceanGeometry;
  const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0];
  class AudioEngine {
    constructor(){this.enabled=false;this.volume=.45;this.ctx=null;}
    unlock(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch{}}if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});}
    tone(freq,length=.08,type='sine',gain=.10,end){if(!this.enabled||!this.ctx)return;try{const c=this.ctx,o=c.createOscillator(),a=c.createGain(),now=c.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+length);a.gain.setValueAtTime(.0001,now);a.gain.exponentialRampToValueAtTime(Math.max(.001,gain*this.volume),now+.012);a.gain.exponentialRampToValueAtTime(.0001,now+length);o.connect(a);a.connect(c.destination);o.start(now);o.stop(now+length+.02)}catch{}}
    eat(combo){this.tone(430+Math.min(combo,20)*24,.09,'sine',.14,800+combo*20)}
    hit(){this.tone(150,.3,'triangle',.18,50)}
    dash(){this.tone(240,.16,'sine',.08,70)}
    win(){[0,110,220,360].forEach((d,i)=>setTimeout(()=>this.tone([523,659,784,1047][i],.3,'sine',.14),d))}
  }
  class Game {
    constructor(renderer,audio,events={}){this.r=renderer;this.audio=audio;this.events=events;this.state='idle';this.keys=new Set();this.mouse=null;this.touch=false;this.fish=[];this.ambient=[];this.particles=[];this.pickups=[];}
    start(levelId,mode='classic',playerId){
      this.level=OceanData.levels[clamp(levelId|0,0,47)];this.map=OceanData.maps[this.level.map];this.mode=mode;this.state='playing';this.elapsed=0;this.remaining=this.level.time;this.score=0;this.eaten=0;this.chain=0;this.maxChain=0;this.chainTime=0;this.hits=0;this.shake=0;this.suction=0;this.suckCooldown=0;this.spawnClock=0;this.pickupClock=7;this.wave=1;this.fish=[];this.ambient=[];this.particles=[];this.pickups=[];this.mouse=null;this.keys.clear();this.seen=new Set();
      const b=this.bounds(),chosen=OceanData.classicPlayers.includes(playerId)?playerId:this.map.player;this.p={id:chosen,x:this.r.W*.38,y:(b.top+b.bottom)/2,size:64,xp:0,dir:1,vx:0,vy:0,energy:100,dash:0,dashCooldown:0,lives:3,invincible:3,frenzy:0,stun:0,phase:0,biteFlash:0};
      for(let i=0;i<this.level.density;i++)this.spawnFish(true,i<this.level.threats?'predator':undefined);
      for(let i=0;i<2;i++)this.spawnAmbient(true);
      this.events.onStart?.(this);this.encounter(chosen);this.events.onToast?.(OceanData.species[chosen].name,mode==='explore'?'自由探索 · 用嘴接近小鱼':'用嘴接触小鱼，填满成长条');
    }
    bounds(){const s=this.r.scale||1;return {left:28,right:this.r.W-28,top:90/s,bottom:this.r.H-(this.r.width<700?182:136)/s};}
    spawnFish(initial=false,force){
      const m=this.map,b=this.bounds(),roll=Math.random(),kind=force||(roll<.50?'small':roll<.77?'medium':roll<.95?'large':'hazard');
      let ids,size,category=kind;
      if(kind==='small'){ids=m.small;size=rnd(29,45)}
      else if(kind==='medium'){ids=m.medium;size=rnd(60,78)}
      else if(kind==='large'){ids=m.large;size=rnd(100,133)}
      else if(kind==='predator'){ids=m.predators;size=rnd(185,248)}
      else{ids=m.hazards;if(!ids.length){ids=m.small;category='small';size=rnd(29,43)}else size=rnd(48,72)}
      const id=pick(ids),species=OceanData.species[id];if(species.role==='hazard')category='hazard';
      const dir=Math.random()<.5?1:-1,speed=category==='predator'?rnd(78,105):category==='hazard'?rnd(10,24):species.benthic?rnd(12,30):rnd(38,84),p=this.p;
      let x=initial?rnd(0,this.r.W):(dir>0?-size:this.r.W+size),y=rnd(b.top+30,Math.max(b.top+70,b.bottom-20));
      if(initial&&Math.hypot(x-p.x,y-p.y)<(category==='predator'?360:130))x=x<this.r.W/2?this.r.W*.88:this.r.W*.12;
      const f={id,kind:category,size,x,y,dir,vx:dir*speed,vy:0,speed,phase:rnd(0,6.28),chasing:false,chaseLeft:0,rest:rnd(2,5),age:0};
      if(species.benthic)f.y=b.bottom-rnd(10,65);
      this.fish.push(f);return f;
    }
    spawnAmbient(initial=false){if(!this.map.ambient.length)return;const dir=Math.random()<.5?1:-1,id=pick(this.map.ambient),s=OceanData.species[id],large=[27,28,32,58].includes(id),bottom=s.benthic;this.ambient.push({id,size:bottom?rnd(65,105):large?rnd(310,450):rnd(140,220),x:initial?rnd(0,this.r.W):(dir>0?-450:this.r.W+450),y:bottom?this.bounds().bottom+25:rnd(this.r.H*.19,this.r.H*.65),dir,vx:dir*(bottom?rnd(2,5):rnd(24,40)),alpha:bottom?.75:.45,phase:rnd(0,6)});}
    canEat(f){return f.kind!=='hazard'&&OceanData.species[f.id]?.role!=='neutral'&&f.size<=this.p.size*.82;}
    isDanger(f){return OceanData.species[f.id]?.role!=='neutral'&&(f.kind==='hazard'||f.size>this.p.size*1.16);}
    dash(){const p=this.p;if(this.state!=='playing'||p.energy<28||p.dashCooldown>0||p.stun>0)return false;p.energy-=28;p.dash=.4;p.dashCooldown=.7;this.audio.dash();return true;}
    suck(){if(this.state!=='playing'||this.suckCooldown>0)return false;this.suction=1.4;this.suckCooldown=8;this.audio.tone(150,.3,'sine',.07,420);return true;}
    pause(){if(this.state==='playing'){this.state='paused';this.keys.clear();this.mouse=null;this.events.onPause?.()}}
    resume(){if(this.state==='paused'){this.state='playing';this.mouse=null;this.keys.clear()}}
    burst(x,y,color,n=9){for(let i=0;i<n;i++){if(this.particles.length>160)break;const life=rnd(.35,.8);this.particles.push({x,y,vx:rnd(-60,60),vy:rnd(-60,60),r:rnd(1,3.5),life,max:life,color})}}
    float(x,y,text,color='#e7f4d0',big=false){this.particles.push({x,y,vx:0,vy:-28,r:0,life:1,max:1,color,text,big})}
    encounter(id){if(this.seen.has(id))return;this.seen.add(id);this.events.onEncounter?.(id)}
    eat(index){
      const f=this.fish[index],p=this.p;if(!f||!this.canEat(f))return false;
      this.fish.splice(index,1);this.eaten++;this.chain=this.chainTime>0?this.chain+1:1;this.chainTime=2.8;this.maxChain=Math.max(this.maxChain,this.chain);
      const mult=Math.min(5,1+Math.floor(this.chain/5)),xp=(f.kind==='small'?2:f.kind==='medium'?4:7)*(p.frenzy>0?1.25:1),score=Math.round((f.size+10)*mult*(p.frenzy>0?2:1));
      this.score+=score;const before=Math.floor(Math.min(.999,p.xp/this.level.goal)*3);p.xp+=xp;const fraction=clamp(p.xp/this.level.goal,0,1);p.size=64+112*Math.pow(fraction,.78);const after=Math.floor(Math.min(.999,fraction)*3);
      const mouth=G.mouth(p);p.biteFlash=.19;this.burst(mouth.x,mouth.y,'#dbe9b9',6);this.float(mouth.x,mouth.y-15,'+'+score);this.audio.eat(this.chain);this.encounter(f.id);
      if(after>before){this.audio.tone(660,.2,'sine',.15,1100);this.events.onToast?.('长大了！',after===1?'现在可以吞食中型鱼':'现在可以挑战更大的鱼')}
      if(this.chain%10===0){p.frenzy=8;this.events.onToast?.('吞食狂潮','8 秒内得分翻倍 · 成长加速');this.audio.tone(850,.35,'triangle',.07,1250)}
      if(p.xp>=this.level.goal){if(this.mode==='classic')this.finish(true);else{this.wave++;p.xp=0;p.size=64;p.invincible=3;this.events.onToast?.('第 '+this.wave+' 轮探索','重新从幼鱼开始，继续积累分数');this.events.onExploreCycle?.(this)}}
      return true;
    }
    damage(f){const p=this.p;if(p.invincible>0)return;p.lives--;this.hits++;p.invincible=3;p.stun=.5;this.shake=.6;this.chain=0;this.chainTime=0;p.frenzy=0;this.audio.hit();this.burst(p.x,p.y,'#f3bd9b',14);this.float(p.x,p.y-30,'−1 生命','#f5c5a1',true);const away=Math.sign(p.x-f.x)||1;p.x=clamp(p.x+away*75,40,this.r.W-40);this.mouse=null;if(p.lives<=0)this.finish(false);}
    finish(won){if(this.state!=='playing')return;this.state='ended';this.keys.clear();const stars=won?clamp(1+(this.p.lives===3?1:0)+(this.remaining>this.level.time*.3||this.maxChain>=12?1:0),1,3):0;if(won)this.audio.win();this.events.onFinish?.({won,stars,score:this.score,eaten:this.eaten,maxChain:this.maxChain,level:this.level.id,mode:this.mode,time:this.elapsed,wave:this.wave,discovered:[...this.seen]});}
    stop(){this.state='idle';this.keys.clear();this.mouse=null;}
    update(dt){
      if(this.state!=='playing')return;dt=Math.min(.04,dt);this.elapsed+=dt;const p=this.p,b=this.bounds();
      if(this.mode==='classic'){this.remaining=Math.max(0,this.remaining-dt);if(this.remaining===0){this.finish(false);return}}
      let pBefore=G.snapshot(p);
      for(const prop of ['invincible','dash','dashCooldown','frenzy','stun','biteFlash'])p[prop]=Math.max(0,p[prop]-dt);
      p.energy=Math.min(100,p.energy+dt*13);this.suction=Math.max(0,this.suction-dt);this.suckCooldown=Math.max(0,this.suckCooldown-dt);this.shake=Math.max(0,this.shake-dt);this.chainTime=Math.max(0,this.chainTime-dt);if(!this.chainTime)this.chain=0;
      let ix=0,iy=0,tx=0,ty=0;const k=this.keys;if(k.has('ArrowLeft')||k.has('a'))ix--;if(k.has('ArrowRight')||k.has('d'))ix++;if(k.has('ArrowUp')||k.has('w'))iy--;if(k.has('ArrowDown')||k.has('s'))iy++;
      const speed=(p.dash>0?720:300)*(p.frenzy>0?1.12:1)*(p.stun>0?.32:1);
      if(ix||iy){const l=Math.hypot(ix,iy);tx=ix/l*speed;ty=iy/l*speed;this.mouse=null}else if(this.mouse){const dx=this.mouse.x-p.x,dy=this.mouse.y-p.y,d=Math.hypot(dx,dy),v=Math.min(speed,d*5);if(d>2){tx=dx/d*v;ty=dy/d*v}}
      else if(p.dash>0)tx=p.dir*speed;
      const smooth=1-Math.exp(-dt*(p.dash>0?17:9));p.vx+=(tx-p.vx)*smooth;p.vy+=(ty-p.vy)*smooth;
      p.x=clamp(p.x+p.vx*dt+Math.sin(this.elapsed*.3)*this.map.current*dt,b.left,b.right);p.y=clamp(p.y+p.vy*dt,b.top+10,Math.max(b.top+15,b.bottom));if(Math.abs(p.vx)>12)p.dir=Math.sign(p.vx);
      for(let i=this.fish.length-1;i>=0;i--){const f=this.fish[i],fBefore=G.snapshot(f),species=OceanData.species[f.id];f.age+=dt;f.rest=Math.max(0,f.rest-dt);const dx=p.x-f.x,dy=p.y-f.y,d=Math.hypot(dx,dy),danger=this.isDanger(f);let vx=f.dir*f.speed,vy=Math.sin(this.elapsed*.9+f.phase)*(species.benthic?3:12);
        if(f.kind==='hazard'){vy=Math.sin(this.elapsed+f.phase)*20-4;vx=f.dir*f.speed*.5;}
        else if((f.kind==='predator'||f.kind==='large')&&danger){
          if(d<300&&f.rest===0&&f.chaseLeft<=0&&p.invincible<=0){f.chaseLeft=2.0+this.level.local*.12;f.chasing=true;}
          if(f.chaseLeft>0){f.chaseLeft-=dt;const cs=155+this.level.local*7,mouth=G.mouth(f),target=G.body(p),aimX=target.x-mouth.x,aimY=target.y-mouth.y,aimD=Math.hypot(aimX,aimY)||1;vx=aimX/aimD*cs;vy=aimY/aimD*cs;if(f.chaseLeft<=0){f.rest=3.5;f.chasing=false;f.dir=dx>0?1:-1;}}
        }
        else if(this.canEat(f)&&d<125&&d>3){vx=-dx/d*(f.speed*1.24);vy=-dy/d*(f.speed*.8);}
        if(this.suction>0&&this.canEat(f)){const mouth=G.mouth(p),sx=mouth.x-f.x,sy=mouth.y-f.y;if(Math.hypot(sx,sy)<195){vx=sx*5.5;vy=sy*5.5;}}
        if(species.benthic&&this.suction<=0)vy+=(b.bottom-30-f.y)*.5;
        f.vx+=(vx-f.vx)*Math.min(1,dt*3);f.vy+=(vy-f.vy)*Math.min(1,dt*3);f.x+=f.vx*dt;f.y+=f.vy*dt;
        if(Math.abs(f.vx)>10)f.dir=Math.sign(f.vx);if(f.y<b.top-25){f.y=b.top-25;f.vy=Math.abs(f.vy)}if(f.y>b.bottom+25){f.y=b.bottom+25;f.vy=-Math.abs(f.vy)}
        if(f.x<-f.size*2||f.x>this.r.W+f.size*2){this.fish.splice(i,1);continue}
        if(d<260)this.encounter(f.id);
        if(this.canEat(f)&&G.bite(p,pBefore,f,fBefore)){this.eat(i);pBefore={...pBefore,size:p.size};if(this.state!=='playing')return}
        else if(p.invincible<=0&&danger&&(f.kind==='hazard'?G.touches(p,f):G.bite(f,fBefore,p,pBefore))){this.damage(f);pBefore=G.snapshot(p);if(this.state!=='playing')return}
      }
      for(let i=this.ambient.length-1;i>=0;i--){const f=this.ambient[i];f.x+=f.vx*dt;if(f.x>-f.size*.5&&f.x<this.r.W+f.size*.5)this.encounter(f.id);if(f.x<-f.size||f.x>this.r.W+f.size)this.ambient.splice(i,1)}
      if(this.ambient.length<2&&Math.random()<dt*.15)this.spawnAmbient();
      this.spawnClock-=dt;if(this.spawnClock<=0){this.spawnClock=.4;const pc=this.fish.filter(f=>f.kind==='predator').length;if(pc<this.level.threats)this.spawnFish(false,'predator');else if(this.fish.length<this.level.density)this.spawnFish();const edible=this.fish.filter(f=>this.canEat(f)).length;if(edible<8&&this.fish.length<this.level.density+6)this.spawnFish(false,'small');}
      this.pickupClock-=dt;if(this.pickupClock<=0){this.pickupClock=rnd(9,13);this.pickups.push({x:rnd(80,this.r.W-80),y:rnd(b.top+50,b.bottom-30),kind:Math.random()<.55?'pearl':'bubble',life:14})}
      for(let i=this.pickups.length-1;i>=0;i--){const q=this.pickups[i];q.life-=dt;if(Math.hypot(q.x-p.x,q.y-p.y)<p.size*.38+10){if(q.kind==='pearl'){this.score+=250;this.float(q.x,q.y,'珍珠 +250','#f1dfab')}else{p.energy=100;this.remaining+=8;this.float(q.x,q.y,this.mode==='classic'?'+8 秒 · 冲刺充满':'冲刺充满','#c8f0ed')}this.audio.tone(1047,.15,'sine',.12,1600);q.life=0;}if(q.life<=0)this.pickups.splice(i,1)}
      for(let i=this.particles.length-1;i>=0;i--){const q=this.particles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.life<=0)this.particles.splice(i,1)}
      this.events.onUpdate?.(this);
    }
  }
  return {Game,AudioEngine};
})();
