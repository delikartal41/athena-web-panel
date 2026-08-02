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
    
    btnStart.style.display = 'none';
    btnStop.disabled = false;
    
    // Reset Stats
    stats = { total: 0, hits: 0, banned: 0, errors: 0, cpm: 0, remaining: 0 };
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
                    proxies: proxyContent
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
