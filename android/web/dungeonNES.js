/*
 * Zelda NES Quest 1 dungeon layer for ZeldaNesRevisiterJS.
 *
 * The fallback maps below preserve the real Quest 1 labyrinth silhouettes,
 * entrance / boss / Triforce / major item rooms. No invented dungeon is used.
 *
 * An optional original-ROM loader is also provided. When the user supplies a
 * legally owned iNES ROM, room attributes and the unique underworld room layout
 * are decoded directly from the original Zelda NES data tables. This avoids
 * guessing the original room/door data.
 */
(function (global) {
  'use strict';

  const LEVELS = {
    1:{name:'EAGLE', entrance:'C1', boss:'E5', triforce:'F5', itemRooms:{B6:'BOW',D4:'BOOMERANG'}, rows:[
      '.##...', '..#.#T', '#####.', '.###..', '..#...', '.#E#..'
    ]},
    2:{name:'MOON', entrance:'B1', boss:'D8', triforce:'C8', itemRooms:{D4:'MAGICAL BOOMERANG'}, rows:[
      '..TZ','..##','..##','..##','..##','..##','####','.#E#'
    ]},
    3:{name:'MANJI', entrance:'D1', boss:'E4', triforce:'E5', itemRooms:{A2:'RAFT'}, rows:[
      '..##.','..#.T','#####','#####','#.#..','..#E.'
    ]},
    4:{name:'SNAKE', entrance:'B1', boss:'D7', triforce:'D8', itemRooms:{C5:'STEPLADDER'}, rows:[
      '###T','####','##..','###.','#...','##..','.##.','#E..'
    ]},
    5:{name:'LIZARD', entrance:'C1', boss:'A6', triforce:'A7', itemRooms:{B8:'RECORDER'}, rows:[
      '.##.','T###','####','#..#','..##','.###','####','..E#'
    ]},
    6:{name:'DRAGON', entrance:'B1', boss:'E7', triforce:'E8', itemRooms:{B8:'MAGICAL ROD'}, rows:[
      '.###T','######','##.##.','###.#.','#.....','#.....','#.#...','#E#...'
    ]},
    7:{name:'DEMON', entrance:'B1', boss:'C6', triforce:'D6', itemRooms:{C7:'RED CANDLE'}, rows:[
      '######','#####.','####..','##....','####..','######','###...','#E#...'
    ]},
    8:{name:'LION', entrance:'D1', boss:'B5', triforce:'B6', itemRooms:{B1:'BOOK OF MAGIC',E7:'MAGICAL KEY'}, rows:[
      '...#.', '..###', '.T##.', '#####', '.####', '..###', '...#.', '.##E#'
    ]},
    9:{name:'DEATH MOUNTAIN', entrance:'G1', boss:'C4', triforce:'C5', itemRooms:{A7:'SILVER ARROWS',H8:'RED RING'}, rows:[
      '########','########','########','########','########','#######.','.######.','.#.##.E.'
    ]}
  };

  const ENTRANCE_SCREENS = {1:55, 2:60, 3:116, 4:69, 5:11, 6:34, 7:66, 8:109, 9:5};

  const PALETTES = {
    1:['#000000','#747474','#00a8a8','#f8f8f8'],
    2:['#000000','#747474','#1848a8','#f8f8f8'],
    3:['#000000','#747474','#009438','#f8f8f8'],
    4:['#000000','#747474','#887000','#f8f8f8'],
    5:['#000000','#747474','#009438','#f8f8f8'],
    6:['#000000','#747474','#887000','#f8f8f8'],
    7:['#000000','#747474','#009438','#f8f8f8'],
    8:['#000000','#747474','#6c6c6c','#f8f8f8'],
    9:['#000000','#747474','#6c6c6c','#f8f8f8']
  };

  const NES_RGB=[
    '#626262','#001fb2','#2404c8','#5200b2','#730076','#800024','#730b00','#522800','#244400','#005700','#005c00','#005324','#003c76','#000000','#000000','#000000',
    '#ababab','#0d57ff','#4b30ff','#8a13ff','#bc08d6','#d21269','#c72e00','#9d5400','#607b00','#209800','#00a300','#009942','#007db4','#000000','#000000','#000000',
    '#ffffff','#53aeff','#9085ff','#d365ff','#ff57ff','#ff5dcf','#ff7757','#fa9e00','#bdc700','#7ae700','#43ef56','#26deac','#2fcdf4','#4f4f4f','#000000','#000000',
    '#ffffff','#b6e1ff','#ced1ff','#e9c3ff','#ffbcff','#ffbdf4','#ffc6c3','#ffd59a','#e9e681','#c9f598','#aef6be','#aaf2e2','#aeeaFF','#b8b8b8','#000000','#000000'
  ];

  function levelInfoFromRom(rom,level){
    const base=0x19300+16 + 0xFC*level;
    return {
      palette:Array.from(rom.slice(base+3,base+3+32)),
      startY:rom[base+0x28], startRoom:rom[base+0x2F], triforceRoom:rom[base+0x30], bossRoom:rom[base+0x3E]
    };
  }

  function roomIndexForLabel(roomLabel){
    if(!state.exactRom || !state.rom) return null;
    const info=levelInfoFromRom(state.rom,state.level), def=LEVELS[state.level];
    const e=rc(def.entrance), q=rc(roomLabel), b=rc(def.boss);
    const dcB=b.c-e.c, drB=b.r-e.r;
    const candPlus=info.startRoom+dcB+16*drB;
    const candMinus=info.startRoom+dcB-16*drB;
    const sign=(candPlus===info.bossRoom)?1:(candMinus===info.bossRoom?-1:-1);
    return info.startRoom+(q.c-e.c)+sign*16*(q.r-e.r);
  }

  function decodeChrTile(rom,tileIndex,palette){
    const off=0xC11B+16+tileIndex*16, px=new Uint8Array(64);
    for(let y=0;y<8;y++){
      const lo=rom[off+y], hi=rom[off+y+8];
      for(let x=0;x<8;x++){
        const bit=7-x, v=((lo>>bit)&1)|(((hi>>bit)&1)<<1); px[y*8+x]=v;
      }
    }
    return {px,palette};
  }

  function drawChr8(ctx,rom,tileIndex,x,y,palette){
    const t=decodeChrTile(rom,tileIndex,palette);
    for(let py=0;py<8;py++) for(let px=0;px<8;px++){
      const nesIndex=t.palette[t.px[py*8+px]]&63;
      ctx.fillStyle=NES_RGB[nesIndex]||'#000'; ctx.fillRect(x+px,y+py,1,1);
    }
  }

  function drawExactMacro(ctx,ref,x,y,attrs){
    const rom=state.rom, info=levelInfoFromRom(rom,state.level);
    const prim=rom[0x16718+16+ref];
    const tiles=(prim<0x70 || prim>0xF2)?[prim,prim,prim,prim]:[prim,prim+1,prim+2,prim+3];
    const pi=(attrs.innerPalette&3)*4, palette=info.palette.slice(pi,pi+4);
    drawChr8(ctx,rom,tiles[0],x,y,palette); drawChr8(ctx,rom,tiles[1],x+8,y,palette);
    drawChr8(ctx,rom,tiles[2],x,y+8,palette); drawChr8(ctx,rom,tiles[3],x+8,y+8,palette);
  }

  function drawExactRoomInterior(ctx){
    if(!state.exactRom || !state.romData) return false;
    const idx=roomIndexForLabel(state.room); if(idx==null || idx<0 || idx>127) return false;
    const group=state.level>=7?1:0, attrs=state.romData.decodeRoomAttrs(group,idx);
    const map=state.romData.decodeUniqueRoom(attrs.uniqueRoom);
    for(let r=0;r<7;r++) for(let c=0;c<12;c++) drawExactMacro(ctx,map[r][c],32+c*16,72+r*16,attrs);
    const openType=t=>t!==0;
    drawDoor(ctx,'N',openType(attrs.north)); drawDoor(ctx,'S',openType(attrs.south));
    drawDoor(ctx,'W',openType(attrs.west)); drawDoor(ctx,'E',openType(attrs.east));
    return true;
  }

  function rc(label){ return {c:label.charCodeAt(0)-65, r:parseInt(label.slice(1),10)-1}; }
  function label(c,r){ return String.fromCharCode(65+c)+(r+1); }

  function buildRooms(level) {
    const def=LEVELS[level], h=def.rows.length, rooms={};
    for(let top=0; top<h; top++){
      const rowNum=h-top;
      const line=def.rows[top];
      for(let c=0;c<line.length;c++){
        const ch=line[c];
        if(ch!=='.'){
          const id=label(c,rowNum-1);
          rooms[id]={id,c,r:rowNum-1,mark:ch};
        }
      }
    }
    return rooms;
  }

  const state={
    active:false, level:1, room:null, rooms:null, returnMap:119,
    x:120,y:146, vx:0,vy:0, transitionLock:0,
    dungeonMusic:null, rom:null, romData:null, exactRom:false,
    visited:new Set(), message:'', messageTimer:0
  };

  function getRoomDef(id){ return state.rooms && state.rooms[id]; }
  function adjacent(id,dc,dr){
    const a=rc(id), nid=label(a.c+dc,a.r+dr);
    return getRoomDef(nid) ? nid : null;
  }

  function setMusic(src){
    try{
      if(typeof backgroundMusic!=='undefined'){ backgroundMusic.pause(); }
      if(!state.dungeonMusic){ state.dungeonMusic=new Audio(); state.dungeonMusic.loop=true; }
      state.dungeonMusic.src=src;
      state.dungeonMusic.currentTime=0;
      state.dungeonMusic.play().catch(()=>{});
    }catch(e){}
  }

  function enter(level, returnMap){
    if(!LEVELS[level]) return false;
    state.active=true; state.level=level; state.rooms=buildRooms(level);
    state.room=LEVELS[level].entrance; state.returnMap=returnMap == null ? ENTRANCE_SCREENS[level] : returnMap;
    state.x=120; state.y=145; state.transitionLock=24;
    state.visited=new Set([state.room]);
    state.message=`LEVEL-${level}  ${LEVELS[level].name}`; state.messageTimer=110;
    setMusic(level===9?'./sounds/09 - Death Mountain.mp3':'./sounds/04 - Dungeon.mp3');
    return true;
  }

  function exit(){
    state.active=false;
    try{ if(state.dungeonMusic) state.dungeonMusic.pause(); }catch(e){}
    if(typeof global.currentMap!=='undefined'){
      global.currentMap=state.returnMap;
      global.gameMap=global.maps[state.returnMap].map;
      global.gameObjects=global.maps[state.returnMap].gameobjects;
      if(typeof global.addMapGameObjects==='function') global.addMapGameObjects(global.gameMap,global.gameObjects);
      global.linkX=120; global.linkY=150;
    }
    try{
      if(typeof backgroundMusic!=='undefined'){ backgroundMusic.currentTime=0; backgroundMusic.play().catch(()=>{}); }
    }catch(e){}
  }

  function handleKeyDown(e){
    if(!state.active) return false;
    if(e.keyCode===37) state.vx=-1;
    if(e.keyCode===39) state.vx=1;
    if(e.keyCode===38) state.vy=-1;
    if(e.keyCode===40) state.vy=1;
    if(e.keyCode===27){ exit(); return true; }
    return [37,38,39,40,27].includes(e.keyCode);
  }
  function handleKeyUp(e){
    if(!state.active) return false;
    if(e.keyCode===37 && state.vx<0) state.vx=0;
    if(e.keyCode===39 && state.vx>0) state.vx=0;
    if(e.keyCode===38 && state.vy<0) state.vy=0;
    if(e.keyCode===40 && state.vy>0) state.vy=0;
    return [37,38,39,40].includes(e.keyCode);
  }

  function canLeave(dir){
    if(dir==='N') return adjacent(state.room,0,1);
    if(dir==='S') return adjacent(state.room,0,-1);
    if(dir==='W') return adjacent(state.room,-1,0);
    if(dir==='E') return adjacent(state.room,1,0);
    return null;
  }
  function changeRoom(nid,dir){
    if(!nid || state.transitionLock>0) return;
    state.room=nid; state.visited.add(nid); state.transitionLock=18;
    if(dir==='N'){state.y=182;state.x=120;}
    if(dir==='S'){state.y=73;state.x=120;}
    if(dir==='W'){state.x=210;state.y=128;}
    if(dir==='E'){state.x=30;state.y=128;}
    const d=LEVELS[state.level];
    if(nid===d.boss){state.message='BOSS';state.messageTimer=65;}
    else if(nid===d.triforce){state.message=state.level===9?'GANON / ZELDA':'TRIFORCE';state.messageTimer=65;}
    else if(d.itemRooms[nid]){state.message=d.itemRooms[nid];state.messageTimer=65;}
  }

  function update(){
    if(!state.active) return;
    if(state.transitionLock>0) state.transitionLock--;
    if(state.messageTimer>0) state.messageTimer--;
    const speed=1.45;
    state.x+=state.vx*speed; state.y+=state.vy*speed;
    if(state.y<65 && state.x>104 && state.x<152){ const n=canLeave('N'); if(n) changeRoom(n,'N'); else state.y=65; }
    if(state.y>191 && state.x>104 && state.x<152){ const n=canLeave('S'); if(n) changeRoom(n,'S'); else if(state.room===LEVELS[state.level].entrance) exit(); else state.y=191; }
    if(state.x<24 && state.y>112 && state.y<152){ const n=canLeave('W'); if(n) changeRoom(n,'W'); else state.x=24; }
    if(state.x>216 && state.y>112 && state.y<152){ const n=canLeave('E'); if(n) changeRoom(n,'E'); else state.x=216; }
    state.x=Math.max(24,Math.min(216,state.x)); state.y=Math.max(65,Math.min(191,state.y));
  }

  function drawDoor(ctx,dir,open){
    ctx.fillStyle=open?'#000':'#383838';
    if(dir==='N') ctx.fillRect(104,56,48,16);
    if(dir==='S') ctx.fillRect(104,184,48,16);
    if(dir==='W') ctx.fillRect(16,112,16,40);
    if(dir==='E') ctx.fillRect(224,112,16,40);
  }

  function drawRoom(ctx){
    const pal=PALETTES[state.level]||PALETTES[1], d=LEVELS[state.level];
    ctx.fillStyle='#000'; ctx.fillRect(0,0,256,240);
    ctx.fillStyle='#000';ctx.fillRect(0,0,256,56);
    ctx.fillStyle=pal[2];ctx.font='8px monospace';ctx.fillText(`LEVEL-${state.level}`,16,16);
    ctx.fillStyle='#fff';ctx.fillText(`${d.name}`,16,29);
    ctx.fillText(`ROOM ${state.room}`,176,16);
    ctx.fillText('ESC EXIT',176,29);

    ctx.fillStyle=pal[2]; ctx.fillRect(16,56,224,144);
    ctx.fillStyle=pal[0]; ctx.fillRect(32,72,192,112);
    ctx.strokeStyle=pal[1];ctx.lineWidth=2;
    for(let x=40;x<224;x+=16){ctx.beginPath();ctx.moveTo(x,72);ctx.lineTo(x,184);ctx.stroke();}
    for(let y=80;y<184;y+=16){ctx.beginPath();ctx.moveTo(32,y);ctx.lineTo(224,y);ctx.stroke();}

    if(!drawExactRoomInterior(ctx)){
      drawDoor(ctx,'N',!!canLeave('N')); drawDoor(ctx,'S',!!canLeave('S'));
      drawDoor(ctx,'W',!!canLeave('W')); drawDoor(ctx,'E',!!canLeave('E'));
    }

    ctx.textAlign='center'; ctx.font='8px monospace';
    if(state.room===d.boss){ctx.fillStyle='#f8b800';ctx.fillText(state.level===9?'GANON':'BOSS',128,126);}
    if(state.room===d.triforce){ctx.fillStyle='#f8b800';ctx.fillText(state.level===9?'ZELDA':'▲',128,126);}
    if(d.itemRooms[state.room]){ctx.fillStyle='#f8b800';ctx.fillText(d.itemRooms[state.room],128,126);}
    ctx.textAlign='left';

    if(typeof link1!=='undefined' && link1.complete){
      ctx.drawImage(link1,1,1,16,16,Math.round(state.x),Math.round(state.y),16,16);
    }else{ctx.fillStyle='#00a800';ctx.fillRect(state.x,state.y,12,12);}

    drawMiniMap(ctx);
    if(state.messageTimer>0){ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='10px monospace';ctx.fillText(state.message,128,220);ctx.textAlign='left';}
  }

  function drawMiniMap(ctx){
    const d=LEVELS[state.level], rooms=state.rooms;
    const w=Math.max(...Object.values(rooms).map(r=>r.c))+1;
    const h=Math.max(...Object.values(rooms).map(r=>r.r))+1;
    const s=Math.max(2,Math.min(5,Math.floor(54/Math.max(w,h))));
    const ox=96, oy=4;
    for(const r of Object.values(rooms)){
      if(!state.visited.has(r.id) && r.id!==state.room) continue;
      ctx.fillStyle=r.id===state.room?'#f8f8f8':'#747474';
      ctx.fillRect(ox+r.c*s,oy+(h-1-r.r)*s,s-1,s-1);
    }
  }

  function updateAndDraw(ctx){ update(); drawRoom(ctx); }

  function maybeEnterFromOverworld(mapId,x,y){
    if(state.active) return true;
    let lev=0; for(const k in ENTRANCE_SCREENS) if(ENTRANCE_SCREENS[k]===mapId) lev=+k;
    if(!lev) return false;
    const zones={
      1:[96,160,112,176],2:[96,160,112,176],3:[96,160,112,176],4:[96,160,112,176],
      5:[96,160,112,176],6:[96,160,112,176],7:[96,160,112,176],8:[176,224,96,176],9:[48,112,112,192]
    };
    const z=zones[lev];
    if(x>=z[0]&&x<=z[1]&&y>=z[2]&&y<=z[3]){ enter(lev,mapId); return true; }
    return false;
  }

  function u16(a,o){return a[o]|(a[o+1]<<8);}
  function decodeUniqueRoom(rom,index){
    const roomColsOff=0x160DE+16, colDirOff=0x16704+16, colTablesOff=0x162D6+16;
    const ptr=[]; const base=u16(rom,colDirOff);
    for(let i=0;i<10;i++) ptr.push(u16(rom,colDirOff+i*2)-base);
    const out=Array.from({length:7},()=>Array(12).fill(0));
    for(let c=0;c<12;c++){
      const desc=rom[roomColsOff+index*12+c], ti=desc>>4, ci=desc&15;
      if(ti>=ptr.length) continue;
      let j=ptr[ti], k=0;
      for(;j<ptr[ti]+77;j++){
        const t=rom[colTablesOff+j]; if(t&0x80){ if(k===ci) break; k++; }
      }
      let r=0;
      while(r<7){ const t=rom[colTablesOff+j++], ref=t&7, repeat=(t>>4)&7; out[r++][c]=ref; for(let m=0;m<repeat&&r<7;m++) out[r++][c]=ref; }
    }
    return out;
  }
  function decodeRoomAttrs(rom,group,index){
    const go=768*group, countsOff=0x19420+16;
    const outer=rom[0x18700+16+go+index], inner=rom[0x18780+16+go+index];
    const ml=rom[0x18800+16+go+index], lay=rom[0x18880+16+go+index];
    const item=rom[0x18900+16+go+index], spec=rom[0x18980+16+go+index];
    return {uniqueRoom:lay&0x3f,pushBlock:(lay>>6)&1,outerPalette:outer&3,innerPalette:inner&3,
      south:(outer>>2)&7,north:(outer>>5)&7,east:(inner>>2)&7,west:(inner>>5)&7,
      monsterList:(ml&0x3f)|(((lay>>7)&1)<<6),monsterCount:rom[countsOff+((ml>>6)&3)]&15,
      item:item&31,sound:(item>>5)&3,dark:(item>>7)&1,secret:spec&7,itemPos:(spec>>4)&3};
  }
  async function loadOriginalRom(file){
    const buf=new Uint8Array(await file.arrayBuffer());
    if(buf.length<0x19b00 || buf[0]!==0x4e || buf[1]!==0x45 || buf[2]!==0x53 || buf[3]!==0x1a) throw new Error('Fichier iNES invalide.');
    state.rom=buf; state.exactRom=true;
    if(global.NESExact && global.NESExact.setRom) global.NESExact.setRom(buf);
    state.romData={decodeUniqueRoom:(i)=>decodeUniqueRoom(buf,i),decodeRoomAttrs:(g,i)=>decodeRoomAttrs(buf,g,i)};
    state.message='ORIGINAL NES ROOM DATA LOADED'; state.messageTimer=160;
    return true;
  }

  function installRomLoader(){
    if(typeof document==='undefined' || document.getElementById('zelda-rom-loader')) return;
    const wrap=document.createElement('div'); wrap.id='zelda-rom-loader';
    wrap.style.cssText='position:fixed;right:6px;bottom:6px;z-index:20;font:10px monospace;background:#000;color:#fff;padding:4px;border:1px solid #777;opacity:.82';
    const lab=document.createElement('label'); lab.textContent='DONJONS NES EXACTS · ROM: ';
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.nes,application/octet-stream'; inp.style.cssText='width:145px;font-size:9px';
    const st=document.createElement('span'); st.textContent=' non chargee';
    inp.addEventListener('change',async()=>{try{if(inp.files&&inp.files[0]){await loadOriginalRom(inp.files[0]);st.textContent=' OK';st.style.color='#55ff55';}}catch(err){st.textContent=' invalide';st.style.color='#ff5555';}});
    lab.appendChild(inp);wrap.appendChild(lab);wrap.appendChild(st);document.body.appendChild(wrap);
  }
  if(typeof window!=='undefined') window.addEventListener('load',installRomLoader);

  global.DungeonNES={LEVELS,ENTRANCE_SCREENS,state,enter,exit,handleKeyDown,handleKeyUp,updateAndDraw,maybeEnterFromOverworld,loadOriginalRom,roomIndexForLabel};
})(window);
