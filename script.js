// Dados das Roletas
const wheelsData = {
    prizes: {
        title: "Prêmios",
        colorScheme: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
        items: [
            { title: "Teve 3 notas 10 no boletim", reward: "10 booster do ano", icon: "fa-graduation-cap" },
            { title: "Amigo mais velho parou de jogar", reward: "2 UR do ano", icon: "fa-user-clock" },
            { title: "Ganhou aposta do colega", reward: "2 SR do ano", icon: "fa-handshake" },
            { title: "Presente da avó!!!", reward: "1 starter deck do ano (apenas 1 por ano)", icon: "fa-gift" }
        ]
    },
    accidents: {
        title: "Acidentes",
        colorScheme: ["#ef4444", "#f97316", "#dc2626", "#b91c1c"],
        items: [
            { title: "Mãe assistiu Gilberto Barros", reward: "Perca uma UR", icon: "fa-tv" },
            { title: "Colega roubou sua carta", reward: "Perca uma SR", icon: "fa-mask" },
            { title: "Proposta do primo mais velho", reward: "Perca uma UR; ganhe uma SR", icon: "fa-comments" },
            { title: "Ficou de castigo!", reward: "Substitua 10 cartas do último deck que usou (mín. 1 UR e 2 SR)", icon: "fa-triangle-exclamation" }
        ]
    }
};

// Estado das Roletas
const state = {
    prizes: { angle: 0, isSpinning: false, canvas: null, ctx: null },
    accidents: { angle: 0, isSpinning: false, canvas: null, ctx: null }
};

const jsConfetti = new JSConfetti();

// Inicialização
window.onload = () => {
    initWheel('prizes');
    initWheel('accidents');
    populateLists();
};

// Áudio Sintético (Sem arquivos externos para garantir funcionamento em qualquer lugar)
function playTickSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    } catch(e) {}
}

function playWinSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
    } catch(e) {}
}

function playLossSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [300, 260, 220, 150];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.12);
            osc.stop(ctx.currentTime + idx * 0.12 + 0.2);
        });
    } catch(e) {}
}

// Configuração da Canvas e Renderização
function initWheel(key) {
    const canvas = document.getElementById(`canvas-${key}`);
    const ctx = canvas.getContext('2d');
    state[key].canvas = canvas;
    state[key].ctx = ctx;

    // Ajuste para telas retina/high-DPI
    const dpr = window.devicePixelRatio || 1;
    const size = 380;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    drawWheel(key);
}

function drawWheel(key) {
    const { ctx, angle } = state[key];
    const data = wheelsData[key];
    const items = data.items;
    const totalSlices = items.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;
    const center = 190;
    const radius = 175;

    ctx.clearRect(0, 0, 380, 380);

    // Borda Externa Gloriosa
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = key === 'prizes' ? '#d97706' : '#9f1239';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Desenho de cada fatia
    for (let i = 0; i < totalSlices; i++) {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Fatia
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius - 4, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = data.colorScheme[i % data.colorScheme.length];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Texto e Conteúdo
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;

        // Truncar texto para caber no setor se necessário
        let text = items[i].title;
        if (text.length > 22) text = text.substring(0, 20) + '...';
        
        ctx.fillText(text, radius - 25, 4);
        ctx.restore();
    }

    // Centro da Roleta (Miolo)
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = key === 'prizes' ? '#fbbf24' : '#f43f5e';
    ctx.stroke();

    // Ícone central
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Font Awesome 6 Free"';
    ctx.fontWeight = '900';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iconUnicode = key === 'prizes' ? '\uf091' : '\uf714'; // Trophy ou Skull
    ctx.fillText(iconUnicode, center, center);
}

// Lógica de Giro
function spinWheel(key) {
    if (state[key].isSpinning) return;

    state[key].isSpinning = true;
    document.getElementById(`btn-spin-${key}`).disabled = true;
    document.getElementById(`btn-spin-${key}`).classList.add('opacity-50', 'cursor-not-allowed');

    const items = wheelsData[key].items;
    const sliceAngle = (2 * Math.PI) / items.length;

    // Define rotação total (pelo menos 5 giros completos + offset aleatório)
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    const randomTargetIndex = Math.floor(Math.random() * items.length);
    
    // O ponteiro fica no topo (-Math.PI / 2). Calculamos o ângulo final para alinhar o item escolhido no topo.
    const targetSliceMiddle = (randomTargetIndex * sliceAngle) + (sliceAngle / 2);
    const targetAngle = (3 * Math.PI / 2) - targetSliceMiddle + (extraRotations * 2 * Math.PI);

    const startAngle = state[key].angle % (2 * Math.PI);
    const totalDelta = targetAngle - startAngle;
    
    const duration = 4500; // Duração em ms
    const startTime = performance.now();
    let lastSectorIndex = -1;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing out cubic para desaceleração realista
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        state[key].angle = startAngle + totalDelta * easeOut;
        drawWheel(key);

        // Efeito sonoro a cada fatia percorrida
        const normalizedAngle = (2 * Math.PI - (state[key].angle % (2 * Math.PI))) % (2 * Math.PI);
        const currentSector = Math.floor((normalizedAngle + Math.PI / 2) % (2 * Math.PI) / sliceAngle);
        
        if (currentSector !== lastSectorIndex) {
            playTickSound();
            lastSectorIndex = currentSector;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            state[key].isSpinning = false;
            document.getElementById(`btn-spin-${key}`).disabled = false;
            document.getElementById(`btn-spin-${key}`).classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Finalizado - Mostra resultado
            showResult(key, items[randomTargetIndex]);
        }
    }

    requestAnimationFrame(animate);
}

// Exibição do Modal de Resultado
function showResult(type, item) {
    const modal = document.getElementById('result-modal');
    const card = document.getElementById('modal-card');
    const category = document.getElementById('modal-category');
    const title = document.getElementById('modal-title');
    const reward = document.getElementById('modal-reward');
    const iconContainer = document.getElementById('modal-icon-container');
    const icon = document.getElementById('modal-icon');
    const glow = document.getElementById('modal-glow');

    category.innerText = type === 'prizes' ? 'Prêmio Sorteado!' : 'Acidente Aconteceu!';
    title.innerText = item.title;
    reward.innerText = item.reward;

    // Estilização condicional do Modal
    if (type === 'prizes') {
        iconContainer.className = "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30";
        icon.className = `fa-solid ${item.icon}`;
        reward.className = "text-lg font-bold text-amber-400";
        glow.className = "absolute -top-24 -left-24 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl pointer-events-none";
        
        // Confete e som de vitória
        jsConfetti.addConfetti({
            emojis: ['⚡', '✨', '🎴', '🎁'],
            confettiNumber: 60,
        });
        playWinSound();

    } else {
        iconContainer.className = "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30";
        icon.className = `fa-solid ${item.icon}`;
        reward.className = "text-lg font-bold text-rose-400";
        glow.className = "absolute -top-24 -left-24 w-48 h-48 bg-rose-500/30 rounded-full blur-3xl pointer-events-none";
        
        playLossSound();
    }

    // Exibe modal com transição
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('result-modal');
    const card = document.getElementById('modal-card');

    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Preenche as listas de descrição abaixo das roletas
function populateLists() {
    ['prizes', 'accidents'].forEach(type => {
        const ul = document.getElementById(`list-${type}`);
        ul.innerHTML = '';
        wheelsData[type].items.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/80";
            li.innerHTML = `
                <i class="fa-solid ${item.icon} ${type === 'prizes' ? 'text-amber-400' : 'text-rose-400'} mt-1"></i>
                <div>
                    <span class="font-semibold text-slate-200">${item.title}</span>
                    <span class="block text-xs ${type === 'prizes' ? 'text-amber-300' : 'text-rose-300'} font-medium">↳ ${item.reward}</span>
                </div>
            `;
            ul.appendChild(li);
        });
    });
}

// Alternância de Abas para Visualização
function switchTab(mode) {
    const prizesSec = document.getElementById('section-prizes');
    const accidentsSec = document.getElementById('section-accidents');
    
    const btnAll = document.getElementById('tab-all');
    const btnPrizes = document.getElementById('tab-prizes');
    const btnAccidents = document.getElementById('tab-accidents');

    // Reset botão styles
    [btnAll, btnPrizes, btnAccidents].forEach(btn => {
        btn.className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-slate-400 hover:text-white";
    });

    if (mode === 'all') {
        btnAll.className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-amber-500 text-slate-950 shadow-md";
        prizesSec.classList.remove('hidden');
        accidentsSec.classList.remove('hidden');
    } else if (mode === 'prizes') {
        btnPrizes.className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-amber-500 text-slate-950 shadow-md";
        prizesSec.classList.remove('hidden');
        accidentsSec.classList.add('hidden');
    } else if (mode === 'accidents') {
        btnAccidents.className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-rose-600 text-white shadow-md";
        prizesSec.classList.add('hidden');
        accidentsSec.classList.remove('hidden');
    }
}
