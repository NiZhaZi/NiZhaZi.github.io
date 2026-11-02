/* Rendering and bitmap extraction. No remote dependencies. */
window.OceanRender = (() => {
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  class Renderer {
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images={};this.sprites=[];this.ready=false;this.quality=true;this.labels=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.snow=Array.from({length:70},(_,i)=>({x:Math.random(),y:Math.random(),s:.3+Math.random()*1.6,v:3+Math.random()*13,phase:i}));
      this.resize();window.addEventListener('resize',()=>this.resize());
    }
    resize(){const b=this.canvas.getBoundingClientRect();this.width=b.width;this.height=b.height;this.dpr=Math.min(devicePixelRatio||1,this.quality?2:1.25);this.canvas.width=Math.round(b.width*this.dpr);this.canvas.height=Math.round(b.height*this.dpr);this.W=b.width<700?800:1440;this.H=this.W*b.height/b.width;this.scale=b.width/this.W;this.bgCache=null;}
    async load(progress){
      if(location.protocol==='file:'&&!window.OceanEmbedded){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/offline-images.js';script.onload=resolve;script.onerror=()=>reject(new Error('请解压完整离线包后再打开 index.html'));document.head.appendChild(script);});}
      let completed=0;const files=['biomes-a.png','biomes-b.png',...FaunaBounds.sheets.map(s=>s.file)];
      await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{this.images[file]=im;progress(++completed,files.length);resolve()};im.onerror=()=>reject(new Error('素材加载失败：'+file));im.src=window.OceanEmbedded?.[file]||'assets/'+file;})));
      for(const sheet of FaunaBounds.sheets)this.extract(sheet);
      if(this.sprites.filter(Boolean).length!==OceanData.species.length)throw new Error('生物素材不完整');
      this.ready=true;
    }
    extract(sheet){
      const im=this.images[sheet.file],w=im.width,h=im.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;
      const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0);const rgba=c.getImageData(0,0,w,h).data;
      const seen=new Uint8Array(w*h),queue=new Int32Array(w*h),threshold=FaunaBounds.alphaThreshold;
      for(const entry of sheet.sprites){
        const [bx,by,bw,bh]=entry.bounds,sp=document.createElement('canvas');sp.width=bw+4;sp.height=bh+4;
        const sc=sp.getContext('2d'),out=sc.createImageData(sp.width,sp.height),dst=out.data;let head=0,tail=0;
        const seed=entry.seed[1]*w+entry.seed[0];queue[tail++]=seed;seen[seed]=1;
        while(head<tail){const k=queue[head++],x=k%w,y=(k/w)|0,src=k*4,ox=x-bx+2,oy=y-by+2;
          if(ox>=0&&ox<sp.width&&oy>=0&&oy<sp.height){const j=(oy*sp.width+ox)*4;dst[j]=rgba[src];dst[j+1]=rgba[src+1];dst[j+2]=rgba[src+2];dst[j+3]=rgba[src+3];}
          const add=n=>{if(!seen[n]&&rgba[n*4+3]>threshold){seen[n]=1;queue[tail++]=n}};
          if(x>0)add(k-1);if(x<w-1)add(k+1);if(y>0)add(k-w);if(y<h-1)add(k+w);
        }
        sc.putImageData(out,0,0);this.sprites[entry.id]=sp;
      }
    }
    biome(ctx,map,x,y,w,h){
      const im=this.images[map<4?'biomes-a.png':'biomes-b.png'];if(!im){ctx.fillStyle='#0b4051';ctx.fillRect(x,y,w,h);return;}
      const tile=map%4,tw=Math.floor(im.width/2),th=Math.floor(im.height/2),sx=(tile%2)*tw+1,sy=Math.round(Math.floor(tile/2)*im.height/2)+1;
      const sw=tw-2,sh=th-2,ratio=Math.max(w/sw,h/sh),cw=w/ratio,ch=h/ratio;
      ctx.drawImage(im,sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,x,y,w,h);
    }
    thumbnail(canvas,map){const c=canvas.getContext('2d');this.biome(c,map,0,0,canvas.width,canvas.height);}
    specimen(canvas,id){const c=canvas.getContext('2d'),sp=this.sprites[id];c.clearRect(0,0,canvas.width,canvas.height);if(!sp)return;const factor=Math.min((canvas.width-12)/sp.width,(canvas.height-10)/sp.height);c.drawImage(sp,(canvas.width-sp.width*factor)/2,(canvas.height-sp.height*factor)/2,sp.width*factor,sp.height*factor);}
    fish(c,e,t,player=false){
      const sp=this.sprites[e.id];if(!sp)return;const size=e.size,h=size*sp.height/sp.width,dir=e.dir||1;
      c.save();c.translate(e.x,e.y);c.globalAlpha=e.alpha??1;
      c.rotate(OceanGeometry.angle(e));c.scale(dir,1);
      if(player){c.save();c.globalAlpha=(e.invincible>0?.40+.30*Math.sin(t*14):.6);c.strokeStyle=e.frenzy>0?'#f6df95':'#cdf5dc';c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,size*.58,h*.62+7,0,0,TAU);c.stroke();c.restore();}
      if(e.invincible>0&&Math.floor(t*12)%2===0)c.globalAlpha*=.45;
      const pieces=this.quality&&!this.reduced&&!OceanData.species[e.id].rigid?10:1,speed=Math.min(1.9,.7+Math.abs(e.vx||80)/200),amp=size*.022;
      for(let i=0;i<pieces;i++){const u=i/pieces,sw=sp.width/pieces,dx=-size/2+i*size/pieces,dy=pieces>1&&u<.4?Math.sin(t*8*speed-(1-u)*4+(e.phase||0))*amp*Math.pow(1-u/.4,2):0;const extra=i<pieces-1?.6:0;c.drawImage(sp,i*sw,0,sw,sp.height,dx,-h/2+dy,size/pieces+extra,h);}
      c.restore();
    }
    background(map,t){
      const c=this.ctx,w=this.W,h=this.H;
      if(!this.bgCache||this.bgCache.map!==map){const cv=document.createElement('canvas');cv.width=this.canvas.width;cv.height=this.canvas.height;this.biome(cv.getContext('2d'),map,0,0,cv.width,cv.height);this.bgCache={map,canvas:cv};}
      c.drawImage(this.bgCache.canvas,0,0,w,h);
      c.fillStyle=map>=6?'#02142428':'#03263517';c.fillRect(0,0,w,h);
      if(this.quality&&!this.reduced&&map<6){c.save();c.globalCompositeOperation='screen';for(let i=0;i<4;i++){const x=(.15+i*.23)*w+Math.sin(t*.13+i)*24;const g=c.createLinearGradient(x,0,x+150,h*.85);g.addColorStop(0,'#b6eae210');g.addColorStop(1,'#9ee3e400');c.fillStyle=g;c.beginPath();c.moveTo(x-20,0);c.lineTo(x+15,0);c.lineTo(x+270,h);c.lineTo(x+75,h);c.closePath();c.fill();}c.restore();}
      const count=this.quality?this.snow.length:24;c.fillStyle=map>=6?'#b9c8f3':'#d9f6f0';
      for(let i=0;i<count;i++){const p=this.snow[i],y=(p.y*h-(this.reduced?0:t*p.v)+h*20)%h,x=p.x*w+Math.sin(t*.3+p.phase)*8;c.globalAlpha=.09+(i%4)*.035;c.beginPath();c.arc(x,y,p.s,0,TAU);c.fill();}c.globalAlpha=1;
    }
    start(){this.ctx.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);}
    ambient(map,t,home=true){
      this.start();this.background(map,t);if(!this.ready)return;const c=this.ctx,w=this.W,h=this.H,m=OceanData.maps[map];
      for(let i=0;i<11;i++){const id=[...m.small,...m.medium][i%([...m.small,...m.medium].length)],speed=17+i*2,x=((i*.16*w+t*speed)%(w+200))-100,y=h*(.22+(i%4)*.11)+Math.sin(t*.4+i)*12;this.fish(c,{id,x,y,size:31+(i%4)*12,dir:i%3?1:-1,alpha:.18+(i%3)*.1,phase:i},t);}
      if(home){const narrow=this.width<700;const hero=m.player;
        this.fish(c,{id:m.ambient[0]??m.predators[0],x:w*.79+Math.sin(t*.07)*28,y:h*.24,size:narrow?210:300,dir:-1,alpha:.25,phase:3},t);
        this.fish(c,{id:hero,x:w*(narrow?.83:.73)+Math.sin(t*.24)*22,y:h*(narrow?.32:.43)+Math.sin(t*.45)*13,size:narrow?310:390,dir:-1,alpha:narrow?.62:1},t);
        if(!narrow)this.fish(c,{id:m.small[Math.min(2,m.small.length-1)],x:w*.91+Math.sin(t*.28)*10,y:h*.59+Math.sin(t*.4)*14,size:100,dir:-1,alpha:.8,phase:4},t);
      }
    }
    game(g,t){
      this.start();const c=this.ctx;this.background(g.map.id,t);
      if(g.shake>0)c.translate((Math.random()-.5)*g.shake*10,(Math.random()-.5)*g.shake*10);
      for(const f of g.ambient)this.fish(c,f,t);
      for(const f of g.fish){
        this.fish(c,f,t);const dist=Math.hypot(f.x-g.p.x,f.y-g.p.y),edible=g.canEat(f),danger=g.isDanger(f),sp=this.sprites[f.id],fh=f.size*(sp?sp.height/sp.width:.4);
        if(dist<220&&this.labels){if(edible||danger){c.fillStyle=edible?'#c6ebc5':'#f4ba99';c.globalAlpha=.85;c.beginPath();c.arc(f.x,f.y-fh*.55-9,2.3,0,TAU);c.fill();c.globalAlpha=1;}if(danger&&f.chasing){c.font='bold 16px sans-serif';c.textAlign='center';c.fillStyle='#ffe1b8';c.fillText('!',f.x,f.y-fh*.55-18);}}
      }
      const mouth=OceanGeometry.mouth(g.p);
      if(g.suction>0){c.save();const radius=110+Math.sin(t*8)*15;c.strokeStyle='#daf5dc66';c.lineWidth=1.5;c.setLineDash([4,10]);c.beginPath();c.arc(mouth.x,mouth.y,radius,0,TAU);c.stroke();c.restore();}
      for(const p of g.pickups){const a=.7+Math.sin(t*4+p.x)*.2;c.save();c.globalAlpha=a;c.fillStyle=p.kind==='pearl'?'#e9ddad':'#a2e4e5';c.strokeStyle='#e7f6dd88';c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,9+Math.sin(t*3)*1.1,0,TAU);c.fill();c.stroke();c.globalAlpha=.2;c.beginPath();c.arc(p.x,p.y,16,0,TAU);c.stroke();c.restore();}
      this.fish(c,g.p,t,true);
      if(g.p.biteFlash>0){c.save();c.globalAlpha=g.p.biteFlash/.19;c.strokeStyle='#efffd3';c.lineWidth=1.6;c.beginPath();c.arc(mouth.x,mouth.y,mouth.r+4+(1-g.p.biteFlash/.19)*7,0,TAU);c.stroke();c.restore();}
      if(g.elapsed<9){c.fillStyle='#e2f4db';c.font='12px sans-serif';c.textAlign='center';c.fillText('你',g.p.x,g.p.y-g.p.size*.35-19);}
      if(g.map.dark){const grad=c.createRadialGradient(g.p.x,g.p.y,100,g.p.x,g.p.y,Math.max(this.W,this.H)*.7);grad.addColorStop(0,'#01081700');grad.addColorStop(1,`rgba(1,5,18,${g.map.dark})`);c.fillStyle=grad;c.fillRect(0,0,this.W,this.H);}
      for(const p of g.particles){c.globalAlpha=Math.min(1,p.life/p.max);c.fillStyle=p.color;if(p.text){c.font=`${p.big?'600 23':'15'}px sans-serif`;c.textAlign='center';c.fillText(p.text,p.x,p.y);}else{c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.fill();}}c.globalAlpha=1;
      if(g.p.frenzy>0){const grad=c.createLinearGradient(0,0,0,this.H);grad.addColorStop(0,'#f9d68414');grad.addColorStop(.5,'#f9d68400');grad.addColorStop(1,'#f9d68414');c.fillStyle=grad;c.fillRect(0,0,this.W,this.H);}
    }
  }
  return {Renderer,clamp};
})();
