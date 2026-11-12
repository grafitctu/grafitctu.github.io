/**
 * VIZUÁLNÍ STAVOVÝ AUTOMAT. Nemění fyziku, vstupy ani hitboxy v engine.js.
 * Atlas obsahuje 16 klipů po 4 snímcích. clips je pořadí v atlas.js, ne pořadí eventů.
 * update() dostává render dt v sekundách; draw() používá obrazovkové souřadnice chodidel.
 * Generovaný PNG se nemění. Pomocné headX/anchor údaje řeší posuny mezi pózami.
 */
/* Generated Naruto atlas playback; visual transitions never delay physics/input. */
(function(root) {
  'use strict';
  const clips = {
    idle: 0,
    run: 1,
    crouch: 2,
    jump: 3,
    double: 4,
    fall: 5,
    dash: 6,
    slide: 7,
    wallGrip: 8,
    wallJump: 9,
    land: 10,
    skid: 11,
    hit: 12,
    dead: 13,
    won: 14,
    slideExit: 15
  };
  const loops = new Set(['idle', 'run', 'fall', 'wallGrip', 'skid', 'won']);
  const smooth = t => t * t * (3 - 2 * t);
  class NinjaAnimator {
    constructor(atlas, image) {
      this.atlas = atlas;
      this.image = image;
      this.scratch = null;
      this.reset();
    }
    // Reset pro nový pokus. scratch canvas zůstává k opětovnému použití, nevytvářet jej každý snímek.
    reset() {
      this.action = 'idle';
      this.time = 0;
      this.phase = 0;
      this.runPhase = 0;
      this.pulse = null;
      this.previousSlide = false;
      this.frame = 0;
      this.blend = null;
      this.height = null;
      this.headX = null;
      this.initialized = false;
    }
    // Krátké jednorázové animace. Nepřepisovat zde action/frame: update musí zachytit právě viditelnou pózu.
    trigger(event) {
      const names = {
        jump: ['jump', .23],
        double: ['double', .32],
        wall: ['wallJump', .26],
        land: ['land', .14],
        hit: ['hit', .35]
      };
      // Leave the currently drawn pose intact until update can capture its transition.
      if (names[event]) {
        const [name, duration] = names[event];
        this.pulse = {
          name,
          left: duration
        };
      }
    }
    // Vrací vážené vrstvy přechodu. Snímek vrácený pose() je samostatná kopie pro ghost trail.
    layers() {
      if (!this.blend) return [{
        frame: this.frame,
        action: this.action,
        weight: 1
      }];
      const t = smooth(Math.min(1, this.blend.elapsed / this.blend.duration));
      return [...this.blend.from.map(p => ({
        ...p,
        weight: p.weight * (1 - t)
      })), {
        frame: this.frame,
        action: this.action,
        weight: t
      }].filter(p => p.weight > .0001);
    }
    /** Priorita: dead/won -> hit -> slide/dash -> wall/air -> crouch/skid -> land/run/idle.
     * maxHeight je volná výška pod skutečným stropem. Smooth vizuál nesmí kreslit do překážky.
     * V pause se nemění fáze, pulse, přechod ani pomocné ukotvení. */
    update(dt, p, state, maxHeight = Infinity) {
      if (state === 'paused') return;
      if (this.blend) {
        this.blend.elapsed += dt;
        if (this.blend.elapsed >= this.blend.duration) this.blend = null;
      }
      if (this.pulse) {
        this.pulse.left -= dt;
        if (this.pulse.left <= 0) this.pulse = null;
      }
      if (this.previousSlide && !p.slide && p.ground) this.pulse = {
        name: 'slideExit',
        left: .16
      };
      this.previousSlide = p.slide;
      let action = 'idle';
      if (state === 'dead') action = 'dead';
      else if (state === 'won') action = 'won';
      else if (this.pulse?.name === 'hit') action = 'hit';
      else if (p.slide && (p.ground || p.dash > 0)) action = 'slide';
      else if (p.dash > 0) action = 'dash';
      else if (!p.ground && state !== 'ready') {
        if (p.wall && p.vy >= 0) action = 'wallGrip';
        else if (this.pulse && ['double', 'wallJump', 'jump'].includes(this.pulse.name)) action = this
          .pulse.name;
        else action = p.vy < 0 ? 'jump' : 'fall';
      } else if (p.jumpHeld) action = 'crouch';
      else if (p.skid > 0) action = 'skid';
      else if (this.pulse && ['land', 'slideExit'].includes(this.pulse.name)) action = this.pulse.name;
      else if (Math.abs(p.vx) > 15) action = 'run';
      // Při přerušení komba navazujeme na aktuální mix, nikoli na začátek předchozího klipu.
      const changed = action !== this.action;
      if (changed) {
        // Rebase interrupted transitions from what is visible, not the old source clip.
        const from = this.layers(),
          previous = this.action;
        this.action = action;
        this.time = 0;
        this.phase = action === 'run' ? this.runPhase : 0;
        const duration = action === 'dash' ? .055 : action === 'slide' ? .085 : previous === 'slide' &&
          action === 'jump' ? .07 : action === 'hit' || action === 'dead' ? .035 : .065;
        this.blend = this.initialized ? {
          from,
          elapsed: 0,
          duration
        } : null;
      } else this.time += dt;
      const fps = action === 'run' ? Math.min(20, 10 + Math.abs(p.vx) / 45) : action === 'idle' ? 5 :
        action === 'wallGrip' ? 7 : action === 'double' ? 13 : action === 'dash' ? 24 : action ===
        'land' ? 28 : action === 'slideExit' ? 25 : 12;
      // Integrate phase: changing speed must never recompute the whole clip's elapsed phase.
      if (!changed) this.phase += dt * fps;
      if (action === 'run') this.runPhase = this.phase % 4;
      let frame = Math.floor(this.phase);
      if (action === 'crouch') frame = Math.min(3, 1 + Math.floor(this.time * 20));
      else if (action === 'slide') frame = frame < 3 ? frame : 2 + Math.floor(Math.max(0, this.time -
        .25) * 8) % 2;
      else frame = loops.has(action) ? frame % 4 : Math.min(3, frame);
      this.frame = clips[action] * 4 + Math.max(0, frame);
      const f = this.atlas?.frames[this.frame];
      if (f) {
        const socket = (f.headX ?? 0) * .38;
        this.headX = this.headX === null ? socket : this.headX + (socket - this.headX) * (1 - Math.exp(-
          dt / .035));
        const target = action === 'slide' ? 21 : f.bodyHeight * .38;
        this.height = this.height === null ? target : this.height + (target - this.height) * (1 - Math
          .exp(-dt / .035));
        // An actual low ceiling wins over visual smoothing, without moving the feet.
        this.height = Math.min(this.height, Math.max(1, maxHeight));
      }
      this.initialized = true;
    }
    // Snapshot pro trails; pozdější update() nesmí změnit již uložené vrstvy.
    pose() {
      return {
        frame: this.frame,
        action: this.action,
        height: this.height,
        headX: this.headX,
        layers: this.layers()
      };
    }
    /** ctx=CanvasRenderingContext2D; x=střed hráče, feet=Y chodidel v obrazovce,
     * face=+1/-1 (zrcadlení), alpha=průhlednost. false znamená, že PNG není připravené;
     * game.js pak použije původní procedurální kresbu. */
    draw(ctx, x, feet, face = 1, alpha = 1, pose = this.pose()) {
      if (!this.image || !this.image.complete || !this.image.naturalWidth || !this.atlas) return false;
      const layers = pose.layers || [{
        frame: pose.frame,
        action: pose.action,
        weight: 1
      }];
      const paint = (out, ox, oy, opacity = 1) => {
        for (const layer of layers) {
          const f = this.atlas.frames[layer.frame];
          if (!f) continue;
          const height = pose.height ?? (layer.action === 'slide' ? 21 : f.bodyHeight * .38),
            sy = height / f.bodyHeight;
          const dx = Math.max(-12, Math.min(12, (pose.headX ?? (f.headX ?? 0) * .38) - (f.headX ?? 0) *
            .38));
          out.globalAlpha = layer.weight * opacity;
          out.drawImage(this.image, f.x, f.y, f.w, f.h, ox + dx - f.anchorX * .38, oy - f.anchorY * sy,
            f.w * .38, f.h * sy);
        }
      };
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(Math.round(x), Math.round(feet));
      ctx.scale(face, 1);
      // Malý pomocný canvas skládá premultiplied alpha součtem; obyčejný dvojitý source-over by tmavl.
      if (layers.length > 1) {
        if (!this.scratch) {
          if (typeof OffscreenCanvas !== 'undefined') this.scratch = new OffscreenCanvas(160, 128);
          else if (typeof document !== 'undefined' && document.createElement) {
            this.scratch = document.createElement('canvas');
            this.scratch.width = 160;
            this.scratch.height = 128;
          }
        }
        if (this.scratch) {
          const out = this.scratch.getContext('2d');
          out.clearRect(0, 0, 160, 128);
          out.imageSmoothingEnabled = false;
          // Add premultiplied weighted pixels so cross-fades do not dim the character.
          out.globalCompositeOperation = 'lighter';
          paint(out, 80, 104);
          out.globalCompositeOperation = 'source-over';
          out.globalAlpha = 1;
          ctx.globalAlpha = alpha;
          ctx.drawImage(this.scratch, -80, -104);
        } else {
          paint(ctx, 0, 0, alpha);
        }
      } else {
        ctx.globalAlpha = alpha;
        const l = layers[0],
          f = l && this.atlas.frames[l.frame];
        if (f) {
          const sy = (pose.height ?? (l.action === 'slide' ? 21 : f.bodyHeight * .38)) / f.bodyHeight;
          const dx = Math.max(-12, Math.min(12, (pose.headX ?? (f.headX ?? 0) * .38) - (f.headX ?? 0) *
            .38));
          ctx.drawImage(this.image, f.x, f.y, f.w, f.h, dx - f.anchorX * .38, -f.anchorY * sy, f.w * .38,
            f.h * sy);
        }
      }
      ctx.restore();
      return true;
    }
  }
  if (typeof module !== 'undefined') module.exports = {
    NinjaAnimator,
    clips
  };
  else root.NinjaAnimator = NinjaAnimator;
})(typeof window !== 'undefined' ? window : globalThis);
