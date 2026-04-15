/* ============================================================
   annà Victória Beatriz — Universe
   script.js
   ============================================================ */

/* ─────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx - 5 + 'px';
  cursor.style.top  = my - 5 + 'px';
});

function animateRing() {
  rx += (mx - rx - 16) * 0.12;
  ry += (my - ry - 16) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Cursor enlarge on interactive elements
document.querySelectorAll('a, button, .char-card, .gallery-item, .hidden-reveal').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform   = 'scale(2)';
    ring.style.transform     = 'scale(1.5)';
    ring.style.borderColor   = 'rgba(255,0,51,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform   = 'scale(1)';
    ring.style.transform     = 'scale(1)';
    ring.style.borderColor   = 'rgba(255,0,51,0.5)';
  });
});


/* ─────────────────────────────────────────
   2. SCROLL REVEAL
───────────────────────────────────────── */
const reveals  = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObs.observe(el));


/* ─────────────────────────────────────────
   3. HERO PARALLAX
───────────────────────────────────────── */
document.addEventListener('scroll', () => {
  const scrollY      = window.scrollY;
  const heroContent  = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    heroContent.style.opacity   = Math.max(0, 1 - scrollY / 600);
  }
});


/* ─────────────────────────────────────────
   4. TERMINAL ANIMATE ON SCROLL
───────────────────────────────────────── */
const termBody = document.getElementById('terminalBody');

if (termBody) {
  const termObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll('.terminal-line');
        lines.forEach((line, i) => {
          line.style.animationDelay = `${i * 0.15}s`;
          line.style.animation = `terminalType 0.6s ${i * 0.15}s forwards`;
        });
        termObs.unobserve(entry.target); // run once
      }
    });
  }, { threshold: 0.2 });

  termObs.observe(termBody);
}


/* ─────────────────────────────────────────
   5. JOIN / ACCESS FORM
───────────────────────────────────────── */
function submitJoin() {
  const name   = document.getElementById('joinName').value.trim();
  const handle = document.getElementById('joinHandle').value.trim();
  const reason = document.getElementById('joinReason').value.trim();

  if (!name || !handle || !reason) {
    alert('Complete all fields. Incomplete requests are automatically denied.');
    return;
  }

  // Glitch flash before revealing success
  const form = document.getElementById('joinForm');
  form.style.transition = 'opacity 0.4s';
  form.style.opacity = '0';

  setTimeout(() => {
    form.style.display = 'none';
    document.getElementById('joinSuccess').classList.add('active');
  }, 420);
}

// Expose globally for onclick attribute
window.submitJoin = submitJoin;


/* ─────────────────────────────────────────
   6. AMBIENT AUDIO (Web Audio API oscillator drone)
───────────────────────────────────────── */
const audioBtn  = document.getElementById('audioBtn');
const audioHint = document.getElementById('audioHint');
let audioCtx, gainNode, oscNodes = [], isPlaying = false;

function startAmbient() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 2);
  gainNode.connect(audioCtx.destination);

  // Four layered low drones
  const freqs = [40, 60, 80, 120];
  freqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type            = i % 2 === 0 ? 'sine' : 'triangle';
    g.gain.value        = 0.3 - i * 0.05;
    osc.connect(g);
    g.connect(gainNode);
    osc.start();
    oscNodes.push(osc);
  });
}

function stopAmbient() {
  if (!gainNode) return;
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
  setTimeout(() => {
    oscNodes.forEach(o => o.stop());
    oscNodes = [];
    audioCtx.close();
  }, 1600);
}

audioBtn.addEventListener('mouseenter', () => { audioHint.style.opacity = '1'; });
audioBtn.addEventListener('mouseleave', () => { audioHint.style.opacity = '0'; });

audioBtn.addEventListener('click', () => {
  if (!isPlaying) {
    startAmbient();
    audioBtn.textContent = '🔊';
    isPlaying = true;
  } else {
    stopAmbient();
    audioBtn.textContent = '🔇';
    isPlaying = false;
  }
});


/* ─────────────────────────────────────────
   7. EASTER EGG — Konami Code
   ↑ ↑ ↓ ↓ ← → ← → B A
───────────────────────────────────────── */
let keyBuffer = [];
const KONAMI  = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a'
];

document.addEventListener('keydown', e => {
  keyBuffer.push(e.key);
  keyBuffer = keyBuffer.slice(-10);
  if (keyBuffer.join(',') === KONAMI.join(',')) {
    showEasterEgg();
  }
});

function showEasterEgg() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(5,5,5,0.95);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    animation: fadeIn 0.5s forwards;
  `;
  overlay.innerHTML = `
    <div style="text-align:center; padding: 40px; border: 1px solid #ff0033; max-width: 500px;">
      <div style="font-size: 40px; margin-bottom: 24px;">🔴</div>
      <div style="font-size: 11px; letter-spacing: 4px; color: #ff0033; text-transform: uppercase; margin-bottom: 16px;">Secret Unlocked</div>
      <p style="font-size: 18px; font-weight: 300; color: #f5f0eb; line-height: 1.7; font-style: italic;">
        "The Archive exists.<br>You just need the right key."
      </p>
      <p style="margin-top: 24px; font-size: 12px; letter-spacing: 3px; color: #c9a84c;">— @anna_vtriz</p>
      <p style="margin-top: 32px; font-size: 9px; letter-spacing: 2px; color: #7a6a6a; text-transform: uppercase;">Click anywhere to close</p>
    </div>
  `;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}


/* ─────────────────────────────────────────
   8. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
───────────────────────────────────────── */
const sections = document.querySelectorAll('section[id], #video-bg');
const navLinks  = document.querySelectorAll('.nav-links a');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--white)'
          : 'var(--muted)';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => navObs.observe(sec));


/* ─────────────────────────────────────────
   9. SMOOTH SECTION ENTRANCE ON LOAD
───────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
});
