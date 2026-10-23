/*
 * NES EXACT mode for ZeldaNesRevisiterJS.
 * Runs the user's legally-owned Zelda NES ROM through JSNES.
 * No ROM is bundled with this project.
 */
(function(global){
  'use strict';

  let nes=null, running=false, raf=0, last=0, romBytes=null;
  let audioCtx=null, audioNode=null, audioQueueL=[], audioQueueR=[];
  const W=256,H=240;
  let overlay, canvas, ctx, image, pixels, button;

  const BTN=()=>global.jsnes && global.jsnes.Controller;
  const keyMap={
    37:()=>BTN().BUTTON_LEFT, 38:()=>BTN().BUTTON_UP, 39:()=>BTN().BUTTON_RIGHT, 40:()=>BTN().BUTTON_DOWN,
    32:()=>BTN().BUTTON_A, 90:()=>BTN().BUTTON_A,
    66:()=>BTN().BUTTON_B, 88:()=>BTN().BUTTON_B,
    13:()=>BTN().BUTTON_START, 16:()=>BTN().BUTTON_SELECT
  };

  function ensureUI(){
    if(overlay) return;
    overlay=document.createElement('div');
    overlay.id='nes-exact-overlay';
    overlay.style.cssText='display:none;position:fixed;inset:0;background:#000;z-index:45;align-items:center;justify-content:center;';
    canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
    canvas.style.cssText='width:min(100vw,calc(100vh * 1.0666667));height:auto;image-rendering:pixelated;image-rendering:crisp-edges;';
    ctx=canvas.getContext('2d',{alpha:false}); image=ctx.createImageData(W,H); pixels=new Uint32Array(image.data.buffer);
    overlay.appendChild(canvas); document.body.appendChild(overlay);

    button=document.createElement('button');
    button.id='nes-exact-btn'; button.textContent='NES EXACT';
    button.style.cssText='position:fixed;left:6px;top:6px;z-index:60;background:#000;color:#fff;border:1px solid #fff;padding:7px 9px;font:bold 10px monospace;border-radius:6px;';
    button.addEventListener('click',()=> running?stop():start());
    document.body.appendChild(button);
    refreshButton();
  }

  function refreshButton(){
    if(!button) return;
    button.textContent=running?'RETOUR REVISITED':(romBytes?'NES EXACT':'NES EXACT · CHARGER ROM');
    button.style.opacity=romBytes||running?'1':'.65';
  }

  function setRom(bytes){
    romBytes=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
    refreshButton();
  }

  function initAudio(){
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)({sampleRate:44100});
      if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
      if(!audioNode){
        audioNode=audioCtx.createScriptProcessor(2048,0,2);
        audioNode.onaudioprocess=e=>{
          const L=e.outputBuffer.getChannelData(0),R=e.outputBuffer.getChannelData(1);
          for(let i=0;i<L.length;i++){
            L[i]=audioQueueL.length?audioQueueL.shift():0;
            R[i]=audioQueueR.length?audioQueueR.shift():0;
          }
        };
        audioNode.connect(audioCtx.destination);
      }
    }catch(e){}
  }

  function onFrame(frameBuffer){
    for(let i=0;i<frameBuffer.length;i++) pixels[i]=0xff000000|(frameBuffer[i]&0x00ffffff);
    ctx.putImageData(image,0,0);
  }
  function onAudioSample(l,r){
    if(audioQueueL.length<16384){audioQueueL.push(l);audioQueueR.push(r);}
  }

  function binaryString(bytes){
    let out='',chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk) out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(bytes.length,i+chunk)));
    return out;
  }

  function start(){
    ensureUI();
    if(!romBytes){
      const input=document.querySelector('#zelda-rom-loader input[type=file]');
      if(input){ input.click(); return; }
      alert('Charge d’abord ta ROM Zelda NES originale.');
      return;
    }
    if(!global.jsnes || !global.jsnes.NES){ alert('JSNES indisponible dans ce build.'); return; }
    try{
      if(global.backgroundMusic) global.backgroundMusic.pause();
      if(global.DungeonNES && global.DungeonNES.state && global.DungeonNES.state.dungeonMusic) global.DungeonNES.state.dungeonMusic.pause();
    }catch(_){}
    initAudio();
    nes=new global.jsnes.NES({onFrame,onAudioSample});
    nes.loadROM(binaryString(romBytes));
    running=true; overlay.style.display='flex'; refreshButton();
    if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
    last=performance.now(); loop(last);
  }

  function stop(){
    running=false; if(raf) cancelAnimationFrame(raf); raf=0;
    if(overlay) overlay.style.display='none'; refreshButton();
    audioQueueL.length=0; audioQueueR.length=0;
    try{if(global.backgroundMusic) global.backgroundMusic.play().catch(()=>{});}catch(_){}
  }

  function loop(now){
    if(!running) return;
    const dt=now-last;
    if(dt>=1000/60){
      const frames=Math.min(2,Math.max(1,Math.floor(dt/(1000/60))));
      for(let i=0;i<frames;i++) nes.frame();
      last=now;
    }
    raf=requestAnimationFrame(loop);
  }

  function handle(type,e){
    if(!running||!nes||!keyMap[e.keyCode]) return false;
    const b=keyMap[e.keyCode]();
    if(type==='down') nes.buttonDown(1,b); else nes.buttonUp(1,b);
    e.preventDefault(); e.stopImmediatePropagation(); return true;
  }

  document.addEventListener('keydown',e=>handle('down',e),true);
  document.addEventListener('keyup',e=>handle('up',e),true);
  window.addEventListener('load',ensureUI);
  global.NESExact={setRom,start,stop,get running(){return running;},hasRom:()=>!!romBytes};
})(window);
