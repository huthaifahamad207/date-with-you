/* ---------- Ambient falling petals ---------- */
function spawnPetals(container, count) {
if (!container) return;
for (let i = 0; i < count; i++) {
const petal = document.createElement('div');
petal.className = 'petal';
petal.style.left = Math.random() * 100 + '%';
petal.style.animationDuration = (8 + Math.random() * 10) + 's';
petal.style.animationDelay = (Math.random() * 10) + 's';
petal.style.opacity = 0.3 + Math.random() * 0.4;
const size = 6 + Math.random() * 8;
petal.style.width = size + 'px';
petal.style.height = size + 'px';
container.appendChild(petal);
}
}
spawnPetals(document.querySelector('.petals'), 18);

/* ---------- Scroll reveals ---------- */
function initReveals() {
const items = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('in');
io.unobserve(entry.target);
}
});
}, { threshold: 0.15 });
items.forEach(item => io.observe(item));
}
initReveals();

/* ---------- Entry screen (tap to open) ----------
   The actual open/close + chase hand-off lives in the inline <script> at
   the top of index.html (it must run immediately, before this file has
   necessarily loaded, so the very first tap is never dropped, and so it
   can start the song on that same tap). This file only needs to lock
   scroll until that inline script unlocks it. ---------- */
document.body.classList.add('entry-locked');

/* ---------- Opening story: she runs, he chases, catches her, carts her
   off to the options screen. One continuous timeline, real photos, pure
   CSS transforms -- no sprite art or Bitmoji integration needed. ---------- */
window.__runChase = function () {
const intro = document.getElementById('story-intro');
const stage = document.getElementById('chase-stage');
const group = document.getElementById('chase-group');
const girl = document.getElementById('chase-girl');
const boy = document.getElementById('chase-boy');
const cart = document.getElementById('chase-cart');
const capTop = document.getElementById('chase-caption-top');
const capBottom = document.getElementById('chase-caption-bottom');
const site = document.getElementById('site');

if (!intro || !stage || !group || !girl || !boy) {
// No chase markup found -- fall back to just showing the site.
if (site) site.hidden = false;
return;
}

document.body.classList.add('entry-locked');
intro.hidden = false;
requestAnimationFrame(() => intro.classList.add('active'));

// Reset to a clean starting state in case this ever runs more than once.
stage.classList.remove('run', 'catch', 'cart', 'pull');
group.style.transform = '';
void stage.offsetWidth; // force reflow so animations restart clean

// t=0: she takes off running, he takes off after her.
stage.classList.add('run');

// t=1.6s: he catches up to her -- little surprised hop + heart pop.
setTimeout(() => {
stage.classList.add('catch');
if (capTop) capTop.textContent = 'got you!';
}, 1600);

// t=2.1s: he scoops her into the cart.
setTimeout(() => {
stage.classList.add('cart');
if (capBottom) capBottom.textContent = 'your chariot awaits…';
}, 2100);

// t=2.7s: he pulls the cart off toward the options.
setTimeout(() => {
stage.classList.add('pull');
}, 2700);

// t=3.9s: they've arrived -- fade the story out and reveal the site
// (which already has her waiting in a little cart above the options).
setTimeout(() => {
intro.classList.remove('active');
document.body.classList.remove('entry-locked');
setTimeout(() => {
intro.hidden = true;
if (site) site.hidden = false;
}, 550);
}, 3900);
};

// If the entry tap already happened before this script finished loading
// (slow connection), the inline script flagged it -- run the chase now.
if (window.__pendingChase) { window.__pendingChase = false; window.__runChase(); }

/* ---------- Decoy button: dodges like a shy "No" button ---------- */
const btnDecoy = document.getElementById('btn-decoy');
let decoyMoves = 0;
function dodgeDecoy() {
decoyMoves++;
if (btnDecoy.parentElement !== document.body) {
document.body.appendChild(btnDecoy);
}
const rect = btnDecoy.getBoundingClientRect();
const w = rect.width || 140;
const h = rect.height || 46;
const margin = 14;
const maxLeft = Math.max(margin, window.innerWidth - w - margin);
const maxTop = Math.max(margin, window.innerHeight - h - margin);
const minTop = Math.min(maxTop, window.innerHeight * 0.35);
const left = margin + Math.random() * (maxLeft - margin);
const top = minTop + Math.random() * Math.max(0, maxTop - minTop);
btnDecoy.style.position = 'fixed';
btnDecoy.style.zIndex = '50';
btnDecoy.style.left = left + 'px';
btnDecoy.style.top = top + 'px';
btnDecoy.style.margin = '0';
const phrases = ['nice try', 'nope, pick one', 'not an option', 'keep scrolling up', 'still no', "you know you want one"];
btnDecoy.textContent = phrases[Math.min(decoyMoves - 1, phrases.length - 1)];
}
if (btnDecoy) {
btnDecoy.addEventListener('mouseenter', dodgeDecoy);
btnDecoy.addEventListener('pointerenter', dodgeDecoy);
btnDecoy.addEventListener('pointerdown', (e) => { e.preventDefault(); dodgeDecoy(); });
btnDecoy.addEventListener('click', (e) => { e.preventDefault(); dodgeDecoy(); });
btnDecoy.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeDecoy(); }, { passive: false });
btnDecoy.addEventListener('focus', () => { dodgeDecoy(); btnDecoy.blur(); });
window.addEventListener('resize', () => { if (decoyMoves > 0) dodgeDecoy(); });
}

/* ---------- Idea cards: pick one ---------- */
const cards = Array.from(document.querySelectorAll('.idea-card'));
const celebration = document.getElementById('celebration');
const celebrationChoice = document.getElementById('celebration-choice');
const confettiLayer = document.getElementById('confetti-layer');
let chosen = false;

cards.forEach(card => {
card.addEventListener('click', () => {
if (chosen) return;
chosen = true;
const idea = card.getAttribute('data-idea') || card.textContent.trim();
const emoji = card.getAttribute('data-emoji') || '💕';
card.classList.add('selected');
cards.forEach(other => { if (other !== card) other.classList.add('fade-out'); });
if (btnDecoy) btnDecoy.style.display = 'none';

setTimeout(() => {
celebration.hidden = false;
document.body.style.overflow = 'hidden';
if (celebrationChoice) celebrationChoice.textContent = emoji + ' ' + idea;
burstConfetti();
notifyChoice(idea);
}, 550);
});
});

function burstConfetti() {
if (!confettiLayer) return;
const emojis = ['💗', '🩷', '❤️', '💕', '💖'];
for (let i = 0; i < 60; i++) {
const el = document.createElement('div');
el.className = 'confetto';
el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
el.style.left = Math.random() * 100 + '%';
el.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
el.style.animationDelay = (Math.random() * 1.2) + 's';
el.style.fontSize = (14 + Math.random() * 16) + 'px';
confettiLayer.appendChild(el);
}
}

/* ---------- Notify by email which date she picked ---------- */
function getDeviceType() {
const ua = navigator.userAgent || '';
if (/iPad/.test(ua)) return 'iPad';
if (/iPhone/.test(ua)) return 'iPhone';
if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'Android phone' : 'Android tablet';
if (/Windows/.test(ua)) return 'Windows PC';
if (/Macintosh/.test(ua)) return 'Mac';
if (/Linux/.test(ua)) return 'Linux PC';
return 'Unknown device';
}

function notifyChoice(idea) {
const payload = {
_subject: 'She picked a date: ' + idea,
choice: idea,
device: getDeviceType(),
userAgent: navigator.userAgent,
time: new Date().toString()
};
fetch('https://formsubmit.co/ajax/huthaifawbanihamad@gmail.com', {
method: 'POST',
headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
body: JSON.stringify(payload)
}).catch(() => {});
}

/* ---------- Song (APT.) ---------- */
const song = document.getElementById('song');
const musicToggle = document.getElementById('music-toggle');
let musicPausedByUser = false;

function updateMusicUI() {
if (!musicToggle || !song) return;
musicToggle.classList.toggle('playing', !song.paused);
if (!song.paused) musicToggle.classList.remove('needs-tap');
}

function tryStartMusic() {
if (!song || musicPausedByUser) return;
song.muted = false;
song.volume = 1;
const p = song.play();
if (p && p.catch) {
p.catch((err) => {
console.warn('Music autoplay was blocked, will retry on next tap:', err && err.message);
armFallbackRetry();
});
}
}

let fallbackArmed = false;
function armFallbackRetry() {
if (fallbackArmed || !song) return;
fallbackArmed = true;
if (musicToggle) musicToggle.classList.add('needs-tap');
const retry = () => {
if (!song.paused) return;
tryStartMusic();
};
['click', 'touchend', 'pointerdown'].forEach(evt => {
document.addEventListener(evt, retry, { passive: true });
});
}

if (song) {
song.addEventListener('play', updateMusicUI);
song.addEventListener('pause', updateMusicUI);
}

if (musicToggle) {
musicToggle.addEventListener('click', () => {
if (!song) return;
if (song.paused) {
musicPausedByUser = false;
tryStartMusic();
} else {
musicPausedByUser = true;
song.pause();
}
});
}

// Belt-and-suspenders: if the entry tap's play() call silently never
// actually started playback, arm the fallback retry too.
setTimeout(() => { if (song && song.paused) armFallbackRetry(); }, 1200);
