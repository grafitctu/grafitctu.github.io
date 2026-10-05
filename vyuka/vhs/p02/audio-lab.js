/* Original synthesized teaching sounds. No media downloads or autoplay. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const labels = {explore:'Průzkum', suspicion:'Podezření', combat:'Souboj'};
  let session = null, revision = 0, requestedMusic = 'explore', lastCue = null;

  function announceState(active, kind = null) {
    document.dispatchEvent(new CustomEvent('vhs:audio-state', {detail:{active,kind}}));
    document.querySelectorAll('[data-audio-stop]').forEach(button => {
      button.disabled = !active || !button.closest('.lab')?.id.startsWith(kind === 'cue' ? 'caption' : kind);
    });
    $('music-stinger').disabled = !active || kind !== 'music';
  }
  function stopAll(reason = 'Zvuk je zastavený.') {
    revision += 1;
    const previous = session;
    session = null;
    if (previous) {
      previous.timers.forEach(timer => {clearInterval(timer); clearTimeout(timer);});
      try {previous.master.gain.cancelScheduledValues(0); previous.master.gain.value = 0;} catch {}
      for (const node of previous.nodes) { try {node.stop();} catch {} }
      if (previous.ctx.state !== 'closed') previous.ctx.close().catch(() => {});
      const id = previous.kind === 'cue' ? 'cue-status' : `${previous.kind}-status`;
      $(id).textContent = reason;
      if (previous.kind === 'mix') {
        $('mix-phase').textContent = 'Scéna je zastavená.';
        $('mix-bed-value').textContent = 'vypnutý';
        $('mix-bed-meter').value = 0;
      }
    }
    document.querySelectorAll('.beats li').forEach(beat => beat.classList.remove('is-beat'));
    announceState(false);
  }
  async function begin(kind) {
    stopAll();
    const ticket = revision;
    const Audio = window.AudioContext || window.webkitAudioContext;
    const status = $(kind === 'cue' ? 'cue-status' : `${kind}-status`);
    if (!Audio) {status.textContent = 'Prohlížeč nepodporuje Web Audio. Text a ovládání zůstávají dostupné.'; return null;}
    try {
      const ctx = new Audio();
      const master = ctx.createGain(), analyser = ctx.createAnalyser();
      master.gain.value = kind === 'cue' ? Number($('cue-volume').value)/100
        : kind === 'mix' ? Number($('mix-volume').value)/100 : kind === 'distance' ? .25 : .15;
      // This controls the digital signal only. Hardware volume remains under the player's control.
      analyser.fftSize = 2048;
      master.connect(analyser); analyser.connect(ctx.destination);
      const active = {kind,ctx,master,analyser,nodes:new Set(),timers:[],ticket};
      session = active;
      await ctx.resume();
      if (ticket !== revision || session !== active) return null;
      announceState(true,kind);
      active.timers.push(setTimeout(() => {if (session === active) stopAll('Ukázka se automaticky zastavila po 60 sekundách.');}, 60000));
      return active;
    } catch (error) {
      if (ticket !== revision) return null;
      stopAll();
      status.textContent = 'Zvuk se nepodařilo spustit. Zkontrolujte povolení zvuku a výstupní zařízení.';
      return null;
    }
  }
  function tone(active, frequency, time, duration, amplitude = .15, type = 'triangle', destination = active.master) {
    const t = Math.max(active.ctx.currentTime, time);
    const osc = active.ctx.createOscillator(), envelope = active.ctx.createGain();
    osc.type = type; osc.frequency.value = frequency;
    envelope.gain.setValueAtTime(0,t);
    envelope.gain.linearRampToValueAtTime(amplitude,t+.012);
    envelope.gain.exponentialRampToValueAtTime(.00001,t+duration);
    osc.connect(envelope); envelope.connect(destination);
    active.nodes.add(osc);
    osc.onended = () => {active.nodes.delete(osc); osc.disconnect(); envelope.disconnect();};
    osc.start(t); osc.stop(t+duration+.02);
  }
  const midi = value => 440*Math.pow(2,(value-69)/12);

  function finishAt(active, endTime, message) {
    // Device clocks can start later than resume(). A wall-clock timeout cut short cues off.
    active.endsAt = endTime;
    active.timers.push(setInterval(() => {
      if (session === active && active.ctx.currentTime >= endTime) stopAll(message);
    },40));
  }

  function bufferSound(active, buffer, time, destination, amplitude = 1, rate = 1) {
    const source = active.ctx.createBufferSource(), gain = active.ctx.createGain();
    source.buffer = buffer; source.playbackRate.value = rate; gain.gain.value = amplitude;
    source.connect(gain); gain.connect(destination); active.nodes.add(source);
    source.onended = () => {active.nodes.delete(source); source.disconnect(); gain.disconnect();};
    source.start(time);
    return time + buffer.duration/rate;
  }

  function footstep(active, time, strength, destination) {
    tone(active,155,time,.19,.48*strength,'sine',destination);
    const duration = .19, count = Math.ceil(active.ctx.sampleRate*duration);
    const buffer = active.ctx.createBuffer(1,count,active.ctx.sampleRate), samples = buffer.getChannelData(0);
    let seed = 7391;
    for (let i=0;i<count;i++) {
      seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
      const t = i/active.ctx.sampleRate;
      samples[i] = (seed/2147483648-1)*Math.min(1,t/.008)*Math.exp(-t/.043);
    }
    const filter = active.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1450; filter.Q.value = .55;
    filter.connect(destination);
    bufferSound(active,buffer,time,filter,.55*strength);
  }

  function spatialSettings() {
    const pan = Number($('spatial-pan').value), distance = Number($('spatial-distance').value);
    const wall = $('spatial-wall').checked, mono = $('spatial-mono').checked;
    const direction = pan < -.1 ? 'Vlevo' : pan > .1 ? 'Vpravo' : 'Střed';
    $('spatial-pan-value').textContent = `${direction}${mono ? ' (mono výstup)' : ''}`;
    $('spatial-distance-value').textContent = String(distance);
    if (session?.kind === 'spatial') {
      const now = session.ctx.currentTime;
      session.pan.pan.setTargetAtTime(mono ? 0 : pan,now,.03);
      session.distanceGain.gain.setTargetAtTime(Math.pow(1/distance,.8)*(wall ? .5 : 1),now,.03);
      session.filter.frequency.setTargetAtTime(wall ? 700 : 8000,now,.03);
      $('spatial-status').textContent = `${mono ? 'Mono, směr nerozlišujeme' : direction}. Relativní vzdálenost ${distance}. ${wall ? 'Překážka: útlum a potlačení výšek.' : 'Bez překážky.'}`;
    }
  }
  async function startSpatial() {
    const active = await begin('spatial');
    if (!active) return;
    const ctx = active.ctx, source = ctx.createOscillator(), sourceGain = ctx.createGain();
    active.filter = ctx.createBiquadFilter(); active.filter.type = 'lowpass'; active.filter.Q.value = .5;
    active.distanceGain = ctx.createGain(); active.pan = ctx.createStereoPanner();
    source.type = 'sawtooth'; source.frequency.value = 176; sourceGain.gain.value = .18;
    source.connect(sourceGain); sourceGain.connect(active.filter); active.filter.connect(active.distanceGain);
    active.distanceGain.connect(active.pan); active.pan.connect(active.master);
    active.nodes.add(source);
    source.onended = () => {active.nodes.delete(source); source.disconnect(); sourceGain.disconnect();};
    spatialSettings(); source.start();
  }
  ['spatial-pan','spatial-distance','spatial-wall','spatial-mono'].forEach(id => $(id).addEventListener('input', spatialSettings));

  function setMusicState(state) {
    requestedMusic = state;
    document.querySelectorAll('[data-music-state]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.musicState === state)));
    if (session?.kind === 'music') {
      session.requested = state;
      $('music-status').textContent = `Zní: ${labels[session.audible]}. Požadavek: ${labels[state]}${state !== session.audible ? ' (čeká na další takt)' : ''}.`;
    } else {
      $('music-status').textContent = `Zvuk je vypnutý. Po spuštění: ${labels[state]}.`;
    }
  }
  async function startMusic() {
    const active = await begin('music');
    if (!active) return;
    const beat = 60/96, halfBeat = beat/2;
    active.start = active.ctx.currentTime+.12;
    active.nextTime = active.start; active.step = 0;
    active.requested = requestedMusic; active.scheduled = requestedMusic; active.audible = requestedMusic;
    active.changes = []; active.lastBeat = -1;
    function schedule() {
      if (session !== active || active.ctx.state !== 'running') return;
      while (active.nextTime < active.ctx.currentTime+.10) {
        const t = active.nextTime, step = active.step;
        if (step%8 === 0) {
          active.scheduled = active.requested;
          active.changes.push({time:t,state:active.scheduled});
        }
        if (step%2 === 0) tone(active,midi([57,60,64,60][(step/2)%4]),t,.52,.14);
        if (active.scheduled !== 'explore') tone(active,midi(step%2 ? 52 : 45),t,.13,.12);
        if (active.scheduled === 'combat') tone(active,step%2 ? 310 : 85,t,.09,.13,step%2 ? 'triangle' : 'sine');
        active.step += 1; active.nextTime += halfBeat;
      }
    }
    function visualize() {
      if (session !== active) return;
      const now = active.ctx.currentTime;
      while (active.changes.length && active.changes[0].time <= now) {
        active.audible = active.changes.shift().state;
        $('music-layers').textContent = 'Vrstvy: základní motiv' + (active.audible === 'explore' ? '' : ' + pulz') + (active.audible === 'combat' ? ' + rytmické akcenty' : '');
        $('music-status').textContent = `Zní: ${labels[active.audible]}. Požadavek: ${labels[active.requested]}${active.audible !== active.requested ? ' (čeká na další takt)' : ''}.`;
      }
      const position = now >= active.start ? Math.floor((now-active.start)/beat)%4 : -1;
      if (position !== active.lastBeat) {
        active.lastBeat = position;
        document.querySelectorAll('.beats li').forEach((element,index) => element.classList.toggle('is-beat',position === index));
      }
    }
    $('music-status').textContent = `Spouštím: ${labels[requestedMusic]}.`;
    schedule(); visualize();
    active.timers.push(setInterval(schedule,25),setInterval(visualize,50));
  }
  document.querySelectorAll('[data-music-state]').forEach(button => button.addEventListener('click', () => setMusicState(button.dataset.musicState)));
  $('music-stinger').addEventListener('click', () => {
    const active = session;
    if (active?.kind !== 'music') return;
    const beat = 60/96;
    const time = active.start+Math.max(0,Math.ceil((active.ctx.currentTime+.04-active.start)/beat))*beat;
    [69,72,76].forEach((note,index) => tone(active,midi(note),time+index*.16,.3,.12));
    $('music-stinger').disabled = true;
    active.timers.push(setTimeout(() => {if (session === active) $('music-stinger').disabled = false;},700));
  });

  const distanceModels = {
    linear: {name:'Lineární',formula:'g = 1 − (d − 1) / 19',color:'var(--curve-linear)',dash:'',gain:d=>Math.max(0,1-(d-1)/19)},
    inverse: {name:'Inverzní',formula:'g = 1 / d',color:'var(--curve-inverse)',dash:'7 3',gain:d=>1/d},
    exponential: {name:'Mocninná',formula:'g = d⁻² (Web Audio: exponential, rolloff = 2)',color:'var(--curve-power)',dash:'2 3',gain:d=>Math.pow(d,-2)},
    logarithmic: {name:'Logaritmická',formula:'g = 1 − ln(d) / ln(20), vlastní příklad',color:'var(--curve-log)',dash:'10 3 2 3',gain:d=>Math.max(0,1-Math.log(d)/Math.log(20))}
  };
  const distancePaths = {};
  let distanceMarker;
  const toChartX = d => 65+(d-1)/19*625, toChartY = g => 140-g*120;
  function chartElement(tag, attributes, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));
    if (text) node.textContent = text;
    $('distance-chart-content').append(node); return node;
  }
  chartElement('path',{d:'M65 20 V140 H690',fill:'none',stroke:'var(--muted)','stroke-width':1});
  for (const d of [1,5,10,15,20]) chartElement('text',{x:toChartX(d),y:168,'text-anchor':'middle',fill:'var(--muted)','font-size':23},String(d));
  for (const g of [0,.5,1]) {
    chartElement('line',{x1:65,x2:690,y1:toChartY(g),y2:toChartY(g),stroke:'var(--line)'});
    chartElement('text',{x:50,y:toChartY(g)+6,'text-anchor':'end',fill:'var(--muted)','font-size':23},String(g).replace('.',','));
  }
  const key = document.createElement('div'); key.className = 'curve-key';
  for (const [id,model] of Object.entries(distanceModels)) {
    const points = Array.from({length:101},(_,i)=>{const d=1+i/100*19; return `${toChartX(d)},${toChartY(model.gain(d))}`;}).join(' ');
    distancePaths[id] = chartElement('polyline',{points,fill:'none',stroke:model.color,'stroke-width':2,'stroke-dasharray':model.dash});
    const label = document.createElement('span'); label.textContent = model.name; label.style.setProperty('--curve-color',model.color); key.append(label);
  }
  $('distance-chart').after(key);
  distanceMarker = chartElement('circle',{cx:toChartX(4),cy:toChartY(distanceModels.linear.gain(4)),r:5,fill:'var(--ink)',stroke:'var(--paper)','stroke-width':2});
  function distanceSettings() {
    const model = $('distance-model').value, d = Number($('distance-position').value), gain = distanceModels[model].gain(d);
    $('distance-value').textContent = String(d).replace('.',',');
    $('distance-formula').textContent = distanceModels[model].formula;
    Object.entries(distancePaths).forEach(([id,node])=>{node.setAttribute('stroke-width',id === model ? 4 : 2); node.setAttribute('opacity',id === model ? 1 : .75);});
    distanceMarker.setAttribute('cx',toChartX(d)); distanceMarker.setAttribute('cy',toChartY(gain));
    const db = gain ? `${(20*Math.log10(gain)).toFixed(1).replace('.',',')} dB` : '−∞ dB';
    $('distance-status').textContent = `${session?.kind === 'distance' ? 'Zní' : 'Zvuk je vypnutý'}: ${distanceModels[model].name}, amplituda ${(100*gain).toFixed(1).replace('.',',')} % (${db}).`;
    if (session?.kind === 'distance') {
      session.model = model; session.distance = d; session.curveGain = gain;
      session.distanceGain.gain.setTargetAtTime(gain,session.ctx.currentTime,.04);
    }
  }
  async function startDistance() {
    const active = await begin('distance'); if (!active) return;
    active.distanceGain = active.ctx.createGain(); active.distanceGain.connect(active.master);
    const source = active.ctx.createOscillator(), gain = active.ctx.createGain();
    source.type = 'triangle'; source.frequency.value = 440; gain.gain.value = .45;
    source.connect(gain); gain.connect(active.distanceGain); active.nodes.add(source); source.start(); distanceSettings();
  }
  ['distance-model','distance-position'].forEach(id=>$(id).addEventListener('input',distanceSettings));

  async function speechBuffer(active, name) {
    const encoded = JSON.parse($('audio-assets').textContent)[name];
    const bytes = Uint8Array.from(atob(encoded),value=>value.charCodeAt(0));
    const buffer = await active.ctx.decodeAudioData(bytes.buffer);
    let peak = 0;
    for (let channel=0;channel<buffer.numberOfChannels;channel++) {
      for (const value of buffer.getChannelData(channel)) peak = Math.max(peak,Math.abs(value));
    }
    if (peak < .001) throw new Error('Empty speech asset');
    for (let channel=0;channel<buffer.numberOfChannels;channel++) {
      const samples=buffer.getChannelData(channel); for (let i=0;i<samples.length;i++) samples[i] *= .72/peak;
    }
    return buffer;
  }
  const duckGain = Math.pow(10,-16/20);
  function mixSettings() {
    $('mix-separate-label').hidden = $('mix-background').value !== 'voice';
    $('mix-volume-value').textContent = `${$('mix-volume').value} %`;
    if (session?.kind === 'mix') session.master.gain.setTargetAtTime(Number($('mix-volume').value)/100,session.ctx.currentTime,.02);
  }
  async function startMix() {
    const active = await begin('mix'); if (!active) return;
    $('mix-status').textContent = 'Připravuji místní hlasovou ukázku…';
    try {
      const main = await speechBuffer(active,'dialog-main.wav');
      const other = await speechBuffer(active,'dialog-background.wav');
      if (session !== active) return;
      active.mode = $('mix-background').value; active.separated = $('mix-separate').checked;
      active.bed = active.ctx.createGain(); active.bed.connect(active.master);
      const start = active.ctx.currentTime+.08;
      active.voiceStart = start+.55;
      active.voiceEnd = bufferSound(active,main,active.voiceStart,active.master,.85);
      active.otherStart = active.separated ? active.voiceEnd+.5 : active.voiceStart;
      active.otherEnd = active.mode === 'voice' ? bufferSound(active,other,active.otherStart,active.bed,.85,1.08) : 0;
      const end = Math.max(active.voiceEnd,active.otherEnd)+1.2;
      const beat = 60/96/2;
      active.nextTime = start; active.step = 0; active.lastDuck = null; active.phase = '';
      function schedule() {
        if (session !== active || !['crowded','clear'].includes(active.mode)) return;
        while (active.nextTime < active.ctx.currentTime+.12 && active.nextTime < end) {
          const step = active.step++, t = active.nextTime;
          if (active.mode === 'crowded') tone(active,midi([76,79,83,79][step%4]),t,.43,.44,'sawtooth',active.bed);
          else {
            tone(active,midi([45,52,57,52][step%4]),t,.43,.23,'sine',active.bed);
            if (step%4 === 0) tone(active,midi(100),t,.2,.035,'sine',active.bed);
          }
          active.nextTime += beat;
        }
      }
      function visualize() {
        if (session !== active) return;
        const now = active.ctx.currentTime, speaking = now >= active.voiceStart && now < active.voiceEnd;
        active.ducking = speaking && $('mix-duck').checked && active.mode !== 'none';
        if (active.ducking !== active.lastDuck) {
          active.bed.gain.setTargetAtTime(active.ducking ? duckGain : 1,now,active.ducking ? .025 : .15);
          active.lastDuck = active.ducking;
        }
        const secondary = active.mode === 'voice' && now >= active.otherStart && now < active.otherEnd;
        const phase = speaking ? (secondary ? 'Oba hlasy mluví současně.' : 'Zní hlavní pokyn.') : secondary ? 'Zní druhá replika.' : now < active.voiceStart ? 'Podklad před dialogem.' : 'Doznívání po hlavním pokynu.';
        if (phase !== active.phase) {active.phase = phase; $('mix-phase').textContent = phase;}
        const gain = active.bed.gain.value;
        $('mix-bed-meter').value = active.mode === 'none' ? 0 : gain;
        $('mix-bed-value').textContent = active.mode === 'none' ? 'vypnutý' : `${(20*Math.log10(Math.max(.00001,gain))).toFixed(1).replace('.',',')} dB`;
        $('mix-status').textContent = active.ducking ? 'Podklad při hlavním dialogu ustupuje. Hlavní hlas zůstává stejně hlasitý.' : 'Ducking právě nezeslabuje podklad.';
      }
      schedule(); visualize(); mixSettings();
      active.timers.push(setInterval(schedule,25),setInterval(visualize,50));
      finishAt(active,end,'Scéna skončila. Přehrajte ji s jiným nastavením.');
    } catch {
      if (session === active) stopAll('Hlasovou ukázku se nepodařilo načíst. Ostatní zvukové ukázky zůstávají dostupné.');
    }
  }
  ['mix-background','mix-separate'].forEach(id=>$(id).addEventListener('change',()=>{mixSettings(); if (session?.kind === 'mix') startMix();}));
  $('mix-duck').addEventListener('change',mixSettings);
  $('mix-volume').addEventListener('input',mixSettings);

  function showCue(event) {
    const captions = $('cue-captions').checked;
    const text = {left:'← [Kroky se blíží zleva]',right:'[Kroky se blíží zprava] →',complete:'✓ Akce dokončena'};
    $('cue-visual').textContent = captions ? text[event] : 'Alternativní signál je vypnutý.';
  }
  $('cue-play').addEventListener('click', async () => {
    const event = $('cue-event').value;
    lastCue = event; showCue(event);
    if (!$('cue-audio').checked) {
      stopAll();
      $('cue-status').textContent = $('cue-captions').checked ? 'Zvuk je vypnutý. Informaci nese popisek nebo potvrzení.' : 'Událost proběhla. Zvuk i alternativa jsou vypnuté, hráč nedostal signál.';
      return;
    }
    const active = await begin('cue');
    if (!active) return;
    showCue(event);
    const pan = active.ctx.createStereoPanner(); pan.pan.value = event === 'left' ? -.8 : event === 'right' ? .8 : 0;
    pan.connect(active.master);
    const now = active.ctx.currentTime+.03;
    if (event === 'complete') {
      [76,79,84].forEach((note,i) => tone(active,midi(note),now+i*.18,.3,.55,'triangle',pan));
    } else {
      [0,.36,.72,1.08].forEach((offset,i) => {
        footstep(active,now+offset,.75+.1*i,pan);
      });
    }
    $('cue-status').textContent = `Probíhá zvuková událost. ${$('cue-captions').checked ? 'Alternativa je zapnutá.' : 'Alternativa je vypnutá.'}`;
    finishAt(active,now+1.6,'Zvuková událost skončila.');
  });
  $('cue-test').addEventListener('click',async()=>{
    if (!$('cue-audio').checked) { $('cue-status').textContent = 'Pro testovací tón nejprve zapněte zvuk.'; return; }
    const active = await begin('cue'); if (!active) return;
    const now = active.ctx.currentTime+.08;
    [0,.4,.8].forEach((offset,i)=>tone(active,i%2 ? 880 : 660,now+offset,.28,.5,'triangle'));
    $('cue-status').textContent = 'Zní tři testovací tóny. Hlasitost výstupu je nastavitelná výše.';
    finishAt(active,now+1.25,'Testovací tón skončil.');
  });
  function cueVolume() {
    $('cue-volume-value').textContent = `${$('cue-volume').value} %`;
    if (session?.kind === 'cue') session.master.gain.setTargetAtTime(Number($('cue-volume').value)/100,session.ctx.currentTime,.02);
  }
  $('cue-volume').addEventListener('input',cueVolume);
  $('cue-captions').addEventListener('change', () => {if (lastCue) showCue(lastCue);});
  $('cue-audio').addEventListener('change', () => {if (!$('cue-audio').checked && session?.kind === 'cue') stopAll('Zvuk jste vypnuli.');});
  document.querySelectorAll('[data-audio-start]').forEach(button => button.addEventListener('click', () => {
    ({music:startMusic,spatial:startSpatial,distance:startDistance,mix:startMix})[button.dataset.audioStart]?.();
  }));
  document.querySelectorAll('[data-audio-stop]').forEach(button => button.addEventListener('click', () => stopAll()));
  document.addEventListener('visibilitychange', () => {if (document.hidden) stopAll('Zvuk se zastavil při opuštění karty.');});
  addEventListener('pagehide', () => stopAll());
  document.querySelectorAll('#spatial-lab .lab-note,#music-lab .lab-note').forEach(note => {note.textContent += ' Automatické zastavení po 60 s.';});

  // Small read-only diagnostics for automated checks; contains no recordings or user text.
  window.VHSAudio = Object.freeze({
    stopAll,
    getState() {
      if (!session) return {active:false};
      const data = new Float32Array(session.analyser.fftSize);
      session.analyser.getFloatTimeDomainData(data);
      return {active:true,kind:session.kind,context:session.ctx.state,time:session.ctx.currentTime,voices:session.nodes.size,
              rms:Math.sqrt(data.reduce((sum,sample) => sum+sample*sample,0)/data.length),
              pan:session.pan?.pan.value,cutoff:session.filter?.frequency.value,
              requested:session.requested,audible:session.audible,master:session.master.gain.value,endsAt:session.endsAt,
              distance:session.kind === 'distance' ? {model:session.model,distance:session.distance,gain:session.curveGain} : undefined,
              mix:session.kind === 'mix' ? {mode:session.mode,separated:session.separated,phase:session.phase,ducking:session.ducking,
                bedGain:session.bed?.gain.value,voiceStart:session.voiceStart,voiceEnd:session.voiceEnd,
                otherStart:session.otherStart,otherEnd:session.otherEnd} : undefined};
    }
  });
  spatialSettings(); distanceSettings(); mixSettings(); cueVolume(); announceState(false);

  const planKey = 'vhs-p02-event-plan', fields = ['event','audio','mix','alternative'];
  function values() {return Object.fromEntries(fields.map(field => [field,$(`plan-${field}`).value.slice(0,4000)]));}
  try {
    const stored = JSON.parse(localStorage.getItem(planKey) || 'null');
    if (stored && typeof stored === 'object') fields.forEach(field => {if (typeof stored[field] === 'string') $(`plan-${field}`).value = stored[field].slice(0,4000);});
  } catch {}
  fields.forEach(field => $(`plan-${field}`).addEventListener('input', () => {
    try {localStorage.setItem(planKey,JSON.stringify(values())); $('plan-status').textContent = 'Zápis je uložený pouze v tomto prohlížeči. Na server nic neposílá.';}
    catch {$('plan-status').textContent = 'Prohlížeč nepovolil místní uložení. Návrh můžete stáhnout tlačítkem.';}
  }));
  $('event-plan').addEventListener('submit', e => {
    e.preventDefault();
    const blob = new Blob([JSON.stringify({schemaVersion:1,lecture:'VHS P02',...values()},null,2)+'\n'],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'vhs-p02-zvukova-udalost.json'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    $('plan-status').textContent = 'Návrh je připravený ke stažení jako JSON.';
  });
  $('plan-clear').addEventListener('click', () => {
    fields.forEach(field => {$(`plan-${field}`).value = '';});
    try {localStorage.removeItem(planKey);} catch {}
    $('plan-status').textContent = 'Pracovní zápis je prázdný.';
  });
  $('knowledge-check').addEventListener('submit', e => {
    e.preventDefault();
    const answer = new FormData(e.target).get('answer');
    $('knowledge-result').textContent = answer === 'separate' ? 'Správně. Kritický signál má svůj termín. Hudba může přejít na vhodném hudebním bodě.' : answer ? 'Zkuste to znovu. Hráč potřebuje včasnou informaci, zvýšení všech hlasitostí problém neřeší.' : 'Nejprve vyberte odpověď.';
  });
  document.querySelectorAll('.knowledge-check[data-correct]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();
    const answer = new FormData(form).get('answer');
    form.querySelector('output').textContent = answer === form.dataset.correct ? form.dataset.success
      : answer ? form.dataset.retry : 'Nejprve vyberte odpověď.';
  }));
})();
