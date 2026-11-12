/**
 * SIMULACE HRY — první soubor ke čtení pro přebírající AI.
 * Nezávisí na DOM, Canvasu, obrázcích ani síti. Exportuje NinjaGame i do Node testů.
 * Souřadnice jsou světové pixely, osa Y roste dolů; rychlosti px/s, časy v sekundách.
 * game.js volá update(1/120, input). Náhodnost je pouze ve vizuálních efektech game.js.
 * Databázi připojuj v prezentační vrstvě přes API, nikdy uvnitř update().
 * Stavový automat: ready -> playing <-> paused -> dead | won; reset() začíná nový pokus.
 */
/* Deterministic fixed-step platformer simulation. No external runtime dependencies. */
(function(root) {
  'use strict';
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const approach = (value, target, step) => value < target ? Math.min(target, value + step) : Math.max(
    target, value - step);
  class NinjaGame {
    constructor() {
      this.reset();
      this.state = 'ready';
    }
    /** Nový celý pokus: reset bodů, orbs, životů, statistiky i checkpointu.
     * finish=6600 je historická inicializační hodnota; makeLevel() ji přepíše na 9000.
     * ready se nastavuje až po resetu v konstruktoru; tlačítko START volá reset() znovu. */
    reset() {
      this.time = 0;
      // v11: pravidla/mapa patří do každého budoucího API výsledku.
      this.rulesVersion = 'konoha-v11';
      this.mapVersion = 'rooftops-branch-v1';
      this.awarded = new Set(); // Přetrvá respawn, vymaže až nový pokus.
      this.flowKinds = [];
      this.progressStep = 0;
      this.penalty = 0;
      this.gaps = [];
      this.gapAttempts = new Set();
      this.beamAttempts = new Set();
      this.bestX = 80;
      this.score = 0;
      this.combo = 0;
      this.comboTimer = 0;
      this.hp = 3;
      this.checkpoint = 80;
      this.checkpointY = 400;
      this.zoneIndex = 0;
      this.state = 'playing';
      this.events = [];
      this.shots = [];
      this.spawnTimer = 3;
      this.finish = 6600;
      this.solids = [];
      this.orbs = [];
      this.signs = [];
      this.stats = {
        jump: 0,
        double: 0,
        dash: 0,
        wall: 0,
        slide: 0,
        deflect: 0
      };
      this.makeLevel();
      this.respawn();
    }
    /** Šest pevných zón po 1500 px. Pole roofs=[lokální x, šířka, výška povrchu],
     * walls=[lokální x, výška zdi], crates=[x,výška], tunnels=[x,šířka].
     * Při editaci překážek musí floorAt(x) najít střechu; neumisťovat je doprostřed mezery.
     * Změna tratě nebo bodování vyžaduje nové rulesVersion/mapVersion pro žebříček. */
    makeLevel() {
      this.zones = [{
        name: '01 — ROZCVIČKA',
        hint: 'NÍZKÉ STŘECHY · SKOK A SKLUZ',
        start: 0,
        roofs: [
          [0, 610, 400],
          [710, 410, 370],
          [1210, 290, 400]
        ],
        walls: [
          [1310, 90]
        ],
        crates: [
          [330, 45]
        ],
        tunnels: [
          [470, 100]
        ]
      }, {
        name: '02 — VÝŠ A VÝŠ',
        hint: 'VYŠŠÍ STŘECHY · PRVNÍ WALL JUMP',
        start: 1500,
        roofs: [
          [0, 470, 400],
          [570, 460, 340],
          [1130, 370, 400]
        ],
        walls: [], // Stěna je nyní na volitelné horní větvi (viz níže).
        crates: [
          [210, 50]
        ],
        tunnels: [
          [1210, 160],
          [715, 190] // Spodní větev: průchod skluzem po souvislé střeše.
        ]
      }, {
        name: '03 — ŠKOLA ODRAZŮ',
        hint: 'TŘI STĚNY · SKOK U STĚNY OBNOVÍ DASH',
        start: 3000,
        roofs: [
          [0, 450, 400],
          [600, 380, 370],
          [1100, 400, 400]
        ],
        walls: [
          [250, 200],
          [740, 210],
          [1230, 220]
        ],
        crates: [],
        tunnels: []
      }, {
        name: '04 — CHAKRA KOMBO',
        hint: 'SKOK → DASH → DOPAD → SKLUZ',
        start: 4500,
        roofs: [
          [0, 420, 400],
          [780, 400, 410],
          [1280, 220, 370]
        ],
        walls: [
          [1360, 170]
        ],
        crates: [
          [160, 45]
        ],
        tunnels: [
          [855, 190]
        ]
      }, {
        name: '05 — NAD ULIČKAMI',
        hint: 'VYŠŠÍ DOPAD · DASH · NÍZKÝ PRŮCHOD',
        start: 6000,
        roofs: [
          [0, 390, 370],
          [770, 280, 330],
          [1180, 320, 400]
        ],
        walls: [
          [210, 180],
          [1280, 220]
        ],
        crates: [],
        tunnels: [
          [805, 190]
        ]
      }, {
        name: '06 — ZKOUŠKA SHINOBI',
        hint: 'DLOUHÁ MEZERA · SKLUZ · POSLEDNÍ STĚNA',
        start: 7500,
        roofs: [
          [0, 440, 400],
          [840, 370, 370],
          [1350, 150, 400]
        ],
        walls: [
          [210, 220],
          [1390, 210]
        ],
        crates: [],
        tunnels: [
          [875, 210]
        ]
      }];
      this.checkpoints = [];
      for (const z of this.zones) {
        const floorAt = x => z.roofs.find(r => x >= r[0] && x < r[0] + r[1])[2];
        this.checkpoints.push({
          x: z.start + 60,
          y: z.roofs[0][2],
          zone: this.checkpoints.length
        });
        for (const [x, w, y] of z.roofs) this.solids.push({
          x: z.start + x,
          y,
          w,
          h: 660 - y,
          type: 'roof'
        });
        for (const [x, h] of z.walls) {
          let y = floorAt(x) - h;
          this.solids.push({
            x: z.start + x,
            y,
            w: 42,
            h,
            type: 'wall'
          });
          this.signs.push({
            x: z.start + x - 75,
            y: y - 18,
            text: h > 150 ? '↑ WALL JUMP → ZNOVU' : '↑ ODRAZ OD STĚNY'
          });
        }
        for (const [x, h] of z.crates) this.solids.push({
          x: z.start + x,
          y: floorAt(x) - h,
          w: 42,
          h,
          type: 'crate'
        });
        for (const [x, w] of z.tunnels) {
          const floor = floorAt(x),
            height = z.start === 0 ? 90 : z.start === 1500 ? 150 : 217;
          this.solids.push({
            x: z.start + x,
            y: floor - 28 - height,
            w,
            h: height,
            type: 'beam'
          });
          this.signs.push({
            x: z.start + x - 45,
            y: floor - 75,
            text: '↓ DRŽ SKLUZ'
          });
        }
        for (let i = 0; i < z.roofs.length - 1; i++) {
          const left = z.roofs[i],
            right = z.roofs[i + 1],
            edge = left[0] + left[1],
            gap = right[0] - edge;
          this.signs.push({
            x: z.start + edge - 100,
            y: left[2] - 150,
            text: gap > 300 ? 'SKOK → DASH → SKOK' : '↑ NA DALŠÍ STŘECHU'
          });
          for (let j = 0; j < 5; j++) this.orbs.push({
            x: z.start + edge + j * gap / 4,
            y: left[2] - 80 - Math.sin(j / 4 * Math.PI) * 50,
            r: 6,
            taken: false
          });
        }
        this.signs.push({
          x: z.start + 65,
          y: z.roofs[0][2] - 140,
          text: z.name
        });
      }
      // Obě větve jsou skutečné solidní plochy, bez teleportu či přepínače.
      // Dole se dá bezpečně projet skluzem, nahoře získat svitek za přesnější skoky.
      this.branch = { start: 2070, end: 2530 };
      this.solids.push(
        {x:2085,y:255,w:90,h:16,type:'ledge'},
        {x:2155,y:165,w:32,h:90,type:'wall'},
        {x:2420,y:140,w:95,h:16,type:'ledge'}
      );
      this.scroll = {x:2460,y:112,taken:false};
      this.signs.push(
        {x:1980,y:195,text:'ROZCESTÍ: ↑ SVITEK / ↓ SKLUZ'},
        {x:2420,y:87,text:'SVITEK +500'},
        {x:2515,y:285,text:'→ SPOJENÍ CEST'}
      );
      this.solids.forEach((solid,i)=>solid.id='solid:'+i);
      for(const z of this.zones) for(let i=0;i<z.roofs.length-1;i++) {
        const a=z.roofs[i], b=z.roofs[i+1];
        this.gaps.push({id:'gap:'+z.start+':'+i,fromStart:z.start+a[0],left:z.start+a[0]+a[1],
          right:z.start+b[0],end:z.start+b[0]+b[1],fromY:a[2],toY:b[2]});
      }
      this.finish = 9000;
      this.solids.push({
        x: this.finish,
        y: 400,
        w: 650,
        h: 260,
        type: 'roof'
      });
    }
    /** Návrat na checkpoint po zásahu; celkové body, sebrané orby a stats se nemažou.
     * p = hráč: x/y levý horní roh hitboxu, w/h rozměry (22×40 nebo 22×20).
     * ground kontakt se zemí; coyote/buffer tolerance 0.14/0.16 s.
     * jumps zásoba vzdušných odrazů; dash délka aktivního dashe, cool jeho cooldown.
     * wall/wallSide = -1 vlevo, +1 vpravo; wallGrace tolerance kontaktu; lock ochrana odrazu.
     * wallGripLeft = 1 s pomalého skluzu; inv = nezranitelnost; face = směr kresby.
     * jumpHeld + pressConsumed zabraňují druhému skoku na puštění již použitého stisku.
     * skid/skidding slouží vizuálnímu smyku a tomu, aby se event nezakládal každý tick. */
    respawn() {
      this.p = {
        x: this.checkpoint,
        y: this.checkpointY - 40,
        w: 22,
        h: 40,
        vx: 0,
        vy: 0,
        ground: false,
        coyote: 0,
        buffer: 0,
        bufferAir: false,
        jumps: 2,
        dash: 0,
        cool: 0,
        wall: 0,
        wallSide: 0,
        wallGrace: 0,
        wallGripLeft: 1,
        wallGrip: false,
        jumpHeld: false,
        pressConsumed: false,
        lock: 0,
        inv: 1.5,
        slide: false,
        face: 1,
        skid: 0,
        skidding: false
      };
      this.shots = [];
      this.gapAttempts.clear();
      this.beamAttempts.clear();
    }
    // Jednosměrná fronta efektů; game.js ji po zpracování vyprázdní. Není to persistentní event log.
    event(type, x = this.p.x + 11, y = this.p.y + 20) {
      this.events.push({
        type,
        x,
        y
      });
    }
    /** Vstupní akce živí animaci/statistiku, NIKOLI skóre. Skákání na místě je zdarma.
     * Body vydává pouze award() s jedinečným ID dokončené překážky/předmětu.
     * Set awarded se nemění při smrti, takže zpáteční cesta ani respawn nic nefarmí. */
    trick(type) {
      this.stats[type]++;
      this.event(type);
    }
    award(id,base,kind,flow=true) {
      if(this.awarded.has(id)) return 0;
      this.awarded.add(id);
      if(flow) {
        if(this.comboTimer<=0) this.flowKinds=[];
        this.flowKinds=this.flowKinds.filter(k=>k!==kind).concat(kind).slice(-3);
        this.combo=this.flowKinds.length; // Rozmanitost úspěchů, nejvýše 3×.
        this.comboTimer=4;
      }
      const points=base*(flow?this.combo:1);
      this.score+=points;
      this.events.push({type:'score',x:this.p.x+11,y:this.p.y,points,kind});
      return points;
    }
    // Jedna odměna za střely na každých 300 px tratě, bez ohledu na počet respawnů.
    hazardAward(base,kind) {
      return this.award('hazard:'+Math.floor(this.p.x/300),base,kind);
    }
    get resultTime() { return this.time+this.penalty; }
    medal() {
      if(this.state!=='won') return null;
      const t=this.resultTime;
      return t<=70?'gold':t<=100?'silver':t<=150?'bronze':'finish';
    }
    /** Dokončení překážky se odvozuje z kolizní geometrie, ne ze stisku tlačítka.
     * Beam se musí skutečně projet uvnitř; mezera vyžaduje odchod z levé střechy
     * a dopad na pravou. Rozpracované průchody se při respawnu zahodí. */
    scoreMovement(before) {
      const p=this.p, feet=p.y+p.h;
      const progress=Math.max(0,Math.floor((this.bestX-80)/100));
      if(progress>this.progressStep) {
        this.score+=(progress-this.progressStep)*10;
        this.progressStep=progress;
      }
      for(const s of this.solids) {
        if(s.type==='beam') {
          if(p.slide&&p.x+p.w>s.x&&p.x<s.x+s.w&&p.y>=s.y+s.h-1&&feet<=s.y+s.h+30)
            this.beamAttempts.add(s.id);
          if(this.beamAttempts.has(s.id)&&before.x<s.x+s.w&&p.x>=s.x+s.w) {
            this.award(s.id,150,'slide'); this.beamAttempts.delete(s.id);
          }
        } else if((s.type==='wall'||s.type==='crate')&&before.x<s.x+s.w&&p.x>=s.x+s.w&&feet<=s.y+8) {
          this.award(s.id,150,s.type==='wall'?'wall':'jump');
        }
      }
      for(const gap of this.gaps) {
        // Remember the departure roof even when taking off early from a wall on it.
        if(before.ground&&before.x>=gap.fromStart&&before.x<gap.left&&before.feet<=gap.fromY+6)
          this.gapAttempts.add(gap.id);
        if(this.gapAttempts.has(gap.id)&&p.ground&&p.x+p.w>gap.right&&p.x<gap.end&&feet<=gap.toY+6) {
          this.award(gap.id,200,'gap'); this.gapAttempts.delete(gap.id);
        }
      }
      const scroll=this.scroll;
      if(!scroll.taken&&Math.abs(p.x+11-scroll.x)<24&&Math.abs(p.y+p.h/2-scroll.y)<30) {
        scroll.taken=true; this.award('scroll',500,'scroll',false); this.event('scroll');
      }
    }
    // Nízká úroveň pro testy/buffer. Skutečný vstup má volat pressJump()/releaseJump(), nikoli jump().
    jump(air = true) {
      if (this.state === 'playing') {
        this.p.buffer = .16;
        this.p.bufferAir = air;
      }
    }
    /** Vzdušný dvojskok je okamžitě na stisk. Zem, coyote a stěna mají přednost:
     * stisk tam jen připraví odraz/přidržení a skáče se až při puštění.
     * Geometrický test podpory pokrývá i první snímek po START, kdy ground ještě není aktualizované. */
    pressJump() {
      const p = this.p;
      if (this.state !== 'playing' || p.jumpHeld) return;
      p.jumpHeld = true;
      p.pressConsumed = false;
      const supported = p.ground || this.solids.some(s => Math.abs(p.y + p.h - s.y) < .01 && p.x + p.w > s
        .x && p.x < s.x + s.w);
      const touchingWall = p.wallGrace > 0 || this.solids.some(s => p.y + p.h > s.y + 2 && p.y < s.y + s
        .h - 2 &&
        (Math.abs(p.x + p.w - s.x) <= 3 || Math.abs(p.x - (s.x + s.w)) <= 3));
      if (!supported && p.coyote <= 0 && !touchingWall && p.jumps > 0) {
        this.takeJump(false);
        p.pressConsumed = true;
      } else if (supported) this.event('prepare', p.x + 11, p.y + p.h);
    }
    // Ztráta fokusu nebo pointercancel není puštění skoku: zruš také čekající buffer.
    cancelJump() {
      this.p.jumpHeld = false;
      this.p.pressConsumed = false;
      this.p.buffer = 0;
    }
    // Puštění spotřebovaného dvojskoku nesmí skočit znovu ani po dopadu či obnovení dashe.
    releaseJump() {
      const p = this.p,
        armed = p.jumpHeld && !p.pressConsumed;
      p.jumpHeld = false;
      p.pressConsumed = false;
      if (armed && this.state === 'playing') this.jump(false);
    }
    // Společná fyzika odrazu; first=-560 px/s, vzdušná korekce=-400 px/s. Neměnit podle animace.
    takeJump(first) {
      const p = this.p;
      p.vy = first ? -560 : -400;
      p.jumps = first ? 1 : p.jumps - 1;
      p.ground = false;
      p.coyote = 0;
      p.wallGrace = 0;
      p.buffer = 0;
      p.dash = 0;
      this.trick(first ? 'jump' : 'double');
    }
    // Dash 850 px/s na 0.17 s, obnoví jeden vzdušný skok; dopad a wall jump obnovují cooldown.
    dash() {
      let p = this.p;
      if (this.state !== 'playing' || p.cool > 0 || p.dash > 0) return false;
      p.dash = .17;
      p.cool = .85;
      p.vy = 0;
      p.vx = p.face * 850;
      p.jumps = Math.max(1, p.jumps);
      this.trick('dash');
      return true;
    }
    // Zásah buď respawnuje, nebo emituje dead. Finální výsledek odesílat až na dead/won, ne na hit.
    damage() {
      if (this.p.inv > 0 || this.state !== 'playing') return;
      this.hp--;
      this.penalty+=5;
      this.flowKinds=[];
      this.comboTimer=0;
      this.event('hit');
      this.combo = 0;
      if (this.hp <= 0) {
        this.state = 'dead';
        this.event('dead');
      } else this.respawn();
    }
    // Consume a release once, either now or on the next valid contact.
    // Buffer se zkouší před pohybem i po kolizích, aby odraz po dopadu nastal v témže ticku.
    tryJump(air = true) {
      const p = this.p;
      if (p.buffer <= 0) return false;
      if (p.wallGrace > 0 && !p.ground && p.lock <= 0) {
        p.vy = -545;
        p.vx = -p.wallSide * 320;
        p.face = -p.wallSide;
        p.lock = .10;
        p.jumps = 1;
        p.cool = 0;
        p.wallGrace = 0;
        p.wall = 0;
        p.wallGripLeft = 1;
        p.wallGrip = false;
        p.coyote = 0;
        p.buffer = 0;
        p.dash = 0;
        this.trick('wall');
        return true;
      }
      const first = p.ground || p.coyote > 0;
      if (!first && (!air || !p.bufferAir || p.jumps <= 0)) return false;
      // A release just before touchdown belongs to the landing, not the double jump.
      if (!first && p.vy >= 0 && p.dash <= 0) {
        const t = Math.min(.09, p.buffer),
          feet = p.y + p.h;
        if (this.solids.some(s => {
            const gap = s.y - feet;
            if (gap < 0 || gap > p.vy * t + 675 * t * t) return false;
            const hitTime = (Math.sqrt(p.vy * p.vy + 2700 * gap) - p.vy) / 1350;
            const x = p.x + p.vx * hitTime;
            return x + p.w > s.x && x < s.x + s.w;
          })) return false;
      }
      this.takeJump(first);
      return true;
    }
    /** Jeden pevný simulační krok. input={left:boolean,right:boolean,slide:boolean}.
     * Pořadí je záměrné: časovače -> tvar hitboxu -> skok -> rychlost -> X kolize ->
     * wall grip -> Y kolize -> buffered odraz -> checkpointy -> střely/orby -> cíl.
     * Nepřidávat await, fetch, DOM ani proměnný requestAnimationFrame dt. */
    update(dt, input = {}) {
      if (this.state !== 'playing') return;
      this.time += dt; // Aktivní simulační čas: pauza ani kosmetický hitstop se nepočítají.
      const before={x:this.p.x,feet:this.p.y+this.p.h,ground:this.p.ground};
      let p = this.p;
      p.wallGrip = false;
      this.bestX = Math.max(this.bestX, p.x);
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
      for (const key of ['coyote', 'buffer', 'cool', 'inv', 'wallGrace', 'lock', 'skid']) p[key] = Math
        .max(0, p[key] - dt);
      // Zmenšení hitboxu zachová polohu chodidel. Při nízkém stropu nelze předčasně vstát.
      const oldSlide = p.slide;
      let wantsSlide = !!input.slide && (p.ground || p.vy >= 0 || p.dash > 0);
      if (p.slide && !wantsSlide) {
        let stand = {
          x: p.x,
          y: p.y - 20,
          w: p.w,
          h: 40
        };
        wantsSlide = this.solids.some(s => overlap(stand, s));
      }
      p.slide = wantsSlide;
      let h = p.slide ? 20 : 40;
      if (h !== p.h) {
        p.y += p.h - h;
        p.h = h;
        if (p.slide && !oldSlide) this.trick('slide');
      }
      this.tryJump();
      let wasGround = p.ground;
      if (p.dash > 0) {
        p.dash = Math.max(0, p.dash - dt);
        p.vy = 0;
      } else {
        if (p.lock <= 0) {
          const direction = input.left ? -1 : input.right ? 1 : 0,
            speed = p.slide ? 335 : 245;
          const reversing = direction !== 0 && p.vx * direction < 0;
          const skidding = p.ground && reversing && Math.abs(p.vx) > 45;
          if (skidding && !p.skidding) {
            p.skid = .18;
            this.event('skid', p.x + 11, p.y + p.h);
          }
          p.skidding = skidding;
          // Skluz má menší tření a drží rychlost dashe; opačný směr stále aktivně brzdí.
          if (p.ground) {
            if (!direction) {
              p.vx = approach(p.vx, 0, (p.slide ? 420 : Math.abs(p.vx) > speed ? 4200 : 1400) * dt);
            } else if (reversing) {
              p.vx = approach(p.vx, direction * speed, 2300 * dt);
            } else if (Math.abs(p.vx) > speed) {
              p.vx = direction * (speed + (Math.abs(p.vx) - speed) * Math.exp(-(p.slide ? 1.6 : 8) * dt));
            } else {
              p.vx = approach(p.vx, direction * speed, 2200 * dt);
            }
          } else {
            // Releasing direction preserves flight; the opposite direction actively brakes.
            if (reversing) {
              p.vx = approach(p.vx, direction * speed, 1800 * dt);
            } else if (Math.abs(p.vx) > speed) {
              p.vx = Math.sign(p.vx) * (speed + (Math.abs(p.vx) - speed) * Math.exp(-3.8 * dt));
              if (!direction) p.vx *= Math.exp(-.35 * dt);
            } else if (direction) {
              p.vx = approach(p.vx, direction * speed, 900 * dt);
            } else {
              p.vx *= Math.exp(-.35 * dt);
            }
          }
          if (direction) p.face = direction;
        }
        p.vy = Math.min(780, p.vy + 1350 * dt);
      }
      // Oddělené osové AABB kolize: nejdřív X (zeď), potom Y (dopad/strop).
      p.x += p.vx * dt;
      p.x = Math.max(0, p.x);
      p.wall = 0;
      for (const s of this.solids) {
        if (overlap(p, s)) {
          if (p.vx > 0) {
            p.x = s.x - p.w;
            p.wall = 1;
          } else if (p.vx < 0) {
            p.x = s.x + s.w;
            p.wall = -1;
          }
          p.vx = 0;
          p.dash = 0;
          if (p.wall && p.lock <= 0) {
            p.wallSide = p.wall;
            p.wallGrace = .14;
            if (!p.ground && p.vy > 100) p.vy = 100;
          }
        }
      }
      // Holding jump buys one second of slow descent per landing / wall jump.
      // Check actual contact before vertical movement, including a neutral direction.
      if (!p.ground && p.lock <= 0 && p.dash <= 0 && p.vy > 0) {
        const touching = this.solids.some(s => p.y + p.h > s.y + 2 && p.y < s.y + s.h - 2 &&
          (Math.abs(p.x + p.w - s.x) <= 3 || Math.abs(p.x - (s.x + s.w)) <= 3));
        if (touching && p.jumpHeld && p.wallGripLeft > 1e-6) {
          p.wallGrip = true;
          p.wallGripLeft = Math.max(0, p.wallGripLeft - dt);
          p.vy = Math.min(p.vy, 35);
        }
      }
      const prevY = p.y;
      p.y += p.vy * dt;
      p.ground = false;
      for (const s of this.solids) {
        if (overlap(p, s)) {
          if (p.vy >= 0 && prevY + p.h <= s.y + 5) {
            p.y = s.y - p.h;
            p.vy = 0;
            p.ground = true;
            p.jumps = 2;
            p.coyote = .14;
            p.cool = 0;
            if (!wasGround) this.event('land');
          } else if (p.vy < 0) {
            p.y = s.y + s.h;
            p.vy = 0;
          }
        }
      }
      if (wasGround && !p.ground && p.vy >= 0) p.jumps = Math.min(p.jumps, 1);
      // Keep wall contact without requiring a fresh horizontal collision every frame.
      if (!p.ground && p.lock <= 0) {
        const wall = this.solids.find(s => p.y + p.h > s.y + 2 && p.y < s.y + s.h - 2 &&
          (Math.abs(p.x + p.w - s.x) <= 3 || Math.abs(p.x - (s.x + s.w)) <= 3));
        if (wall) {
          p.wall = p.x < wall.x ? 1 : -1;
          p.wallSide = p.wall;
          p.wallGrace = .14;
          if (p.vy > 100) p.vy = 100;
        }
      }
      if (p.ground) {
        p.wallGrace = 0;
        p.wall = 0;
        p.wallGripLeft = 1;
        p.wallGrip = false;
      }
      this.tryJump(false); // Buffered landing/wall release fires on this contact frame.

      this.bestX=Math.max(this.bestX,p.x);
      this.scoreMovement(before);
      // Obtížnost závisí na dosažené vzdálenosti, ne na čase čekání hráče.
      this.zoneIndex = Math.min(5, Math.floor(this.bestX / 1500));
      for (const c of this.checkpoints) {
        if (c.x > this.checkpoint && p.x >= c.x) {
          this.checkpoint = c.x;
          this.checkpointY = c.y;
          this.event('checkpoint');
        }
      }
      if (p.y > 590) {
        p.inv = 0;
        this.damage();
        return;
      }
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && p.x > 900) {
        const stage = this.zoneIndex;
        this.spawnTimer = [3, 2.65, 2.3, 2, 1.75, 1.5][stage];
        const shotY = Math.max(100, Math.min(430, p.y + 8 + (Math.floor(this.time) % 3) * 10));
        this.shots.push({
          x: p.x + 650,
          y: shotY,
          w: 17,
          h: 17,
          vx: -230 - stage * 22,
          spin: 0,
          near: false,
          windup: .65 // Viditelná příprava; během ní střela stojí a nemůže zasáhnout.

        });
        this.event('warning', p.x + 570, shotY);
      }
      for (const s of this.shots) {
        if(s.windup>0) { s.windup=Math.max(0,s.windup-dt); continue; }
        s.x += s.vx * dt;
        s.spin += dt * 14;
        if (overlap(p, s)) {
          if (p.dash > 0) {
            s.dead = true;
            this.trick('deflect');
            this.hazardAward(150,'deflect');
          } else {
            this.damage();
            break;
          }
        } else if (!s.near && Math.abs(s.x - p.x) < 28 && Math.abs(s.y - p.y) < 90) {
          s.near = true;
          this.hazardAward(50,'near');
          this.event('near');
        }
      }
      this.shots = this.shots.filter(s => !s.dead && s.x > p.x - 500);
      // damage() může nahradit hráče respawnem nebo ukončit pokus. Starý p nesmí
      // v tomtéž ticku sebrat předměty či přepsat smrt na vítězství za cílovou čárou.
      if(this.p!==p||this.state!=='playing') return;
      // Každý orb jen jednou za celý pokus: +100 bodů. Hazard bonus je omezen úsekem.
      for (const o of this.orbs) {
        if (!o.taken && Math.abs(p.x + 11 - o.x) < 22 && Math.abs(p.y + p.h / 2 - o.y) < 30) {
          o.taken = true;
          this.score += 100;
          this.event('orb', o.x, o.y);
        }
      }
      // Cíl: bonus +500 za zbývající život. Event won se emituje až PO připsání bonusu.
      if (p.x >= this.finish) {
        this.state = 'won';
        this.award('finish',this.hp*500,'finish',false);
        this.event('won');
      }
    }
  }
  if (typeof module !== 'undefined') module.exports = {
    NinjaGame,
    overlap
  };
  else root.NinjaGame = NinjaGame;
})(typeof window !== 'undefined' ? window : globalThis);
