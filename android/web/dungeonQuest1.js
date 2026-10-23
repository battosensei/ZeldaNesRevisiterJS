/*
 * Enhanced Quest 1 dungeon runtime for ZeldaNesRevisiterJS.
 * Level 1 room contents follow the Puissance-Zelda first-quest walkthrough.
 * Levels 2-9 use their canonical enemy families + canonical boss assignments
 * until their full room-by-room data is authored.
 */
(function (global) {
  'use strict';

  const base = global.DungeonNES;
  if (!base) return;
  const LEVELS = base.LEVELS;
  const ENTRANCE_SCREENS = base.ENTRANCE_SCREENS;
  const state = base.state;
  const originalLoadRom = base.loadOriginalRom ? base.loadOriginalRom.bind(base) : null;

  const meta = global.ZeldaQuestDungeonMeta || (global.ZeldaQuestDungeonMeta = {
    keys: 0,
    bombs: 0,
    items: new Set(),
    triforce: new Set(),
    roomMemory: Object.create(null)
  });

  const PALETTES = {
    1:['#000000','#5c5c5c','#00a8a8','#f8f8f8'],
    2:['#000000','#5c5c5c','#3050c8','#f8f8f8'],
    3:['#000000','#5c5c5c','#18a840','#f8f8f8'],
    4:['#000000','#5c5c5c','#b08018','#f8f8f8'],
    5:['#000000','#5c5c5c','#18a840','#f8f8f8'],
    6:['#000000','#5c5c5c','#b08018','#f8f8f8'],
    7:['#000000','#5c5c5c','#18a840','#f8f8f8'],
    8:['#000000','#5c5c5c','#888888','#f8f8f8'],
    9:['#000000','#5c5c5c','#888888','#f8f8f8']
  };

  const SPRITES = {
    KEESE:{x:256,y:272,w:16,h:16},
    STALFOS:{x:0,y:176,w:16,h:16},
    GEL:{x:400,y:176,w:16,h:16},
    ZOL:{x:400,y:208,w:16,h:16},
    GORIYA:{x:32,y:240,w:16,h:16},
    WALLMASTER:{x:368,y:176,w:16,h:16},
    ROPE:{x:320,y:272,w:16,h:16},
    DARKNUT:{x:112,y:176,w:16,h:16},
    GIBDO:{x:208,y:176,w:16,h:16},
    VIRE:{x:304,y:176,w:16,h:16},
    POLSVOICE:{x:240,y:176,w:16,h:16},
    WIZZROBE:{x:208,y:208,w:16,h:16},
    LIKELIKE:{x:176,y:176,w:16,h:16},
    MOLDORM:{x:384,y:272,w:16,h:16},
    DODONGO:{x:64,y:304,w:32,h:16},
    LANMOLA:{x:384,y:272,w:16,h:16}
  };

  const ENEMY_DEF = {
    KEESE:{hp:1,speed:1.55,damage:.5,ai:'fly'},
    STALFOS:{hp:1,speed:.65,damage:.5,ai:'wander'},
    GEL:{hp:1,speed:.55,damage:.5,ai:'chase'},
    ZOL:{hp:2,speed:.55,damage:.5,ai:'chase'},
    GORIYA:{hp:3,speed:.65,damage:.5,ai:'throw'},
    WALLMASTER:{hp:2,speed:.78,damage:1,ai:'chase'},
    ROPE:{hp:1,speed:1.15,damage:.5,ai:'charge'},
    DARKNUT:{hp:4,speed:.55,damage:1,ai:'wander'},
    GIBDO:{hp:4,speed:.42,damage:1,ai:'chase'},
    VIRE:{hp:2,speed:.9,damage:.5,ai:'fly'},
    POLSVOICE:{hp:3,speed:.72,damage:1,ai:'wander'},
    WIZZROBE:{hp:3,speed:.6,damage:1,ai:'teleport'},
    LIKELIKE:{hp:3,speed:.48,damage:1,ai:'chase'},
    MOLDORM:{hp:2,speed:.95,damage:.5,ai:'wander'},
    DODONGO:{hp:4,speed:.52,damage:1,ai:'wander'},
    LANMOLA:{hp:3,speed:1.05,damage:1,ai:'charge'},
    AQUAMENTUS:{hp:6,speed:.35,damage:1,ai:'aquamentus',boss:true},
    MANHANDLA:{hp:8,speed:.7,damage:1,ai:'boss',boss:true},
    GLEEOK:{hp:10,speed:.1,damage:1,ai:'boss',boss:true},
    DIGDOGGER:{hp:8,speed:.8,damage:1,ai:'boss',boss:true},
    GOHMA:{hp:6,speed:.35,damage:1,ai:'boss',boss:true},
    GANON:{hp:12,speed:.8,damage:1,ai:'boss',boss:true}
  };

  const LEVEL_POOLS = {
    1:['KEESE','STALFOS','GEL','GORIYA','WALLMASTER'],
    2:['ROPE','GEL','GORIYA','MOLDORM'],
    3:['ZOL','DARKNUT','KEESE'],
    4:['KEESE','VIRE','ZOL'],
    5:['POLSVOICE','GIBDO','DARKNUT','KEESE'],
    6:['WIZZROBE','ZOL','KEESE','LIKELIKE','ROPE'],
    7:['MOLDORM','KEESE','GORIYA','STALFOS','DODONGO'],
    8:['DARKNUT','GIBDO','POLSVOICE','KEESE','LIKELIKE'],
    9:['LIKELIKE','ZOL','LANMOLA','KEESE','WIZZROBE','DARKNUT']
  };
  const BOSSES={1:'AQUAMENTUS',2:'DODONGO',3:'MANHANDLA',4:'GLEEOK',5:'DIGDOGGER',6:'GOHMA',7:'AQUAMENTUS',8:'GLEEOK',9:'GANON'};

  const ROOM_CONTENTS = {
    1:{
      C1:{layout:'entrance'},
      B1:{enemies:[['KEESE',3]],reward:'KEY',layout:'empty'},
      D1:{enemies:[['STALFOS',5]],reward:'KEY',layout:'blocks4'},
      C2:{enemies:[['STALFOS',3]],layout:'cross'},
      C3:{enemies:[['STALFOS',4]],reward:'KEY',layout:'blocks4'},
      D3:{enemies:[['KEESE',4]],reward:'COMPASS',layout:'empty'},
      B3:{enemies:[['KEESE',4]],layout:'blocks4'},
      B4:{enemies:[['GEL',3]],layout:'push'},
      A4:{npc:'OLD MAN',layout:'oldman'},
      C4:{enemies:[['GEL',3]],reward:'MAP',layout:'cross'},
      C5:{enemies:[['STALFOS',4]],reward:'KEY',layout:'blocks4'},
      C6:{enemies:[['GORIYA',3]],reward:'KEY',layout:'columns'},
      B6:{enemies:[['KEESE',4]],reward:'BOW',layout:'stairs'},
      D4:{enemies:[['GORIYA',3]],reward:'BOOMERANG',layout:'columns'},
      E4:{enemies:[['WALLMASTER',4]],reward:'KEY',layout:'wallmaster'},
      E5:{enemies:[['AQUAMENTUS',1]],reward:'HEART',layout:'boss'},
      F5:{reward:'TRIFORCE',layout:'triforce'}
    }
  };

  const LOCKED = {
    1:new Set(['C1|C2','B3|B4','C5|C6','B6|C6','C4|D4','E4|E5'])
  };
  const SHUTTERS = {
    1:new Set(['A4|B4'])
  };

  function rc(id){ return {c:id.charCodeAt(0)-65,r:parseInt(id.slice(1),10)-1}; }
  function label(c,r){ return String.fromCharCode(65+c)+(r+1); }
  function buildRooms(level){
    const def=LEVELS[level], h=def.rows.length, rooms={};
    for(let top=0;top<h;top++){
      const rowNum=h-top,line=def.rows[top];
      for(let c=0;c<line.length;c++) if(line[c]!=='.'){
        const id=label(c,rowNum-1); rooms[id]={id,c,r:rowNum-1,mark:line[c]};
      }
    }
    return rooms;
  }
  function adjacent(id,dc,dr){
    const a=rc(id), n=label(a.c+dc,a.r+dr); return state.rooms && state.rooms[n]?n:null;
  }
  function nextForDir(dir){
    return dir==='N'?adjacent(state.room,0,1):dir==='S'?adjacent(state.room,0,-1):dir==='W'?adjacent(state.room,-1,0):adjacent(state.room,1,0);
  }
  function edge(a,b){ return [a,b].sort().join('|'); }
  function isLocked(a,b){ return !!(b && LOCKED[state.level] && LOCKED[state.level].has(edge(a,b)) && !meta.roomMemory['unlock:'+state.level+':'+edge(a,b)]); }
  function isShutter(a,b){ return !!(b && SHUTTERS[state.level] && SHUTTERS[state.level].has(edge(a,b))); }
  function roomKey(){ return state.level+':'+state.room; }
  function memory(){ return meta.roomMemory[roomKey()] || (meta.roomMemory[roomKey()]={cleared:false,rewardTaken:false,enemies:null}); }

  function roomSpec(level,room){
    if(ROOM_CONTENTS[level] && ROOM_CONTENTS[level][room]) return ROOM_CONTENTS[level][room];
    const d=LEVELS[level];
    if(room===d.boss) return {enemies:[[BOSSES[level],1]],reward:'HEART',layout:'boss'};
    if(room===d.triforce) return {reward:level===9?'ZELDA':'TRIFORCE',layout:'triforce'};
    if(d.itemRooms && d.itemRooms[room]) return {enemies:[[LEVEL_POOLS[level][0],3]],reward:d.itemRooms[room],layout:'stairs'};
    if(room===d.entrance) return {layout:'entrance'};
    const p=LEVEL_POOLS[level]||['STALFOS']; const q=rc(room); const t=p[(q.c*3+q.r*5+level)%p.length];
    return {enemies:[[t,2+((q.c+q.r+level)%3)]],layout:['empty','blocks4','cross','columns'][(q.c+q.r)%4]};
  }

  function spawnEnemy(type,i,count){
    const def=ENEMY_DEF[type]||ENEMY_DEF.STALFOS;
    const spots=[[64,96],[112,96],[160,96],[80,144],[128,144],[176,144],[96,120],[152,120]];
    const p=spots[i%spots.length];
    return {type,x:p[0],y:p[1],vx:0,vy:0,hp:def.hp,maxHp:def.hp,dead:false,timer:20+i*17,phase:i,hit:0,shot:20+i*11};
  }
  function ensureRoomRuntime(){
    const m=memory(), spec=roomSpec(state.level,state.room);
    if(m.cleared){ state.roomEnemies=[]; }
    else if(!m.enemies){
      const arr=[]; let k=0;
      for(const pair of (spec.enemies||[])) for(let i=0;i<pair[1];i++) arr.push(spawnEnemy(pair[0],k++,pair[1]));
      m.enemies=arr;
    }
    state.roomEnemies=m.enemies||[];
    state.projectiles=[];
    state.reward=null;
    if((m.cleared || !state.roomEnemies.length) && spec.reward && !m.rewardTaken) spawnReward(spec.reward);
  }
  function spawnReward(type){ state.reward={type,x:120,y:126}; }

  function enter(level,returnMap){
    if(!LEVELS[level]) return false;
    state.active=true; state.level=level; state.rooms=buildRooms(level); state.room=LEVELS[level].entrance;
    state.returnMap=returnMap==null?ENTRANCE_SCREENS[level]:returnMap;
    state.x=120; state.y=165; state.vx=0; state.vy=0; state.dir='up'; state.transitionLock=24;
    state.visited=new Set([state.room]); state.message=`LEVEL-${level}  ${LEVELS[level].name}`; state.messageTimer=110;
    state.attackTimer=0; state.attackCooldown=0; state.invincible=0; state.hp=3; state.roomEnemies=[]; state.projectiles=[];
    ensureRoomRuntime();
    try{
      if(typeof backgroundMusic!=='undefined') backgroundMusic.pause();
      if(!state.dungeonMusic){state.dungeonMusic=new Audio();state.dungeonMusic.loop=true;}
      state.dungeonMusic.src=level===9?'./sounds/09 - Death Mountain.mp3':'./sounds/04 - Dungeon.mp3';
      state.dungeonMusic.currentTime=0; state.dungeonMusic.play().catch(()=>{});
    }catch(_){ }
    return true;
  }

  function exit(){
    state.active=false; state.roomEnemies=[]; state.projectiles=[];
    try{if(state.dungeonMusic)state.dungeonMusic.pause(); if(typeof backgroundMusic!=='undefined')backgroundMusic.play().catch(()=>{});}catch(_){ }
  }

  function tryDoor(dir){
    const n=nextForDir(dir); if(!n) return null;
    if(isShutter(state.room,n) && !memory().cleared){state.message='DEFEAT ENEMIES';state.messageTimer=60;return null;}
    if(isLocked(state.room,n)){
      if(meta.keys<=0){state.message='NEED A KEY';state.messageTimer=60;return null;}
      meta.keys--; meta.roomMemory['unlock:'+state.level+':'+edge(state.room,n)]=true; state.message='KEY USED';state.messageTimer=45;
    }
    return n;
  }

  function changeRoom(n,dir){
    if(!n||state.transitionLock>0)return;
    state.room=n; state.visited.add(n); state.transitionLock=14;
    if(dir==='N'){state.y=174;state.x=120;} if(dir==='S'){state.y=76;state.x=120;} if(dir==='W'){state.x=202;state.y=126;} if(dir==='E'){state.x=38;state.y=126;}
    ensureRoomRuntime();
    const d=LEVELS[state.level]; if(n===d.boss){state.message=BOSSES[state.level];state.messageTimer=70;}
  }

  function hitbox(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
  function swordBox(){
    if(state.dir==='up')return{x:state.x+4,y:state.y-14,w:10,h:18};
    if(state.dir==='down')return{x:state.x+4,y:state.y+12,w:10,h:18};
    if(state.dir==='left')return{x:state.x-14,y:state.y+4,w:18,h:10};
    return{x:state.x+12,y:state.y+4,w:18,h:10};
  }

  function updateEnemies(){
    const es=state.roomEnemies||[];
    const minX=42,maxX=198,minY=82,maxY=164;
    for(const e of es){
      if(e.dead)continue; const def=ENEMY_DEF[e.type]||ENEMY_DEF.STALFOS; e.timer++; if(e.hit>0)e.hit--;
      const dx=state.x-e.x,dy=state.y-e.y,dist=Math.max(1,Math.hypot(dx,dy));
      if(def.ai==='fly'){
        e.x+=Math.sin((e.timer+e.phase*17)/14)*def.speed; e.y+=Math.cos((e.timer+e.phase*23)/18)*def.speed;
      }else if(def.ai==='chase'||def.ai==='charge'){
        const mul=def.ai==='charge'&&e.timer%120>82?1.9:1; e.x+=dx/dist*def.speed*mul; e.y+=dy/dist*def.speed*mul;
      }else if(def.ai==='throw'){
        if(e.timer%70===0){state.projectiles.push({kind:'enemy',x:e.x+8,y:e.y+8,vx:dx/dist*1.55,vy:dy/dist*1.55,life:130});}
        if(e.timer%55<28)e.x+=dx/dist*def.speed*.55; else e.y+=dy/dist*def.speed*.55;
      }else if(def.ai==='teleport'){
        if(e.timer%95===0){e.x=minX+Math.random()*(maxX-minX);e.y=minY+Math.random()*(maxY-minY);}
        if(e.timer%75===20)state.projectiles.push({kind:'enemy',x:e.x+8,y:e.y+8,vx:dx/dist*1.7,vy:dy/dist*1.7,life:120});
      }else if(def.ai==='aquamentus'){
        e.x=170+Math.sin(e.timer/38)*10; e.y=108+Math.sin(e.timer/29)*18;
        if(e.timer%85===0){
          const ang=Math.atan2(dy,dx); for(const off of [-.28,0,.28])state.projectiles.push({kind:'enemy',x:e.x,y:e.y+10,vx:Math.cos(ang+off)*1.65,vy:Math.sin(ang+off)*1.65,life:160});
        }
      }else if(def.boss){
        e.x+=dx/dist*def.speed*.35;e.y+=dy/dist*def.speed*.35;
        if(e.timer%80===0)state.projectiles.push({kind:'enemy',x:e.x+8,y:e.y+8,vx:dx/dist*1.6,vy:dy/dist*1.6,life:140});
      }else{
        if(e.timer%75===0){const a=Math.random()*Math.PI*2;e.vx=Math.cos(a)*def.speed;e.vy=Math.sin(a)*def.speed;}
        e.x+=e.vx;e.y+=e.vy;
      }
      e.x=Math.max(minX,Math.min(maxX,e.x));e.y=Math.max(minY,Math.min(maxY,e.y));
      if(state.attackTimer>0 && e.hit===0 && hitbox(swordBox(),{x:e.x,y:e.y,w:e.type==='AQUAMENTUS'?24:16,h:e.type==='AQUAMENTUS'?28:16})){
        e.hp--;e.hit=8;if(e.hp<=0)e.dead=true;
      }
      if(state.invincible<=0 && hitbox({x:state.x,y:state.y,w:14,h:14},{x:e.x,y:e.y,w:16,h:16})){
        state.hp-=def.damage;state.invincible=45;
      }
    }
    const alive=es.filter(e=>!e.dead);
    if(alive.length===0 && es.length){
      const m=memory();m.cleared=true;m.enemies=[];state.roomEnemies=[];
      const spec=roomSpec(state.level,state.room);if(spec.reward&&!m.rewardTaken)spawnReward(spec.reward);
      state.message='ROOM CLEAR';state.messageTimer=45;
    }
  }

  function updateProjectiles(){
    for(const p of state.projectiles||[]){
      p.x+=p.vx;p.y+=p.vy;p.life--;
      if(p.kind==='enemy'&&state.invincible<=0&&hitbox({x:state.x,y:state.y,w:14,h:14},{x:p.x,y:p.y,w:6,h:6})){
        state.hp-=.5;state.invincible=35;p.life=0;
      }
      if(p.kind==='player'){
        for(const e of state.roomEnemies||[]){
          if(e.dead)continue;
          if(hitbox({x:p.x,y:p.y,w:7,h:7},{x:e.x,y:e.y,w:16,h:16})){
            if(e.type==='KEESE'||e.type==='GEL') e.hp=0;
            e.hit=12; if(e.hp<=0)e.dead=true; p.life=0; break;
          }
        }
      }
    }
    state.projectiles=(state.projectiles||[]).filter(p=>p.life>0&&p.x>30&&p.x<226&&p.y>70&&p.y<188);
  }

  function collectReward(){
    if(!state.reward)return; const r=state.reward;
    if(Math.abs((state.x+8)-r.x)<16&&Math.abs((state.y+8)-r.y)<16){
      const m=memory();m.rewardTaken=true;
      if(r.type==='KEY'){meta.keys++;state.message='KEY +1';}
      else if(r.type==='HEART'){state.hp=Math.min(6,state.hp+1);state.message='HEART CONTAINER';}
      else if(r.type==='TRIFORCE'){meta.triforce.add(state.level);state.message='TRIFORCE';}
      else if(r.type==='ZELDA'){state.message='ZELDA RESCUED';}
      else{meta.items.add(r.type);state.message=r.type;}
      state.messageTimer=90;state.reward=null;
    }
  }

  function update(){
    if(!state.active)return;
    if(state.transitionLock>0)state.transitionLock--;if(state.messageTimer>0)state.messageTimer--;if(state.attackCooldown>0)state.attackCooldown--;if(state.attackTimer>0)state.attackTimer--;if(state.invincible>0)state.invincible--;
    const speed=1.45;state.x+=state.vx*speed;state.y+=state.vy*speed;
    updateEnemies();updateProjectiles();collectReward();
    if(state.y<65&&state.x>103&&state.x<153){const n=tryDoor('N');if(n)changeRoom(n,'N');else state.y=65;}
    if(state.y>190&&state.x>103&&state.x<153){const n=tryDoor('S');if(n)changeRoom(n,'S');else if(state.room===LEVELS[state.level].entrance)exit();else state.y=190;}
    if(state.x<23&&state.y>108&&state.y<150){const n=tryDoor('W');if(n)changeRoom(n,'W');else state.x=23;}
    if(state.x>217&&state.y>108&&state.y<150){const n=tryDoor('E');if(n)changeRoom(n,'E');else state.x=217;}
    state.x=Math.max(23,Math.min(217,state.x));state.y=Math.max(65,Math.min(190,state.y));
  }

  function handleKeyDown(e){
    if(!state.active)return false;
    if(e.keyCode===37){state.vx=-1;state.dir='left';return true;}
    if(e.keyCode===39){state.vx=1;state.dir='right';return true;}
    if(e.keyCode===38){state.vy=-1;state.dir='up';return true;}
    if(e.keyCode===40){state.vy=1;state.dir='down';return true;}
    if(e.keyCode===32){if(state.attackCooldown<=0){state.attackTimer=8;state.attackCooldown=12;}return true;}
    if(e.keyCode===66){
      if(meta.items.has('BOOMERANG')){
        const d=state.dir==='left'?[-1,0]:state.dir==='right'?[1,0]:state.dir==='up'?[0,-1]:[0,1];
        state.projectiles.push({kind:'player',x:state.x+8,y:state.y+8,vx:d[0]*2.4,vy:d[1]*2.4,life:45});
      }
      return true;
    }
    if(e.keyCode===13||e.keyCode===16)return true;
    if(e.keyCode===27){exit();return true;}
    return false;
  }
  function handleKeyUp(e){
    if(!state.active)return false;
    if(e.keyCode===37&&state.vx<0)state.vx=0;
    if(e.keyCode===39&&state.vx>0)state.vx=0;
    if(e.keyCode===38&&state.vy<0)state.vy=0;
    if(e.keyCode===40&&state.vy>0)state.vy=0;
    return [37,38,39,40,32,66,13,16].includes(e.keyCode);
  }

  function drawBrick(ctx,x,y,pal){ctx.fillStyle=pal[2];ctx.fillRect(x,y,16,16);ctx.fillStyle=pal[1];ctx.fillRect(x+2,y+2,12,3);ctx.fillRect(x+2,y+11,12,3);}
  function drawDoor(ctx,dir,n,pal){
    const locked=n&&isLocked(state.room,n),shutter=n&&isShutter(state.room,n)&&!memory().cleared;
    ctx.fillStyle=locked?'#b89020':shutter?'#777':'#000';
    if(dir==='N')ctx.fillRect(104,56,48,18);
    if(dir==='S')ctx.fillRect(104,182,48,18);
    if(dir==='W')ctx.fillRect(16,108,18,44);
    if(dir==='E')ctx.fillRect(222,108,18,44);
    if(locked){
      ctx.fillStyle='#111';
      if(dir==='N'||dir==='S')ctx.fillRect(126,63+(dir==='S'?119:0),4,7);
      else ctx.fillRect((dir==='W'?23:229),126,7,4);
    }
  }
  function drawLayout(ctx,layout,pal){
    ctx.fillStyle='#000';ctx.fillRect(32,74,192,108);
    const block=(x,y)=>{ctx.fillStyle=pal[2];ctx.fillRect(x,y,16,16);ctx.fillStyle=pal[1];ctx.fillRect(x+3,y+3,10,10);};
    if(layout==='blocks4'){[[80,104],[160,104],[80,144],[160,144]].forEach(p=>block(...p));}
    if(layout==='cross'){[[112,104],[128,104],[112,120],[128,120],[112,136],[128,136]].forEach(p=>block(...p));}
    if(layout==='columns'){for(const x of [72,168])for(const y of [96,128,160])block(x,y);}
    if(layout==='push'){[[96,112],[112,112],[128,112],[144,112]].forEach(p=>block(...p));}
    if(layout==='stairs'){
      ctx.fillStyle='#444';ctx.fillRect(112,120,32,24);ctx.fillStyle='#000';
      for(let i=0;i<4;i++)ctx.fillRect(116+i*6,124,3,16);
    }
    if(layout==='oldman'){
      ctx.fillStyle='#8b4b18';ctx.fillRect(112,96,32,16);ctx.fillStyle='#f8f8f8';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('OLD MAN',128,128);ctx.textAlign='left';
    }
    if(layout==='boss'){for(const y of [88,152])for(const x of [48,64,80,176,192])block(x,y);}
    if(layout==='triforce'){
      ctx.fillStyle='#f8b800';ctx.beginPath();ctx.moveTo(128,104);ctx.lineTo(116,128);ctx.lineTo(140,128);ctx.closePath();ctx.fill();
    }
  }

  function drawEnemy(ctx,e){
    if(e.dead)return;
    if(e.hit>0&&e.hit%2===0)return;
    if(e.type==='AQUAMENTUS'){
      ctx.fillStyle='#30a830';ctx.fillRect(e.x,e.y,24,28);
      ctx.fillStyle='#f8f8f8';ctx.fillRect(e.x+18,e.y+5,4,4);
      ctx.fillStyle='#b89020';ctx.fillRect(e.x+22,e.y+10,8,3);ctx.fillRect(e.x+7,e.y-5,3,7);
      return;
    }
    if(ENEMY_DEF[e.type]&&ENEMY_DEF[e.type].boss){
      ctx.fillStyle='#d85828';ctx.fillRect(e.x-4,e.y-4,24,24);
      ctx.fillStyle='#fff';ctx.font='6px monospace';ctx.fillText(e.type.slice(0,4),e.x-3,e.y+11);
      return;
    }
    const s=SPRITES[e.type]||SPRITES.STALFOS;
    try{
      if(typeof enemies!=='undefined'&&enemies.complete)ctx.drawImage(enemies,s.x,s.y,s.w,s.h,Math.round(e.x),Math.round(e.y),16,16);
      else throw 0;
    }catch(_){
      ctx.fillStyle='#fff';ctx.fillRect(e.x,e.y,12,12);
    }
  }
  function drawReward(ctx,r){
    if(!r)return;
    ctx.textAlign='center';ctx.font='8px monospace';ctx.fillStyle='#f8b800';
    const glyph={KEY:'KEY',MAP:'MAP',COMPASS:'COMP',BOW:'BOW',BOOMERANG:'BOOM',HEART:'♥',TRIFORCE:'▲',ZELDA:'ZELDA'}[r.type]||r.type;
    ctx.fillText(glyph,r.x,r.y);ctx.textAlign='left';
  }
  function drawLinkDungeon(ctx){
    try{
      if(typeof link1!=='undefined'&&link1.complete){
        const sx=state.dir==='left'?30:state.dir==='right'?91:state.dir==='up'?62:0;
        ctx.drawImage(link1,sx,0,16,16,Math.round(state.x),Math.round(state.y),16,16);
      }else throw 0;
    }catch(_){
      ctx.fillStyle='#00a800';ctx.fillRect(state.x,state.y,14,14);
    }
    if(state.attackTimer>0){
      const b=swordBox();ctx.fillStyle='#f8f8f8';
      if(state.dir==='up'||state.dir==='down')ctx.fillRect(b.x+3,b.y,3,b.h);
      else ctx.fillRect(b.x,b.y+3,b.w,3);
    }
  }
  function drawMiniMap(ctx){
    const rooms=state.rooms,w=Math.max(...Object.values(rooms).map(r=>r.c))+1,h=Math.max(...Object.values(rooms).map(r=>r.r))+1,s=Math.max(2,Math.min(5,Math.floor(52/Math.max(w,h)))),ox=100,oy=4;
    for(const r of Object.values(rooms)){
      if(!meta.items.has('MAP')&&!state.visited.has(r.id)&&r.id!==state.room)continue;
      ctx.fillStyle=r.id===state.room?'#fff':'#666';ctx.fillRect(ox+r.c*s,oy+(h-1-r.r)*s,s-1,s-1);
      if(meta.items.has('COMPASS')&&r.id===LEVELS[state.level].triforce){
        ctx.fillStyle='#f8b800';ctx.fillRect(ox+r.c*s,oy+(h-1-r.r)*s,2,2);
      }
    }
  }
  function drawHUD(ctx,pal){
    ctx.fillStyle='#000';ctx.fillRect(0,0,256,56);
    ctx.fillStyle=pal[2];ctx.font='8px monospace';ctx.fillText(`LEVEL-${state.level}`,16,15);
    ctx.fillStyle='#fff';ctx.fillText(LEVELS[state.level].name,16,29);
    ctx.fillText(`KEY x${meta.keys}`,176,15);ctx.fillText(`ROOM ${state.room}`,176,29);
    for(let i=0;i<3;i++){ctx.fillStyle=i<Math.ceil(state.hp)?'#d82800':'#552000';ctx.fillRect(176+i*10,40,7,7);}
    drawMiniMap(ctx);
  }
  function drawRoom(ctx){
    const pal=PALETTES[state.level]||PALETTES[1],spec=roomSpec(state.level,state.room);
    ctx.fillStyle='#000';ctx.fillRect(0,0,256,240);drawHUD(ctx,pal);
    for(let x=16;x<240;x+=16){drawBrick(ctx,x,56,pal);drawBrick(ctx,x,184,pal);}
    for(let y=72;y<184;y+=16){drawBrick(ctx,16,y,pal);drawBrick(ctx,224,y,pal);}
    drawLayout(ctx,spec.layout||'empty',pal);
    const nN=adjacent(state.room,0,1),nS=adjacent(state.room,0,-1),nW=adjacent(state.room,-1,0),nE=adjacent(state.room,1,0);
    if(nN)drawDoor(ctx,'N',nN,pal);
    if(nS||state.room===LEVELS[state.level].entrance)drawDoor(ctx,'S',nS,pal);
    if(nW)drawDoor(ctx,'W',nW,pal);
    if(nE)drawDoor(ctx,'E',nE,pal);
    for(const e of state.roomEnemies||[])drawEnemy(ctx,e);
    for(const p of state.projectiles||[]){
      ctx.fillStyle=p.kind==='enemy'?'#f85020':'#80d8ff';ctx.fillRect(p.x,p.y,5,5);
    }
    drawReward(ctx,state.reward);drawLinkDungeon(ctx);
    if(spec.npc){
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='8px monospace';ctx.fillText('SECRET IS IN THE TREE',128,152);ctx.textAlign='left';
    }
    if(state.messageTimer>0){
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='9px monospace';ctx.fillText(state.message,128,222);ctx.textAlign='left';
    }
  }
  function updateAndDraw(ctx){update();drawRoom(ctx);}

  function maybeEnterFromOverworld(mapId,x,y){
    if(state.active)return true;
    let lev=0;for(const k in ENTRANCE_SCREENS)if(ENTRANCE_SCREENS[k]===mapId)lev=+k;
    if(!lev)return false;
    const zones={1:[96,160,112,176],2:[96,160,112,176],3:[96,160,112,176],4:[96,160,112,176],5:[96,160,112,176],6:[96,160,112,176],7:[96,160,112,176],8:[176,224,96,176],9:[48,112,112,192]},z=zones[lev];
    if(x>=z[0]&&x<=z[1]&&y>=z[2]&&y<=z[3]){enter(lev,mapId);return true;}
    return false;
  }

  async function loadOriginalRom(file){ return originalLoadRom?originalLoadRom(file):false; }

  global.DungeonNES={LEVELS,ENTRANCE_SCREENS,state,enter,exit,handleKeyDown,handleKeyUp,updateAndDraw,maybeEnterFromOverworld,loadOriginalRom,meta};
})(window);
