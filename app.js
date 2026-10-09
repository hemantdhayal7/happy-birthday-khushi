/**
 * Happy Birthday Khushi - Interactive Celebration Script
 * Features:
 * - Web Audio API Synthesizer (Happy Birthday Music Box & Sound Effects)
 * - Canvas Confetti & Floating Ambient Particle System
 * - Interactive 5-Candle Birthday Cake with Blow-out & Relight Mechanics
 * - Polaroid Gallery with Filtering & High-Res Lightbox Modal
 * - Interactive Balloon Popping Game with Secret Compliments
 * - Wax-Sealed Unfolding Birthday Letter
 * - Interactive 3D Gift Box
 */

// ==========================================
// 1. WEB AUDIO SYNTHESIZER (MUSIC & SFX)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.musicTimeout = null;
    this.currentNoteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single soft bell / music-box note
  playBellNote(freq, duration = 0.5, timeOffset = 0, volume = 0.15) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + timeOffset;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Warm music box combination: sine + slight triangle overtone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Happy Birthday Melody Notes & Beats
  getMelody() {
    // Note frequencies in Hz
    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
      D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
    };

    return [
      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.A4, dur: 0.7,  pause: 0.8 },
      { note: notes.G4, dur: 0.7,  pause: 0.8 },
      { note: notes.C5, dur: 0.7,  pause: 0.8 },
      { note: notes.B4, dur: 1.2,  pause: 1.3 },

      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.A4, dur: 0.7,  pause: 0.8 },
      { note: notes.G4, dur: 0.7,  pause: 0.8 },
      { note: notes.D5, dur: 0.7,  pause: 0.8 },
      { note: notes.C5, dur: 1.2,  pause: 1.3 },

      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.G4, dur: 0.35, pause: 0.4 },
      { note: notes.G5, dur: 0.7,  pause: 0.8 },
      { note: notes.E5, dur: 0.7,  pause: 0.8 },
      { note: notes.C5, dur: 0.7,  pause: 0.8 },
      { note: notes.B4, dur: 0.7,  pause: 0.8 },
      { note: notes.A4, dur: 1.2,  pause: 1.3 },

      { note: notes.F5, dur: 0.35, pause: 0.4 },
      { note: notes.F5, dur: 0.35, pause: 0.4 },
      { note: notes.E5, dur: 0.7,  pause: 0.8 },
      { note: notes.C5, dur: 0.7,  pause: 0.8 },
      { note: notes.D5, dur: 0.7,  pause: 0.8 },
      { note: notes.C5, dur: 1.5,  pause: 1.8 }
    ];
  }

  toggleMusic(onUpdateState) {
    this.init();
    if (this.isPlayingMusic) {
      this.stopMusic();
      if (onUpdateState) onUpdateState(false);
    } else {
      this.startMusic();
      if (onUpdateState) onUpdateState(true);
    }
  }

  startMusic() {
    this.isPlayingMusic = true;
    this.currentNoteIndex = 0;
    this.playNextMusicNote();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  playNextMusicNote() {
    if (!this.isPlayingMusic) return;
    const melody = this.getMelody();
    const item = melody[this.currentNoteIndex];

    this.playBellNote(item.note, item.dur, 0, 0.2);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
    this.musicTimeout = setTimeout(() => {
      this.playNextMusicNote();
    }, item.pause * 1000);
  }

  // Sound Effect: Candle Extinguished (gentle puff)
  playExtinguishSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Pink noise buffer for puff of air
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Sound Effect: Balloon Pop (crisp snap & resonance)
  playPopSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Sound Effect: Magical Fanfare (Chimes for celebration & gift open)
  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    chord.forEach((freq, idx) => {
      this.playBellNote(freq, 0.8, idx * 0.1, 0.25);
    });
  }
}

const sounds = new SoundEngine();

// ==========================================
// 2. AMBIENT PARTICLES & CONFETTI ENGINE
// ==========================================
class ParticleSystem {
  constructor() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.ambientCtx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;
    this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;

    this.ambientParticles = [];
    this.confettiParticles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.initAmbient();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.ambientCanvas) {
      this.ambientCanvas.width = this.width;
      this.ambientCanvas.height = this.height;
    }
    if (this.confettiCanvas) {
      this.confettiCanvas.width = this.width;
      this.confettiCanvas.height = this.height;
    }
  }

  initAmbient() {
    const count = Math.min(30, Math.floor(this.width / 40));
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 4 + 2,
        speedY: Math.random() * 0.4 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.2,
        color: ['#e84a6f', '#ffd1dc', '#f5af19', '#c77dff'][Math.floor(Math.random() * 4)],
        type: Math.random() > 0.6 ? 'heart' : 'circle'
      });
    }
  }

  addConfettiBurst(originX = this.width / 2, originY = this.height / 2, count = 90) {
    const colors = ['#e84a6f', '#ff7597', '#f5af19', '#9b5de5', '#00b4d8', '#ffd166', '#06d6a0'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        gravity: 0.28,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 9 + 5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 1. Draw Ambient Particles
    if (this.ambientCtx) {
      this.ambientCtx.clearRect(0, 0, this.width, this.height);
      this.ambientParticles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -20) p.y = this.height + 20;
        if (p.x < -20) p.x = this.width + 20;
        if (p.x > this.width + 20) p.x = -20;

        this.ambientCtx.save();
        this.ambientCtx.globalAlpha = p.opacity;
        this.ambientCtx.fillStyle = p.color;

        if (p.type === 'circle') {
          this.ambientCtx.beginPath();
          this.ambientCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ambientCtx.fill();
        } else {
          // Draw tiny heart
          const s = p.size;
          this.ambientCtx.translate(p.x, p.y);
          this.ambientCtx.beginPath();
          this.ambientCtx.moveTo(0, 0);
          this.ambientCtx.bezierCurveTo(-s, -s, -s * 2, s / 3, 0, s * 1.5);
          this.ambientCtx.bezierCurveTo(s * 2, s / 3, s, -s, 0, 0);
          this.ambientCtx.fill();
        }
        this.ambientCtx.restore();
      });
    }

    // 2. Draw Confetti
    if (this.confettiCtx) {
      this.confettiCtx.clearRect(0, 0, this.width, this.height);
      for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
        const c = this.confettiParticles[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.vx *= 0.98;
        c.rotation += c.rotSpeed;
        c.life -= 0.008;
        c.opacity = Math.max(0, c.life);

        if (c.y > this.height + 50 || c.life <= 0) {
          this.confettiParticles.splice(i, 1);
          continue;
        }

        this.confettiCtx.save();
        this.confettiCtx.translate(c.x, c.y);
        this.confettiCtx.rotate((c.rotation * Math.PI) / 180);
        this.confettiCtx.globalAlpha = c.opacity;
        this.confettiCtx.fillStyle = c.color;
        this.confettiCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        this.confettiCtx.restore();
      }
    }
  }
}

let particles;

// ==========================================
// 3. INTERACTIVE BIRTHDAY CAKE & WISH
// ==========================================
function setupCake() {
  const candles = document.querySelectorAll('.candle');
  const blowBtn = document.getElementById('blow-candles-btn');
  const blowBtnText = document.getElementById('blow-btn-text');
  const relightBtn = document.getElementById('relight-btn');
  const cakeGlow = document.getElementById('cake-glow');
  const wishCard = document.getElementById('wish-success-card');

  let extinguishedCount = 0;

  function extinguishCandle(candle) {
    const flame = candle.querySelector('.flame');
    const smoke = candle.querySelector('.smoke');
    if (!flame || flame.classList.contains('extinguished')) return;

    flame.classList.add('extinguished');
    sounds.playExtinguishSound();

    if (smoke) {
      smoke.classList.add('active');
      setTimeout(() => smoke.classList.remove('active'), 1600);
    }

    extinguishedCount++;
    checkAllCandles();
  }

  function checkAllCandles() {
    if (extinguishedCount >= candles.length) {
      if (cakeGlow) cakeGlow.classList.add('off');
      if (wishCard) wishCard.classList.remove('hidden');
      if (blowBtn) blowBtn.style.display = 'none';

      // Celebration burst & fanfare
      sounds.playFanfare();
      const cakeRect = document.getElementById('cake-container').getBoundingClientRect();
      particles.addConfettiBurst(cakeRect.left + cakeRect.width / 2, cakeRect.top + 40, 140);
      setTimeout(() => {
        particles.addConfettiBurst(window.innerWidth * 0.3, window.innerHeight * 0.4, 90);
        particles.addConfettiBurst(window.innerWidth * 0.7, window.innerHeight * 0.4, 90);
      }, 350);
    }
  }

  // Click individual candles
  candles.forEach(c => {
    c.addEventListener('click', () => {
      extinguishCandle(c);
    });
  });

  // Blow button click
  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      candles.forEach((c, idx) => {
        setTimeout(() => extinguishCandle(c), idx * 120);
      });
    });
  }

  // Relight Candles
  if (relightBtn) {
    relightBtn.addEventListener('click', () => {
      candles.forEach(c => {
        const flame = c.querySelector('.flame');
        if (flame) flame.classList.remove('extinguished');
      });
      extinguishedCount = 0;
      if (cakeGlow) cakeGlow.classList.remove('off');
      if (wishCard) wishCard.classList.add('hidden');
      if (blowBtn) blowBtn.style.display = 'inline-flex';
      sounds.playBellNote(659.25, 0.4, 0, 0.2);
    });
  }
}

// ==========================================
// 4. MEMORY LANE GALLERY & LIGHTBOX
// ==========================================
const galleryData = [
  {
    src: 'IMG20201114144847.jpg',
    title: 'Where It All Began (2020)',
    desc: 'That gentle, innocent smile that could brighten even the cloudiest day. Pure warmth from the very beginning.',
    year: '2020',
    category: 'candid'
  },
  {
    src: 'IMG20221208210044.jpg',
    title: 'Chic Grace & Elegance (2022)',
    desc: 'Pairing that grey evening gown with denim jacket—effortless confidence and pure charm.',
    year: '2022',
    category: 'festive'
  },
  {
    src: 'IMG20230126081644.jpg',
    title: 'Desi Tradition & Pride (2023)',
    desc: 'Republic Day morning in a traditional saree. Regal, graceful, and festive.',
    year: '2023',
    category: 'festive'
  },
  {
    src: 'IMG20230313174958.jpg',
    title: 'Royal Blue & Victory Vibe (2023)',
    desc: 'The iconic navy saree, the cheerful victory sign, and endless positive energy.',
    year: '2023',
    category: 'festive'
  },
  {
    src: 'IMG20240310035205.jpg',
    title: 'Midnight Peace & Faith (2024)',
    desc: 'Under the peaceful night sky during the sacred yatra. Eyes filled with quiet serenity and hope.',
    year: '2024',
    category: 'cherished'
  },
  {
    src: 'IMG20240614133117.jpg',
    title: 'Cozy Laughs & Home Warmth (2024)',
    desc: 'Sharing smiles and late-night talks over the laptop. The heartwarming comfort of true togetherness.',
    year: '2024',
    category: 'candid'
  },
  {
    src: 'IMG20240819134805.jpg',
    title: 'Modern Poise & Flair (2024)',
    desc: 'A gorgeous portrait captured in style. Naturally photogenic and effortlessly graceful.',
    year: '2024',
    category: 'candid'
  },
  {
    src: 'IMG20241022070253.jpg',
    title: 'Favorite Road Trips & Laughter (2024)',
    desc: 'The fun-filled drives with Hemant! Endless laughs, silly conversations, and one of our favorite memories.',
    year: '2024',
    category: 'cherished'
  },
  {
    src: 'IMG20241211193643-COLLAGE.jpg',
    title: 'Campus Stories & Milestones (2024)',
    desc: 'College memories, NFSU days, friendships, and milestones stitched into a collage of life.',
    year: '2024',
    category: 'cherished'
  },
  {
    src: 'IMG20250201153842.jpg',
    title: 'Golden Haldi Glow (2025)',
    desc: 'Glowing radiantly in traditional yellow! A celebration of warmth, smiles, and festive light.',
    year: '2025',
    category: 'festive'
  },
  {
    src: 'IMG20250721182749.jpg',
    title: 'Sweet Summer Garden Breeze (2025)',
    desc: 'Pink stripes, glasses on point, and nature providing the backdrop to that sweet, gentle smile.',
    year: '2025',
    category: 'candid'
  },
  {
    src: 'IMG20250816132008.jpg',
    title: 'Breathtaking Horizons Ahead (2025)',
    desc: 'Fresh hillside air, scenic views, and looking out toward an exciting new chapter with bright dreams.',
    year: '2025',
    category: 'cherished'
  }
];

let activeLightboxIndex = 0;

function setupGallery() {
  const cards = document.querySelectorAll('.polaroid-card');
  const filterBtns = document.querySelectorAll('.filter-chip');
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const modalCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const backdrop = document.getElementById('lightbox-backdrop');

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox Open
  function openLightbox(index) {
    activeLightboxIndex = index;
    const item = galleryData[index];
    if (!item) return;

    modalImg.src = item.src;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalCounter.textContent = `${index + 1} / ${galleryData.length}`;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext() {
    activeLightboxIndex = (activeLightboxIndex + 1) % galleryData.length;
    openLightbox(activeLightboxIndex);
  }

  function showPrev() {
    activeLightboxIndex = (activeLightboxIndex - 1 + galleryData.length) % galleryData.length;
    openLightbox(activeLightboxIndex);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      openLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

// ==========================================
// 5. BALLOON POP GAME
// ==========================================
function setupBalloons() {
  const balloons = document.querySelectorAll('.balloon-item');
  const countSpan = document.getElementById('popped-count');
  const notesList = document.getElementById('notes-list');
  const resetBtn = document.getElementById('reset-balloons-btn');
  let poppedCount = 0;

  balloons.forEach((b, idx) => {
    b.addEventListener('click', (e) => {
      if (b.classList.contains('popped')) return;

      b.classList.add('popped');
      poppedCount++;
      countSpan.textContent = poppedCount;

      sounds.playPopSound();

      // Confetti burst right at balloon coordinates
      const rect = b.getBoundingClientRect();
      particles.addConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

      // Remove hint if present
      const hint = notesList.querySelector('.empty-notes-hint');
      if (hint) hint.remove();

      // Add revealed note
      const noteText = b.getAttribute('data-note');
      const noteCard = document.createElement('div');
      noteCard.className = 'revealed-note-card';
      noteCard.innerHTML = `
        <span class="note-icon">💌</span>
        <span class="note-text">${noteText}</span>
      `;
      notesList.prepend(noteCard);

      // If all popped
      if (poppedCount === balloons.length) {
        setTimeout(() => {
          sounds.playFanfare();
          particles.addConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
        }, 300);
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      balloons.forEach(b => b.classList.remove('popped'));
      poppedCount = 0;
      countSpan.textContent = '0';
      notesList.innerHTML = '<p class="empty-notes-hint">Tap any floating balloon above to pop it and reveal your secret note!</p>';
      sounds.playBellNote(523.25, 0.3, 0, 0.2);
    });
  }
}

// ==========================================
// 6. ENVELOPE & LETTER UNFOLDING
// ==========================================
function setupLetter() {
  const envelope = document.getElementById('envelope');
  const openBtn = document.getElementById('open-envelope-btn');
  const waxSeal = document.getElementById('wax-seal');

  function toggleLetter() {
    envelope.classList.toggle('open');
    if (envelope.classList.contains('open')) {
      sounds.playBellNote(659.25, 0.5, 0, 0.2);
      sounds.playBellNote(783.99, 0.5, 0.1, 0.2);
      openBtn.innerHTML = '<span>✉️ Fold Letter Back</span>';
      particles.addConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.6, 60);
    } else {
      openBtn.innerHTML = '<span>✉️ Click to Open Letter</span>';
    }
  }

  if (openBtn) openBtn.addEventListener('click', toggleLetter);
  if (waxSeal) waxSeal.addEventListener('click', toggleLetter);
}

// ==========================================
// 7. SURPRISE GIFT BOX
// ==========================================
function setupGiftBox() {
  const box = document.getElementById('gift-box');
  const giftMsg = document.getElementById('gift-message');
  const closeBtn = document.getElementById('reclose-gift-btn');

  function openGift() {
    if (box.classList.contains('opened')) return;
    box.classList.add('opened');
    sounds.playFanfare();

    const rect = box.getBoundingClientRect();
    particles.addConfettiBurst(rect.left + rect.width / 2, rect.top, 120);

    setTimeout(() => {
      giftMsg.classList.remove('hidden');
    }, 400);
  }

  function closeGift() {
    box.classList.remove('opened');
    giftMsg.classList.add('hidden');
  }

  if (box) box.addEventListener('click', openGift);
  if (closeBtn) closeBtn.addEventListener('click', closeGift);
}

// ==========================================
// 8. FLOATING CONTROLS & INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize particles
  particles = new ParticleSystem();

  // Setup interactive components
  setupCake();
  setupGallery();
  setupBalloons();
  setupLetter();
  setupGiftBox();

  // Music toggle button
  const musicBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      sounds.toggleMusic((isPlaying) => {
        if (isPlaying) {
          musicBtn.classList.add('playing');
          musicIcon.textContent = '⏸️';
        } else {
          musicBtn.classList.remove('playing');
          musicIcon.textContent = '🎵';
        }
      });
    });
  }

  // Confetti burst button
  const confettiBtn = document.getElementById('confetti-burst-btn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      sounds.playBellNote(880, 0.3, 0, 0.2);
      particles.addConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.4, 110);
    });
  }
});
