window.onerror = function(msg, url, lineNo, columnNo, error) {
    const consoleEl = document.getElementById('log-console');
    if (consoleEl) {
        const div = document.createElement('div');
        div.className = "log error";
        div.innerText = "JS ERROR: " + msg + " (Line: " + lineNo + ")";
        consoleEl.appendChild(div);
    }
    return false;
};

// Platform Radio Buttons
const radios = document.querySelectorAll('input[name="platform"]');
const root = document.documentElement;
let currentPlatform = 'Steam';

radios.forEach(r => {
    r.addEventListener('change', (e) => {
        if(e.target.value === 'Steam') {
            currentPlatform = 'Steam';
            root.style.setProperty('--theme-color', 'var(--steam-color)');
            root.style.setProperty('--theme-glow', 'rgba(0, 229, 255, 0.4)');
            root.style.setProperty('--theme-bg', 'rgba(0, 229, 255, 0.05)');
        } else {
            currentPlatform = 'Valorant';
            root.style.setProperty('--theme-color', 'var(--val-color)');
            root.style.setProperty('--theme-glow', 'rgba(255, 0, 85, 0.4)');
            root.style.setProperty('--theme-bg', 'rgba(255, 0, 85, 0.05)');
        }
    });
});

// Side Navigation
const navBtns = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.getAttribute('data-target');
        views.forEach(view => {
            if(view.id === targetId) {
                view.classList.remove('hidden');
                view.classList.add('active-view');
            } else {
                view.classList.remove('active-view');
                view.classList.add('hidden');
            }
        });
    });
});

// Slider
const threadSlider = document.getElementById('thread-slider');
const threadVal = document.getElementById('thread-val');
threadSlider.addEventListener('input', (e) => {
    threadVal.innerText = e.target.value;
});

// Supabase Configuration
const SUPABASE_URL = 'https://oqwjbosqaryhqkvofcfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2pib3NxYXJ5aHFrdm9mY2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjU1NTQsImV4cCI6MjEwMTI0MTU1NH0.KC2Ah7SsSOyVqS3RiZloD8qV_2xGRSanStCvYEUnUlM';
let db = null;
try {
    if (window.supabase) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase CDN yuklenemedi!");
    }
} catch(e) {
    console.error("Supabase init hatasi:", e);
}

// Stats
let stats = {
    total: 0,
    hits: 0,
    banned: 0,
    errors: 0,
    cpm: 0,
    remaining: 0
};
let hitsList = [];
let lastPingTime = 0;

// File Loaders
let comboContent = "";
let proxyContent = "";

const btnCombo = document.getElementById('btn-combo');
if (btnCombo) {
    btnCombo.addEventListener('click', () => {
        const fileCombo = document.getElementById('file-combo');
        if (fileCombo) fileCombo.click();
    });
}

const fileCombo = document.getElementById('file-combo');
if (fileCombo) {
    fileCombo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) {
        document.getElementById('lbl-combo').innerText = file.name;
        document.getElementById('lbl-combo').style.color = "var(--theme-color)";
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            comboContent = ev.target.result;
        };
        reader.readAsText(file);
    }
    });
}

const btnProxy = document.getElementById('btn-proxy');
if (btnProxy) {
    btnProxy.addEventListener('click', () => {
        const fp = document.getElementById('file-proxy');
        if (fp) fp.click();
    });
}

const fileProxy = document.getElementById('file-proxy');
if (fileProxy) {
    fileProxy.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) {
        document.getElementById('lbl-proxy').innerText = file.name;
        document.getElementById('lbl-proxy').style.color = "var(--theme-color)";
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            proxyContent = ev.target.result;
        };
        reader.readAsText(file);
    }
    });
}

// Actions
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');

const hitsModal = document.getElementById('hits-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const cardValidHits = document.getElementById('card-valid-hits');
const hitsListContainer = document.getElementById('hits-list-container');

if (cardValidHits && hitsModal && btnCloseModal) {
    cardValidHits.addEventListener('click', () => {
        hitsModal.classList.add('active');
        
        // Populate the list
        hitsListContainer.innerHTML = '';
        if (hitsList.length === 0) {
            hitsListContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px;">No hits captured yet.</div>';
        } else {
            hitsList.forEach(hit => {
                const div = document.createElement('div');
                div.className = 'hit-item';
                div.innerHTML = `<span>${hit}</span><span style="font-size:10px; opacity:0.6;">✓ VALID</span>`;
                hitsListContainer.appendChild(div);
            });
        }
    });
    
    btnCloseModal.addEventListener('click', () => {
        hitsModal.classList.remove('active');
    });
    
    // Close on outside click
    hitsModal.addEventListener('click', (e) => {
        if (e.target === hitsModal) hitsModal.classList.remove('active');
    });
}

const btnDownloadHits = document.getElementById('btn-download-hits');
if (btnDownloadHits) {
    btnDownloadHits.addEventListener('mouseover', () => { btnDownloadHits.style.transform = 'scale(1.2)'; });
    btnDownloadHits.addEventListener('mouseout', () => { btnDownloadHits.style.transform = 'scale(1)'; });
    btnDownloadHits.addEventListener('click', () => {
        if (hitsList.length === 0) {
            add_log("No hits to download yet!", "warning");
            return;
        }
        const text = hitsList.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Athena_Hits_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        add_log(`Downloaded ${hitsList.length} hits!`, "success");
    });
}

btnStart.addEventListener('click', async () => {
    if (!db) {
        add_log("Error: Supabase is not loaded! Try disabling AdBlocker.", "error");
        return;
    }
    if (!comboContent) {
        add_log("Error: No combo file selected!", "error");
        return;
    }

    const threads = threadSlider.value;
    const capture = document.getElementById('chk-capture').checked;
    const useProxy = document.getElementById('chk-proxy').checked;
    const toggleNopecha = document.getElementById('toggle-nopecha') ? document.getElementById('toggle-nopecha').checked : true;
    const nopechaKey = (toggleNopecha && document.getElementById('nopecha-key')) ? document.getElementById('nopecha-key').value.trim() : "";
    const toggleZenrows = document.getElementById('toggle-zenrows') ? document.getElementById('toggle-zenrows').checked : false;
    const zenrowsKey = (toggleZenrows && document.getElementById('zenrows-key')) ? document.getElementById('zenrows-key').value.trim() : "";
    
    btnStart.style.display = 'none';
    btnStop.disabled = false;
    
    // Reset Stats
    stats = { total: 0, hits: 0, banned: 0, errors: 0, cpm: 0, remaining: 0 };
    hitsList = [];
    ['total', 'hits', 'banned', 'errors', 'cpm', 'remaining'].forEach(s => update_stats(s, 0));
    document.getElementById('log-console').innerHTML = '';
    
    add_log("Sending scan command to Engine...", "info");

    const { data, error } = await db
        .from('tasks')
        .insert([
            { 
                command: 'start_scan', 
                status: 'pending',
                combo_data: JSON.stringify({ 
                    threads, 
                    capture, 
                    proxy: useProxy, 
                    platform: currentPlatform,
                    combo: comboContent,
                    proxies: proxyContent,
                    nopecha_key: nopechaKey,
                    zenrows_key: zenrowsKey
                })
            }
        ]);
        
    if(error) {
        add_log("Error starting scan: " + error.message, "error");
        btnStart.style.display = 'flex';
        btnStop.disabled = true;
    } else {
        add_log("Command sent! Awaiting Engine response...", "success");
    }
});

btnStop.addEventListener('click', async () => {
    if (!db) return;
    btnStart.style.display = 'flex';
    btnStop.disabled = true;
    
    await db
        .from('tasks')
        .insert([
            { command: 'stop_scan', status: 'pending' }
        ]);
        
    add_log("Stop command sent to Engine...", "warning");
});

// Hit Explosion & Streak Logic
let hitStreak = 0;
let streakTimer = null;

function spawnHitExplosion(rect) {
    const container = document.getElementById('particle-container');
    const colors = ['#FFF', 'var(--theme-color)', '#FFD700'];
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'hit-particle';
        const size = Math.random() * 6 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.color = colors[Math.floor(Math.random() * colors.length)];
        p.style.background = 'currentColor';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 150;
        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
        
        container.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

function showStreak(comboCount) {
    const container = document.getElementById('streak-container');
    container.innerHTML = '';
    
    let text = "STRIKE!";
    if (comboCount >= 3) text = "RAMPAGE!";
    if (comboCount >= 5) text = "UNSTOPPABLE!";
    if (comboCount >= 10) text = "GODLIKE!";
    
    const h1 = document.createElement('div');
    h1.className = 'streak-text';
    h1.innerText = text;
    
    const h2 = document.createElement('div');
    h2.className = 'streak-combo';
    h2.innerText = `COMBO x${comboCount}`;
    
    container.appendChild(h1);
    container.appendChild(h2);
    
    setTimeout(() => {
        if(container.innerHTML.includes(text)) {
            container.innerHTML = '';
        }
    }, 1500);
}

function update_stats(stat_type, count) {
    const el = document.getElementById('val-' + stat_type);
    if(el) {
        let start = parseInt(el.innerText) || 0;
        if (start !== count) {
            el.innerText = count;
            el.style.transform = 'scale(1.2)';
            
            if (stat_type === 'hits' && count > start) {
                spawnHitExplosion(el.getBoundingClientRect());
                
                hitStreak++;
                if (hitStreak >= 2) {
                    showStreak(hitStreak);
                }
                
                clearTimeout(streakTimer);
                streakTimer = setTimeout(() => { hitStreak = 0; }, 4000);
            }
            
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
        }
    }
}

function add_log(msg, level="info") {
    const consoleEl = document.getElementById('log-console');
    const div = document.createElement('div');
    div.className = `log ${level}`;
    div.innerText = `>> ${msg}`;
    
    consoleEl.appendChild(div);
    if(consoleEl.childNodes.length > 300) {
        consoleEl.removeChild(consoleEl.firstChild);
    }
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Setup Realtime Listener
function setupRealtime() {
    if (!db) {
        add_log("Supabase baglantisi kurulamadi! Lutfen eklentileri (Adblock) kapatin ve sayfayi yenileyin.", "error");
        return;
    }
    add_log("Connecting to Supabase Realtime...", "info");
    
    db
        .channel('public:results')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'results' }, payload => {
            const result = payload.new;
            
            if(result.status === 'log') {
                add_log(result.details, "info");
                return;
            }
            
            if(result.status === 'ping') {
                lastPingTime = Date.now();
                return;
            }
            
            if(result.status === 'cpm_update') {
                update_stats('cpm', result.details);
                return;
            }
            
            if(result.status === 'queue_update') {
                update_stats('remaining', result.details);
                return;
            }

            stats.total++;
            
            if(result.status === 'success') {
                stats.hits++;
                hitsList.push(result.account);
                add_log(`Hit Found! [${result.account}]`, "success");
            } else if(result.status === 'fail' || result.status === 'banned') {
                stats.banned++;
            } else {
                stats.errors++;
            }
            
            update_stats('total', stats.total);
            update_stats('hits', stats.hits);
            update_stats('banned', stats.banned);
            update_stats('errors', stats.errors);
            
            if(result.details && result.status !== 'success') {
                add_log(`${result.account}: ${result.details}`, "warning");
            }
        })
        .subscribe((status) => {
            if(status === 'SUBSCRIBED') {
                add_log("Supabase Realtime CONNECTED.", "success");
            } else if (status === 'CLOSED') {
                add_log("Supabase Connection Closed.", "error");
            }
        });
}

// Start realtime connection
setupRealtime();
add_log("Sistem Arayuzu (UI) Basariyla Yuklendi ve Hazir.", "success");
add_log("Eger butonlar calismiyorsa konsoldaki (F12) kirmizi hatayi gelistiriciye bildirin.", "warning");

// Engine Heartbeat Watchdog
setInterval(() => {
    const dot = document.getElementById('engine-dot');
    const text = document.getElementById('engine-text');
    if(dot && text) {
        if(Date.now() - lastPingTime > 15000) {
            dot.classList.add('offline');
            text.innerText = 'ENGINE OFFLINE';
            text.style.color = 'var(--text-muted)';
        } else {
            dot.classList.remove('offline');
            text.innerText = 'ENGINE ONLINE';
            text.style.color = '#10B981';
        }
    }
}, 2000);

// ==========================================
// WORKFLOWS ARCHITECT LOGIC
// ==========================================
const btnAddStep = document.getElementById('btn-add-step');
const wfDropdown = document.getElementById('wf-step-dropdown');
const wfDynamicSteps = document.getElementById('wf-dynamic-steps');
let activeWorkflowSteps = [];

if (btnAddStep && wfDropdown && wfDynamicSteps) {
    btnAddStep.addEventListener('click', () => {
        wfDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!btnAddStep.contains(e.target) && !wfDropdown.contains(e.target)) {
            wfDropdown.classList.add('hidden');
        }
    });
    
    document.querySelectorAll('.wf-drop-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.getAttribute('data-type');
            addWorkflowStep(type);
            wfDropdown.classList.add('hidden');
        });
    });
}

function addWorkflowStep(type) {
    const stepId = 'wf_step_' + new Date().getTime();
    const div = document.createElement('div');
    div.className = 'wf-step';
    div.id = stepId;
    
    let iconHTML = '';
    let contentHTML = '';
    
    if (type === 'webhook') {
        iconHTML = '<div class="wf-icon" style="background: #5865F2; box-shadow: 0 0 15px rgba(88,101,242,0.5);">👾</div>';
        contentHTML = `
            <h4>Discord Webhook <button class="wf-remove-btn" onclick="removeWorkflowStep('${stepId}')">&times;</button></h4>
            <input type="text" placeholder="https://discord.com/api/webhooks/..." style="width: 100%; margin-top: 5px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-light); padding: 5px 8px; border-radius: 4px; color: #FFF; font-size: 11px; outline: none;">
        `;
    } else if (type === 'inventory') {
        iconHTML = '<div class="wf-icon" style="background: #F59E0B; box-shadow: 0 0 15px rgba(245,158,11,0.5);">🎒</div>';
        contentHTML = `
            <h4>Capture Inventory <button class="wf-remove-btn" onclick="removeWorkflowStep('${stepId}')">&times;</button></h4>
            <p>Automatically fetches skins, balances, and ranks for the hit.</p>
        `;
    } else if (type === 'filter') {
        iconHTML = '<div class="wf-icon" style="background: #EC4899; box-shadow: 0 0 15px rgba(236,72,153,0.5);">🎯</div>';
        contentHTML = `
            <h4>Premium Filter <button class="wf-remove-btn" onclick="removeWorkflowStep('${stepId}')">&times;</button></h4>
            <input type="text" placeholder="Required items (e.g. Kuronami, Elderflame)" style="width: 100%; margin-top: 5px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-light); padding: 5px 8px; border-radius: 4px; color: #FFF; font-size: 11px; outline: none;">
        `;
    }
    
    div.innerHTML = iconHTML + '<div class="wf-content">' + contentHTML + '</div>';
    wfDynamicSteps.appendChild(div);
}

window.removeWorkflowStep = function(stepId) {
    const el = document.getElementById(stepId);
    if (el) {
        el.style.animation = "slideInLeft 0.3s reverse forwards";
        setTimeout(() => el.remove(), 300);
    }
};

// ==========================================
// NAVIGATION LOGIC (Handled at the top of the file)
// ==========================================

const wfNodes = document.querySelectorAll('.wf-step');
wfNodes.forEach(n => {
    n.addEventListener('mouseenter', () => n.style.transform = 'translateY(-2px)');
    n.addEventListener('mouseleave', () => n.style.transform = 'translateY(0)');
});

// NODE SELECTION LOGIC
const coreStep = document.querySelector('.core-step');
const configBody = document.querySelector('.config-module .module-body');

if (coreStep && configBody) {
    coreStep.style.cursor = 'pointer';
    coreStep.addEventListener('click', () => {
        coreStep.style.borderColor = '#3B82F6';
        coreStep.style.boxShadow = '0 0 15px rgba(59,130,246,0.3)';
        
        configBody.style.opacity = '1';
        configBody.innerHTML = `
            <div style="width: 100%; text-align: left;">
                <h3 style="color: #FFF; margin-bottom: 5px; font-size: 16px;">Account Authentication</h3>
                <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 20px;">Base module properties.</p>
                
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-light); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <label style="display: block; font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 8px;">MAX RETRIES</label>
                    <input type="number" value="3" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #FFF; padding: 8px 12px; border-radius: 4px; outline: none; font-family: 'JetBrains Mono', monospace;">
                </div>

                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-light); padding: 15px; border-radius: 8px;">
                    <label style="display: block; font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 8px;">TIMEOUT (MS)</label>
                    <input type="number" value="5000" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #FFF; padding: 8px 12px; border-radius: 4px; outline: none; font-family: 'JetBrains Mono', monospace;">
                </div>
            </div>
        `;
    });
}

// ==========================================
// DEEP ANALYTICS CHARTS LOGIC
// ==========================================
let performanceChart, platformChart;

function initCharts() {
    // Shared chart options for Dark Neon Theme
    Chart.defaults.color = 'rgba(255, 255, 255, 0.5)';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    
    // 1. Performance Line Chart (CPM vs Hits)
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        performanceChart = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: ['0s', '10s', '20s', '30s', '40s', '50s', '60s'], // Initial empty timeline
                datasets: [
                    {
                        label: 'CPM',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Hits',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true } }
                },
                scales: {
                    x: { grid: { display: false, drawBorder: false } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, beginAtZero: true }
                }
            }
        });
    }

    // 2. Platform Distribution Doughnut Chart
    const platCtx = document.getElementById('platformChart');
    if (platCtx) {
        platformChart = new Chart(platCtx, {
            type: 'doughnut',
            data: {
                labels: ['Waiting Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255, 255, 255, 0.05)'],
                    borderColor: ['rgba(255,255,255,0.1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
                }
            }
        });
    }
}

// Ensure charts are drawn if user switches to the Analytics tab, or initialize immediately if not hidden.
document.addEventListener('DOMContentLoaded', () => {
    // Basic init (they might be invisible until the tab is clicked, Chart.js handles this mostly fine now)
    initCharts();
});
