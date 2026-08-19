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

/* ---------- Entry screen (tap to open) ---------- */
const entryScreen = document.getElementById('entry-screen');
if (entryScreen) {
document.body.classList.add('entry-locked');
const openSite = () => {
entryScreen.classList.add('hidden');
document.body.classList.remove('entry-locked');
};
['click', 'touchend', 'pointerdown'].forEach(evt => {
entryScreen.addEventListener(evt, openSite, { passive: true });
document.addEventListener(evt, openSite, { capture: true, passive: true });
});
}

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
playRunScene();
}, 550);
});
});

/* ---------- "Running to you" scene: he runs in, they meet, they walk off
   together. Pure emoji + CSS -- no images or Bitmoji integration needed. ---------- */
function playRunScene() {
const scene = document.getElementById('run-scene');
if (!scene) return;
// Restart animations cleanly in case this ever runs more than once.
scene.classList.remove('met', 'walk-off');
void scene.offsetWidth; // force reflow so the animations restart
setTimeout(() => scene.classList.add('met'), 1300);
setTimeout(() => scene.classList.add('walk-off'), 1900);
}

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
