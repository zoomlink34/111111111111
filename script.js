const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com",
    projectId: "m-legacy-5cf2b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
const mover = document.getElementById('mover');
const viewport = document.getElementById('viewport');

const blockW = 60, blockH = 40;
const cols = 100, rows = 200; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.15, pX = 0, pY = 0, isDown = false, startX, startY, pixels = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 1; // কালো বর্ডার
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => { ctx.drawImage(img, p.x, p.y, blockW, blockH); };
        }
    });
}

function updateUI() { mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`; }

viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(scale * (e.deltaY > 0 ? 0.9 : 1.1), 0.05), 3);
    updateUI();
}, { passive: false });

viewport.onmousedown = (e) => { isDown = true; startX = e.clientX - pX; startY = e.clientY - pY; };
window.onmouseup = () => { isDown = false; };
window.onmousemove = (e) => { if (isDown) { pX = e.clientX - startX; pY = e.clientY - startY; updateUI(); } };

function copyVal(v) { navigator.clipboard.writeText(v).then(() => alert("Copied!")); }

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 20000 - Object.keys(pixels).length;
    render();
});
updateUI();
