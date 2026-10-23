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

  function playSfx(file,volume){
    try{
      const a=new Audio('./sounds/'+file);
      a.volume=volume==null?.72:volume;
      a.play().catch(()=>{});
    }catch(_){}
  }
  function addEffect(kind,x,y){
    if(!state.effects)state.effects=[];
    state.effects.push({kind,x,y,life:kind==='death'?18:10,max:kind==='death'?18:10});
  }
  function hurtLink(amount){
    if(state.invincible>0)return;
    state.hp=Math.max(0,state.hp-amount);
    state.invincible=40;
    addEffect('hurt',state.x+8,state.y+8);
    playSfx('LOZ_Link_Hurt.wav',.75);
  }
  function hurtEnemy(e,amount,sourceX,sourceY){
    if(!e||e.dead||amount<=0)return false;
    const def=ENEMY_DEF[e.type]||ENEMY_DEF.STALFOS;
    e.hp-=amount;e.hit=10;
    const dx=e.x-sourceX,dy=e.y-sourceY,d=Math.max(1,Math.hypot(dx,dy));
    const kb=def.boss?2.2:5.5;
    e.x+=dx/d*kb;e.y+=dy/d*kb;
    addEffect('hit',e.x+8,e.y+8);
    playSfx(def.boss?'LOZ_Boss_Hit.wav':'LOZ_Enemy_Hit.wav',def.boss ? .78 : .68);
    if(e.hp<=0){
      e.dead=true;
      addEffect('death',e.x+8,e.y+8);
      playSfx(def.boss?'LOZ_Boss_Scream1.wav':'LOZ_Enemy_Die.wav',def.boss ? .86 : .76);
      if(!e.splitDone&&(e.type==='VIRE'||e.type==='ZOL')){
        e.splitDone=true;
        const child=e.type==='VIRE'?'KEESE':'GEL';
        const es=state.roomEnemies||[];
        for(let j=0;j<2;j++){
          const c=spawnEnemy(child,j,2);c.x=e.x+(j?8:-8);c.y=e.y;es.push(c);
        }
      }
    }
    return true;
  }
  function updateEffects(){
    if(!state.effects)return;
    for(const fx of state.effects)fx.life--;
    state.effects=state.effects.filter(fx=>fx.life>0);
  }

  const meta = global.ZeldaQuestDungeonMeta || (global.ZeldaQuestDungeonMeta = {
    keys: 0,
    bombs: 0,
    maxBombs: 8,
    maxHp: 3,
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
    LANMOLA:{x:384,y:272,w:16,h:16},
    PATRA:{x:352,y:272,w:16,h:16}
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
    GANON:{hp:12,speed:.8,damage:1,ai:'boss',boss:true},
    PATRA:{hp:8,speed:.45,damage:1,ai:'boss',boss:true}
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
    9:['LIKELIKE','ZOL','LANMOLA','KEESE','WIZZROBE','DARKNUT','PATRA']
  };
  const BOSSES={1:'AQUAMENTUS',2:'DODONGO',3:'MANHANDLA',4:'GLEEOK',5:'DIGDOGGER',6:'GOHMA',7:'AQUAMENTUS',8:'GLEEOK',9:'GANON'};

  const ROOM_CONTENTS = {
    1:{
      C1:{layout:'entrance'}, B1:{enemies:[['KEESE',3]],reward:'KEY',layout:'empty'}, D1:{enemies:[['STALFOS',5]],reward:'KEY',layout:'blocks4'},
      C2:{enemies:[['STALFOS',3]],layout:'cross'}, C3:{enemies:[['STALFOS',4]],reward:'KEY',layout:'blocks4'}, D3:{enemies:[['KEESE',4]],reward:'COMPASS',layout:'empty'},
      B3:{enemies:[['KEESE',4]],layout:'blocks4'}, B4:{enemies:[['GEL',3]],layout:'push'}, A4:{npc:'OLD MAN',layout:'oldman'},
      C4:{enemies:[['GEL',3]],reward:'MAP',layout:'cross'}, C5:{enemies:[['STALFOS',4]],reward:'KEY',layout:'blocks4'}, C6:{enemies:[['GORIYA',3]],reward:'KEY',layout:'columns'},
      B6:{enemies:[['KEESE',4]],reward:'BOW',layout:'stairs'}, D4:{enemies:[['GORIYA',3]],reward:'BOOMERANG',layout:'columns'}, E4:{enemies:[['WALLMASTER',4]],reward:'KEY',layout:'wallmaster'},
      E5:{enemies:[['AQUAMENTUS',1]],reward:'HEART',layout:'boss'}, F5:{reward:'TRIFORCE',layout:'triforce'}
    },
    2:{
      B1:{layout:'entrance'}, B2:{enemies:[['ROPE',5]],layout:'empty'}, A2:{enemies:[['ROPE',6]],reward:'KEY',layout:'empty'}, C1:{enemies:[['ROPE',5]],reward:'KEY',layout:'empty'},
      C2:{enemies:[['ROPE',3]],layout:'cross'}, D2:{enemies:[['GEL',3]],reward:'COMPASS',layout:'empty'}, D3:{enemies:[['GEL',3]],reward:'MAP',layout:'blocks4'},
      C3:{enemies:[['GORIYA',3]],reward:'KEY',layout:'columns'}, C4:{enemies:[['GORIYA',3]],layout:'columns'}, D4:{enemies:[['GORIYA',3]],reward:'MAGICAL BOOMERANG',layout:'columns'},
      C5:{enemies:[['ROPE',5]],layout:'empty'}, D5:{enemies:[['GORIYA',3]],reward:'BOMBS',layout:'columns'}, C6:{enemies:[['MOLDORM',2]],reward:'KEY',layout:'cross'},
      D6:{enemies:[['GEL',4]],layout:'empty'}, C7:{enemies:[['ROPE',5]],layout:'empty'}, D7:{npc:'OLD MAN',layout:'oldman'},
      D8:{enemies:[['DODONGO',1]],reward:'HEART',layout:'boss'}, C8:{reward:'TRIFORCE',layout:'triforce'}
    },
    3:{
      D1:{layout:'entrance'}, C1:{enemies:[['ZOL',3]],reward:'KEY',layout:'empty'}, C2:{enemies:[['ZOL',3]],reward:'KEY',layout:'blocks4'},
      C3:{enemies:[['DARKNUT',3]],reward:'BOMBS',layout:'columns'}, B3:{enemies:[['KEESE',4]],reward:'COMPASS',layout:'empty'}, A3:{enemies:[['DARKNUT',5]],layout:'columns'},
      A2:{enemies:[['DARKNUT',8]],reward:'RAFT',layout:'stairs'}, A4:{enemies:[['DARKNUT',4]],reward:'KEY',layout:'blocks4'}, B4:{enemies:[['KEESE',4]],reward:'BOMBS',layout:'empty'},
      C4:{enemies:[['ZOL',3]],reward:'KEY',layout:'cross'}, D4:{enemies:[['ZOL',3]],reward:'MAP',layout:'empty'}, C5:{npc:'OLD MAN',layout:'oldman'},
      C6:{enemies:[['KEESE',4]],reward:'KEY',layout:'empty'}, D6:{enemies:[['KEESE',4]],layout:'blocks4'}, E3:{enemies:[['ZOL',3]],layout:'empty'},
      E4:{enemies:[['MANHANDLA',1]],reward:'HEART',layout:'boss'}, E5:{reward:'TRIFORCE',layout:'triforce'}
    },
    4:{
      B1:{layout:'entrance'}, A1:{enemies:[['KEESE',4]],reward:'KEY',layout:'empty'}, B2:{enemies:[['VIRE',3]],layout:'empty'}, C2:{enemies:[['VIRE',3]],reward:'COMPASS',layout:'empty'},
      B3:{enemies:[['KEESE',4]],reward:'KEY',layout:'blocks4'}, A3:{enemies:[['VIRE',3]],layout:'empty'}, A4:{enemies:[['ZOL',3]],reward:'KEY',layout:'cross'},
      A5:{enemies:[['VIRE',3]],layout:'empty'}, B5:{enemies:[['VIRE',3]],layout:'blocks4'}, C5:{enemies:[['VIRE',4]],reward:'STEPLADDER',layout:'stairs'},
      A6:{enemies:[['VIRE',3]],layout:'empty'}, B6:{enemies:[['VIRE',3]],reward:'MAP',layout:'empty'}, A7:{enemies:[['MANHANDLA',1]],layout:'boss'},
      B7:{npc:'OLD MAN',layout:'oldman'}, C7:{enemies:[['KEESE',4]],reward:'KEY',layout:'empty'}, D7:{enemies:[['GLEEOK',1]],reward:'HEART',layout:'boss'},
      D8:{reward:'TRIFORCE',layout:'triforce'}
    },
    5:{
      C1:{layout:'entrance'}, D1:{enemies:[['POLSVOICE',3]],reward:'KEY',layout:'empty'}, C2:{enemies:[['GIBDO',3]],reward:'KEY',layout:'empty'},
      B2:{enemies:[['GIBDO',3]],reward:'BOMBS',layout:'blocks4'}, A2:{enemies:[['DARKNUT',3]],layout:'columns'}, A5:{enemies:[['KEESE',4]],reward:'KEY',layout:'empty'},
      B3:{npc:'OLD MAN',layout:'oldman'}, C3:{enemies:[['DARKNUT',3]],layout:'columns'}, D3:{enemies:[['GIBDO',3]],layout:'empty'}, C4:{enemies:[['GIBDO',3]],layout:'blocks4'},
      D4:{enemies:[['DODONGO',2]],layout:'boss'}, D5:{reward:'MAP',layout:'empty'}, D6:{enemies:[['VIRE',3]],layout:'empty'}, C6:{enemies:[['GIBDO',3]],reward:'KEY',layout:'empty'},
      B6:{enemies:[['DARKNUT',3]],reward:'COMPASS',layout:'columns'}, B7:{enemies:[['POLSVOICE',3],['GIBDO',2]],reward:'KEY',layout:'cross'},
      B8:{enemies:[['KEESE',4]],reward:'RECORDER',layout:'stairs'}, C8:{enemies:[['DARKNUT',3]],layout:'columns'},
      A6:{enemies:[['DIGDOGGER',1]],reward:'HEART',layout:'boss'}, A7:{reward:'TRIFORCE',layout:'triforce'}
    },
    6:{
      B1:{layout:'entrance'}, C1:{enemies:[['WIZZROBE',3]],reward:'KEY',layout:'empty'}, C2:{npc:'OLD MAN',layout:'oldman'}, A1:{enemies:[['WIZZROBE',3]],layout:'empty'},
      A2:{enemies:[['ZOL',3]],reward:'COMPASS',layout:'cross'}, A3:{enemies:[['KEESE',4]],reward:'KEY',layout:'empty'}, A4:{layout:'cross'},
      A5:{enemies:[['LIKELIKE',3]],layout:'push'}, A6:{enemies:[['GLEEOK',1]],layout:'boss'}, B6:{enemies:[['LIKELIKE',2],['ROPE',2]],reward:'MAP',layout:'blocks4'},
      B7:{enemies:[['WIZZROBE',3]],layout:'empty'}, B8:{enemies:[['KEESE',4]],reward:'MAGICAL ROD',layout:'stairs'}, C7:{enemies:[['ROPE',3],['LIKELIKE',2]],layout:'cross'},
      C8:{enemies:[['WIZZROBE',3]],reward:'KEY',layout:'empty'}, D6:{enemies:[['WIZZROBE',3]],reward:'KEY',layout:'empty'}, D7:{enemies:[['VIRE',3]],layout:'empty'},
      D8:{enemies:[['ROPE',3],['LIKELIKE',2]],layout:'cross'}, E6:{enemies:[['WIZZROBE',3]],layout:'empty'}, E7:{enemies:[['GOHMA',1]],reward:'HEART',layout:'boss'},
      E8:{reward:'TRIFORCE',layout:'triforce'}
    },
    7:{
      B1:{layout:'entrance'}, C1:{enemies:[['MOLDORM',2]],reward:'BOMBS',layout:'empty'}, C2:{enemies:[['KEESE',4]],layout:'empty'},
      C3:{enemies:[['GORIYA',3]],layout:'columns'}, D3:{enemies:[['DIGDOGGER',1]],layout:'boss'}, E3:{enemies:[['STALFOS',4]],reward:'KEY',layout:'blocks4'},
      B3:{npc:'OLD MAN',layout:'oldman'}, A3:{enemies:[['STALFOS',4]],reward:'COMPASS',layout:'blocks4'}, A4:{enemies:[['GORIYA',3]],layout:'columns'},
      B4:{enemies:[['DODONGO',3]],layout:'boss'}, C4:{npc:'OLD MAN',layout:'oldman'}, D4:{enemies:[['GORIYA',3],['KEESE',2]],layout:'cross'},
      A5:{enemies:[['DIGDOGGER',1]],layout:'boss'}, B5:{enemies:[['MOLDORM',2]],reward:'KEY',layout:'empty'}, A6:{enemies:[['GORIYA',3]],layout:'columns'},
      B6:{enemies:[['GORIYA',3]],reward:'MAP',layout:'empty'}, A7:{enemies:[['GORIYA',3]],reward:'KEY',layout:'columns'}, B7:{enemies:[['GORIYA',3]],layout:'columns'},
      C7:{enemies:[['KEESE',4]],reward:'RED CANDLE',layout:'stairs'}, C6:{enemies:[['AQUAMENTUS',1]],reward:'HEART',layout:'boss'}, D6:{reward:'TRIFORCE',layout:'triforce'}
    },
    8:{
      D1:{layout:'entrance'}, E1:{enemies:[['DARKNUT',2],['GIBDO',2]],reward:'KEY',layout:'columns'}, C1:{enemies:[['MANHANDLA',1]],layout:'boss'},
      B1:{enemies:[['DARKNUT',3],['GIBDO',2]],reward:'BOOK OF MAGIC',layout:'stairs'}, D2:{enemies:[['MANHANDLA',1]],layout:'boss'},
      D3:{enemies:[['DARKNUT',3]],layout:'columns'}, E3:{enemies:[['POLSVOICE',3]],reward:'COMPASS',layout:'empty'}, C3:{enemies:[['POLSVOICE',2],['KEESE',2],['GIBDO',2]],reward:'KEY',layout:'cross'},
      B4:{enemies:[['DARKNUT',3]],reward:'KEY',layout:'columns'}, C4:{enemies:[['GOHMA',1]],layout:'boss'}, D4:{npc:'OLD MAN',layout:'oldman'},
      E4:{enemies:[['DARKNUT',2],['GIBDO',2]],layout:'cross'}, A5:{enemies:[['MANHANDLA',1]],reward:'MAP',layout:'boss'}, B5:{enemies:[['GLEEOK',1]],reward:'HEART',layout:'boss'},
      C5:{enemies:[['POLSVOICE',3]],reward:'BOMBS',layout:'empty'}, D5:{enemies:[['DARKNUT',3],['POLSVOICE',2]],reward:'MAGICAL KEY',layout:'stairs'},
      E5:{enemies:[['DARKNUT',3]],layout:'columns'}, B6:{reward:'TRIFORCE',layout:'triforce'}
    },
    9:{
      G1:{layout:'entrance'}, G2:{layout:'oldman',npc:'TRIFORCE GATE'}, G3:{enemies:[['LIKELIKE',2],['ZOL',3]],reward:'KEY',layout:'cross'},
      F3:{enemies:[['LANMOLA',2]],layout:'push'}, E3:{enemies:[['KEESE',4],['LIKELIKE',2]],layout:'empty'}, E4:{enemies:[['WIZZROBE',4]],layout:'blocks4'},
      E5:{enemies:[['WIZZROBE',4]],reward:'COMPASS',layout:'blocks4'}, F5:{enemies:[['PATRA',1]],layout:'boss'}, F4:{enemies:[['ZOL',3]],layout:'empty'},
      G4:{enemies:[['PATRA',1]],reward:'MAP',layout:'boss'}, G5:{enemies:[['WIZZROBE',4]],layout:'columns'}, G6:{enemies:[['WIZZROBE',4]],layout:'push'},
      F6:{enemies:[['ZOL',3]],layout:'empty'}, E6:{enemies:[['KEESE',4]],layout:'empty'}, D6:{enemies:[['PATRA',1]],layout:'boss'},
      D7:{enemies:[['WIZZROBE',4]],layout:'columns'}, D8:{enemies:[['WIZZROBE',4]],reward:'SILVER ARROWS',layout:'stairs'},
      H8:{enemies:[['WIZZROBE',4]],reward:'RED RING',layout:'stairs'}, C4:{enemies:[['GANON',1]],reward:'HEART',layout:'boss'}, C5:{reward:'ZELDA',layout:'triforce'}
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
    let hp=def.hp;
    if(type==='GOHMA') hp=state.level===6?1:3;
    if(type==='GLEEOK') hp=state.level===4?6:12;
    return {type,x:p[0],y:p[1],vx:0,vy:0,hp,maxHp:hp,dead:false,timer:20+i*17,phase:i,hit:0,shot:20+i*11,stunned:0,shrunk:false,splitDone:false};
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
    state.attackTimer=0; state.attackCooldown=0; state.invincible=0; state.maxHp=meta.maxHp||3; state.hp=state.maxHp; state.roomEnemies=[]; state.projectiles=[]; state.effects=[];
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
      meta.keys--; meta.roomMemory['unlock:'+state.level+':'+edge(state.room,n)]=true; state.message='KEY USED';state.messageTimer=45;playSfx('LOZ_Door_Unlock.wav',.72);
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
      if(e.dead)continue; const def=ENEMY_DEF[e.type]||ENEMY_DEF.STALFOS; e.timer++; if(e.hit>0)e.hit--; if(e.stunned>0)e.stunned--;
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
      const swordAllowed=!(e.type==='DODONGO'&&e.stunned<=0)&&!(e.type==='DIGDOGGER'&&!e.shrunk)&&e.type!=='GOHMA';
      if(state.attackTimer>0 && swordAllowed && e.hit===0 && hitbox(swordBox(),{x:e.x,y:e.y,w:e.type==='AQUAMENTUS'?24:16,h:e.type==='AQUAMENTUS'?28:16})){
        hurtEnemy(e,1,state.x+8,state.y+8);
      }
      if(state.invincible<=0 && hitbox({x:state.x,y:state.y,w:14,h:14},{x:e.x,y:e.y,w:16,h:16})){
        hurtLink(def.damage);
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
        hurtLink(.5);p.life=0;
      }
      if(p.kind==='player'||p.kind==='bomb'||p.kind==='arrow'||p.kind==='swordBeam'){
        for(const e of state.roomEnemies||[]){
          if(e.dead)continue;
          const ew=e.type==='DODONGO'?32:16;
          if(!hitbox({x:p.x,y:p.y,w:p.kind==='swordBeam'?10:7,h:p.kind==='swordBeam'?10:7},{x:e.x,y:e.y,w:ew,h:16}))continue;
          if(p.kind==='bomb'&&e.type==='DODONGO'){
            e.stunned=150;hurtEnemy(e,1,p.x,p.y);p.life=0;break;
          }
          if(p.kind==='arrow'&&e.type==='GOHMA'){
            hurtEnemy(e,1,p.x,p.y);p.life=0;break;
          }
          if(p.kind==='swordBeam'){
            const swordAllowed=!(e.type==='DODONGO'&&e.stunned<=0)&&!(e.type==='DIGDOGGER'&&!e.shrunk)&&e.type!=='GOHMA';
            if(swordAllowed)hurtEnemy(e,1,p.x,p.y);
            else playSfx('LOZ_Shield.wav',.55);
            p.life=0;break;
          }
          if(p.kind==='player'){
            if(e.type==='KEESE'||e.type==='GEL')hurtEnemy(e,e.hp,p.x,p.y);
            else{e.stunned=Math.max(e.stunned||0,45);addEffect('hit',e.x+8,e.y+8);playSfx('LOZ_Enemy_Hit.wav',.55);}
            p.life=0;break;
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
      if(r.type==='KEY'){meta.keys++;state.message='KEY +1';playSfx('LOZ_Key_Appear.wav',.72);}
      else if(r.type==='BOMBS'){meta.bombs=Math.min(meta.maxBombs||8,meta.bombs+4);state.message='BOMBS +4';playSfx('LOZ_Get_Item.wav',.72);}
      else if(r.type==='HEART'){meta.maxHp=Math.min(6,(meta.maxHp||3)+1);state.maxHp=meta.maxHp;state.hp=state.maxHp;state.message='HEART CONTAINER';playSfx('LOZ_Get_Heart.wav',.82);}
      else if(r.type==='TRIFORCE'){meta.triforce.add(state.level);state.message='TRIFORCE';playSfx('LOZ_Fanfare.wav',.84);}
      else if(r.type==='ZELDA'){state.message='ZELDA RESCUED';}
      else{meta.items.add(r.type);state.message=r.type;playSfx('LOZ_Get_Item.wav',.76);}
      state.messageTimer=90;state.reward=null;
    }
  }

  function update(){
    if(!state.active)return;
    if(state.transitionLock>0)state.transitionLock--;if(state.messageTimer>0)state.messageTimer--;if(state.attackCooldown>0)state.attackCooldown--;if(state.attackTimer>0)state.attackTimer--;if(state.invincible>0)state.invincible--;
    const speed=1.45;state.x+=state.vx*speed;state.y+=state.vy*speed;
    updateEnemies();updateProjectiles();updateEffects();collectReward();
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
    if(e.keyCode===32){
      if(state.attackCooldown<=0){
        state.attackTimer=8;state.attackCooldown=12;playSfx('LOZ_Sword_Slash.wav',.7);
        if(state.hp>=state.maxHp && !(state.projectiles||[]).some(p=>p.kind==='swordBeam')){
          const d=state.dir==='left'?[-1,0]:state.dir==='right'?[1,0]:state.dir==='up'?[0,-1]:[0,1];
          state.projectiles.push({kind:'swordBeam',x:state.x+8+d[0]*12,y:state.y+8+d[1]*12,vx:d[0]*3.15,vy:d[1]*3.15,life:72});
          playSfx('LOZ_Sword_Shoot.wav',.72);
        }
      }
      return true;
    }
    if(e.keyCode===66){
      const alive=(state.roomEnemies||[]).filter(x=>!x.dead);
      const dodongo=alive.find(x=>x.type==='DODONGO');
      const digdogger=alive.find(x=>x.type==='DIGDOGGER');
      const gohma=alive.find(x=>x.type==='GOHMA');
      const d=state.dir==='left'?[-1,0]:state.dir==='right'?[1,0]:state.dir==='up'?[0,-1]:[0,1];
      if(dodongo&&meta.bombs>0){
        meta.bombs--;playSfx('LOZ_Bomb_Drop.wav',.68);state.projectiles.push({kind:'bomb',x:state.x+8,y:state.y+8,vx:d[0]*1.45,vy:d[1]*1.45,life:75});
      }else if(digdogger&&meta.items.has('RECORDER')){
        playSfx('LOZ_Recorder.wav',.78);digdogger.shrunk=true;digdogger.hp=Math.min(digdogger.hp,4);state.message='DIGDOGGER SHRINKS';state.messageTimer=60;
      }else if(gohma&&meta.items.has('BOW')){
        playSfx('LOZ_Arrow_Boomerang.wav',.62);state.projectiles.push({kind:'arrow',x:state.x+8,y:state.y+8,vx:d[0]*3.2,vy:d[1]*3.2,life:65});
      }else if(meta.items.has('BOOMERANG')||meta.items.has('MAGICAL BOOMERANG')){
        playSfx('LOZ_Arrow_Boomerang.wav',.58);state.projectiles.push({kind:'player',x:state.x+8,y:state.y+8,vx:d[0]*2.4,vy:d[1]*2.4,life:45});
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
    if(e.type==='DODONGO'){
      const sp=SPRITES.DODONGO;
      try{if(typeof enemies!=='undefined'&&enemies.complete)ctx.drawImage(enemies,sp.x,sp.y,sp.w,sp.h,Math.round(e.x),Math.round(e.y),32,16);else throw 0;}
      catch(_){ctx.fillStyle='#b87820';ctx.fillRect(e.x,e.y,30,14);}
      return;
    }
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
  function drawEffects(ctx){
    for(const fx of state.effects||[]){
      const t=fx.life/fx.max;
      if(fx.kind==='hit'){
        ctx.fillStyle=fx.life%2?'#fff':'#f8b800';
        ctx.fillRect(fx.x-5,fx.y-1,10,2);ctx.fillRect(fx.x-1,fx.y-5,2,10);
      }else if(fx.kind==='death'){
        ctx.fillStyle=fx.life%2?'#fff':'#f85020';
        const r=(1-t)*10+2;
        ctx.fillRect(fx.x-r,fx.y-1,4,2);ctx.fillRect(fx.x+r-4,fx.y-1,4,2);
        ctx.fillRect(fx.x-1,fx.y-r,2,4);ctx.fillRect(fx.x-1,fx.y+r-4,2,4);
      }else{
        ctx.fillStyle='#f85020';ctx.fillRect(fx.x-4,fx.y-4,8,8);
      }
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
    ctx.fillText(`KEY x${meta.keys}`,168,15);ctx.fillText(`BOMB x${meta.bombs}`,168,28);ctx.fillText(`ROOM ${state.room}`,168,41);
    for(let i=0;i<state.maxHp;i++){const row=Math.floor(i/6),col=i%6;ctx.fillStyle=i<Math.ceil(state.hp)?'#d82800':'#552000';ctx.fillRect(168+col*10,44+row*9,7,7);}
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
      if(p.kind==='swordBeam'){
        ctx.fillStyle='#f8f8f8';
        if(Math.abs(p.vx)>0)ctx.fillRect(p.x-2,p.y+2,12,4);else ctx.fillRect(p.x+2,p.y-2,4,12);
        ctx.fillStyle='#80d8ff';
        if(Math.abs(p.vx)>0)ctx.fillRect(p.x,p.y+3,8,2);else ctx.fillRect(p.x+3,p.y,2,8);
      }else{
        ctx.fillStyle=p.kind==='enemy'?'#f85020':p.kind==='bomb'?'#888':'#80d8ff';ctx.fillRect(p.x,p.y,5,5);
      }
    }
    drawEffects(ctx);drawReward(ctx,state.reward);drawLinkDungeon(ctx);
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
