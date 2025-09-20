// ------------------------------
// Data & Utilities
// ------------------------------
const fmtDate = ts => new Date(ts).toLocaleString();
const relTime = ts => {
  const d = Date.now() - new Date(ts).getTime();
  const m = Math.round(d/60000), h = Math.round(m/60), dd = Math.round(h/24);
  if (m < 60) return m + "m ago";
  if (h < 48) return h + "h ago";
  return dd + "d ago";
};
const uid = () => Math.random().toString(36).slice(2,9);

const BIN_TYPES = [
  { type:"Paper", color:"linear-gradient(90deg,#22c55e,#38bdf8)" },
  { type:"Plastic", color:"linear-gradient(90deg,#38bdf8,#6366f1)" },
  { type:"Metal", color:"linear-gradient(90deg,#f59e0b,#ef4444)" },
  { type:"E-Waste", color:"linear-gradient(90deg,#a855f7,#22c55e)" },
];

// Battery status helpers
const getBatteryStatus = (battery) => {
  if (battery >= 75) return { level: 'high', color: '#22c55e', text: 'Excellent' };
  if (battery >= 50) return { level: 'medium', color: '#f59e0b', text: 'Good' };
  if (battery >= 25) return { level: 'medium', color: '#f59e0b', text: 'Fair' };
  return { level: 'low', color: '#ef4444', text: 'Low' };
};

// Desktop and Mobile coordinates for bins with battery levels
let demoBins = [
  { 
    id:"CANTEEN BIN-1", 
    type:"Paper", 
    filled:38, 
    battery: 85,
    lastCollected: Date.now()-1000*60*60*36, 
    desktop: { lat:40, lng:40 },
    mobile: { lat:35, lng:38 }
  },
  { 
    id:"CANTEEN BIN-2", 
    type:"Plastic", 
    filled:38, 
    battery: 72,
    lastCollected: Date.now()-1000*60*60*36, 
    desktop: { lat:43, lng:40 },
    mobile: { lat:38, lng:38 }
  },
  { 
    id:"CANTEEN BIN-3", 
    type:"Metal", 
    filled:38, 
    battery: 45,
    lastCollected: Date.now()-1000*60*60*36, 
    desktop: { lat:46, lng:40 },
    mobile: { lat:41, lng:38 }
  },
  { 
    id:"CANTEEN BIN-4", 
    type:"E-Waste", 
    filled:38, 
    battery: 15,
    lastCollected: Date.now()-1000*60*60*36, 
    desktop: { lat:49, lng:40 },
    mobile: { lat:44, lng:38 }
  },
  { 
    id:"REGISTRAR BIN-1", 
    type:"Paper", 
    filled:95, 
    battery: 92,
    lastCollected: Date.now()-1000*60*60*5, 
    desktop: { lat:40, lng:81 },
    mobile: { lat:35, lng:78 }
  },
  { 
    id:"REGISTRAR BIN-2", 
    type:"Plastic", 
    filled:95, 
    battery: 78,
    lastCollected: Date.now()-1000*60*60*5, 
    desktop: { lat:43, lng:81 },
    mobile: { lat:38, lng:78 }
  },
  { 
    id:"REGISTRAR BIN-3", 
    type:"Metal", 
    filled:95, 
    battery: 55,
    lastCollected: Date.now()-1000*60*60*5, 
    desktop: { lat:46, lng:81 },
    mobile: { lat:41, lng:78 }
  },
  { 
    id:"REGISTRAR BIN-4", 
    type:"E-Waste", 
    filled:95, 
    battery: 23,
    lastCollected: Date.now()-1000*60*60*5, 
    desktop: { lat:49, lng:81 },
    mobile: { lat:44, lng:78 }
  },
];

// Demo store rewards
const storeItems = [
  { id:"st1", title:"Free Coffee", cost:20 },
  { id:"st2", title:"Canteen 10% Voucher", cost:50 },
  { id:"st3", title:"Ballpen", cost:100 },
];

// Local storage helpers
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => { try{ return JSON.parse(localStorage.getItem(k)); }catch{return null;} };

// ------------------------------
// Auth System
// ------------------------------
let currentUser = null;
let isStaff = false;
let users = load("users") || {};

// Initialize staff account
if (!users.staff) {
  users.staff = { pass: 'staff123', points: 0, type: 'staff' };
  save("users", users);
}

function showAuth(msg=""){
  document.querySelector("#auth").classList.remove("hidden");
  document.querySelector("#app").classList.add("hidden");
  if(msg) document.querySelector("#authMsg").textContent = msg;
}
function showApp(){
  document.querySelector("#auth").classList.add("hidden");
  document.querySelector("#app").classList.remove("hidden");
  renderApp();
}

// Login / Register
document.querySelector("#authSubmit").onclick = () => {
  const user = document.querySelector("#authUser").value.trim();
  const pass = document.querySelector("#authPass").value.trim();
  const mode = document.querySelector("#authTitle").textContent;

  if(!user || !pass){
    document.querySelector("#authMsg").textContent = "Enter username & password.";
    return;
  }
  
  if(mode === "Login"){
    // Check for staff login
    if(user === "staff" && pass === "staff123"){
      currentUser = user;
      isStaff = true;
      showApp();
      return;
    }
    
    // Regular user login
    if(users[user] && users[user].pass === pass){
      currentUser = user;
      isStaff = users[user].type === 'staff';
      showApp();
    }else{
      document.querySelector("#authMsg").textContent = "Invalid credentials.";
    }
  }else{
    // Prevent staff account registration
    if(user === "staff"){
      document.querySelector("#authMsg").textContent = "Cannot register with staff username.";
      return;
    }
    
    if(users[user]){
      document.querySelector("#authMsg").textContent = "User already exists.";
    }else{
      users[user] = { pass, points:0, type: 'user' };
      save("users", users);
      currentUser = user;
      isStaff = false;
      showApp();
    }
  }
};

document.querySelector("#authToggle").onclick = () => {
  const title = document.querySelector("#authTitle");
  const btn = document.querySelector("#authSubmit");
  if(title.textContent === "Login"){
    title.textContent = "Register";
    btn.textContent = "Register";
    document.querySelector("#authToggle").textContent = "Back to login";
  }else{
    title.textContent = "Login";
    btn.textContent = "Login";
    document.querySelector("#authToggle").textContent = "Create account";
  }
};

// Logout
document.querySelector("#logout").onclick = e => {
  e.preventDefault();
  currentUser = null;
  isStaff = false;
  showAuth("Logged out.");
};

// ------------------------------
// Sidebar Toggle Functions
// ------------------------------
function toggleSidebar() {
  const sidebar = document.querySelector('#sidebar');
  const overlay = document.querySelector('#sidebarOverlay');
  const toggle = document.querySelector('#sidebarToggle');
  
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  toggle.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.querySelector('#sidebar');
  const overlay = document.querySelector('#sidebarOverlay');
  const toggle = document.querySelector('#sidebarToggle');
  
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  toggle.classList.remove('active');
}

// Sidebar event listeners
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.querySelector('#sidebarToggle');
  const sidebarClose = document.querySelector('#sidebarClose');
  const sidebarOverlay = document.querySelector('#sidebarOverlay');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
  
  // Close sidebar when clicking navigation items on mobile
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        closeSidebar();
      }
    });
  });
});

// ------------------------------
// App Rendering
// ------------------------------
function renderApp(){
  if(!currentUser) return;

  // Update sidebar & header
  document.querySelector("#sideUser").textContent = currentUser;
  document.querySelector("#topUser").textContent = currentUser;
  document.querySelector("#sideUserType").textContent = isStaff ? "Staff Account" : "Regular User";
  document.querySelector("#sidePoints").textContent = users[currentUser].points;
  document.querySelector("#topPoints").textContent = users[currentUser].points;
  document.querySelector("#storePoints").textContent = users[currentUser].points;
  document.querySelector("#profUser").value = currentUser;
  document.querySelector("#profPass").value = "";

  // Show/hide staff elements
  const staffBadge = document.querySelector("#topStaffBadge");
  const staffControls = document.querySelector("#staffControls");
  const passwordField = document.querySelector("#passwordField");
  
  if (isStaff) {
    staffBadge.style.display = "inline-flex";
    staffControls.style.display = "block";
    passwordField.style.display = "none"; // Hide password change for staff
  } else {
    staffBadge.style.display = "none";
    staffControls.style.display = "none";
    passwordField.style.display = "grid";
  }

  // Render bins
  const grid = document.querySelector("#binsGrid");
  grid.innerHTML = "";
  demoBins.forEach(bin=>{
    const t = BIN_TYPES.find(t=>t.type===bin.type);
    const batteryStatus = getBatteryStatus(bin.battery);
    
    const card = document.createElement("div");
    card.className = `card bin-card ${isStaff ? 'staff-managed' : ''}`;
    
    let actionsHTML = '';
    if (isStaff) {
      actionsHTML = `
        <div class="actions staff-actions">
          <button class="btn staff-btn small" onclick="addPoints('${bin.id}')">+Points</button>
          <button class="btn staff-btn small" onclick="clearTrash('${bin.id}')">Clear</button>
          <button class="btn staff-btn small" onclick="chargeBattery('${bin.id}')">Charge</button>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="bin-head">
        <strong>${bin.id}</strong>
        <span class="pill">${bin.type}</span>
      </div>
      <div class="progress"><div class="bar" style="width:${bin.filled}%; background:${t.color}"></div></div>
      <div class="row-between">
        <span class="muted">${bin.filled}% full</span>
        <span class="muted">Last Collected: ${relTime(bin.lastCollected)}</span>
      </div>
      <div class="battery-section">
        <div class="battery-icon">
          <div class="battery-fill battery-${batteryStatus.level}" style="width: ${bin.battery}%"></div>
        </div>
        <span class="battery-text" style="color: ${batteryStatus.color}">${bin.battery}%</span>
        <span class="battery-status">${batteryStatus.text}</span>
      </div>
      ${actionsHTML}
    `;
    grid.appendChild(card);
  });

  // Render store
  const sg = document.querySelector("#storeGrid");
  sg.innerHTML = "";
  storeItems.forEach(item=>{
    const el = document.createElement("div");
    el.className="card store-item";
    el.innerHTML = `
   <div class="title">${item.title}</div>
    <div class="muted" style="margin-top:8px;">Cost: ${item.cost}</div>
    <button class="btn" style="margin-top:10px;" onclick="redeem('${item.id}')">Redeem</button>
`;
    sg.appendChild(el);
  });

  // Render both maps
  renderDesktopMap();
  renderMobileMap();
}

// ------------------------------
// Bin Actions
// ------------------------------
function addPoints(id){
  users[currentUser].points += 5;
  save("users", users);
  renderApp();
  showNotification(`${id} Points added to your account successfully!`, 'success');
}

// Staff-only functions
function clearTrash(id) {
  if (!isStaff) return;
  const b = demoBins.find(x => x.id === id);
  if (b) {
    b.filled = 0;
    b.lastCollected = Date.now();
    renderApp();
    showNotification(`${id} trash cleared successfully!`, 'success');
  }
}

function chargeBattery(id) {
  if (!isStaff) return;
  const b = demoBins.find(x => x.id === id);
  if (b) {
    b.battery = 100;
    renderApp();
    showNotification(`${id} battery charged to 100%!`, 'success');
  }
}

function clearAllBins() {
  if (!isStaff) return;
  demoBins.forEach(b => {
    b.filled = 0;
    b.lastCollected = Date.now();
  });
  renderApp();
  showNotification('All bins cleared successfully!', 'success');
}

function chargeAllBatteries() {
  if (!isStaff) return;
  demoBins.forEach(b => {
    b.battery = 100;
  });
  renderApp();
  showNotification('All batteries charged to 100%!', 'success');
}

function resetSystem() {
  if (!isStaff) return;
  if (confirm('Are you sure you want to reset the entire system? This will clear all bins and randomize battery levels.')) {
    demoBins.forEach(b => {
      b.filled = Math.floor(Math.random() * 50); // Random fill 0-50%
      b.battery = Math.floor(Math.random() * 40 + 60); // Random battery 60-100%
      b.lastCollected = Date.now() - Math.floor(Math.random() * 72 * 60 * 60 * 1000); // Random collection within 72h
    });
    renderApp();
    showNotification('System reset successfully!', 'success');
  }
}

function generateReport() {
  if (!isStaff) return;
  const totalBins = demoBins.length;
  const fullBins = demoBins.filter(b => b.filled > 80).length;
  const lowBatteryBins = demoBins.filter(b => b.battery < 25).length;
  const avgFill = Math.round(demoBins.reduce((sum, b) => sum + b.filled, 0) / totalBins);
  const avgBattery = Math.round(demoBins.reduce((sum, b) => sum + b.battery, 0) / totalBins);
  
  const report = `
SMART BIN SYSTEM REPORT
Generated: ${new Date().toLocaleString()}
---------------------------------
Total Bins: ${totalBins}
Bins >80% Full: ${fullBins}
Low Battery Bins (<25%): ${lowBatteryBins}
Average Fill Level: ${avgFill}%
Average Battery Level: ${avgBattery}%
---------------------------------
Bins Requiring Attention:
${demoBins.filter(b => b.filled > 80 || b.battery < 25)
  .map(b => `• ${b.id}: ${b.filled}% full, ${b.battery}% battery`)
  .join('\n') || 'None'}
  `;
  
  alert(report);
}

function simulateCollect(){
  const dt = document.querySelector("#collectTime").value;
  if(!dt) return;
  demoBins.forEach(b=>{
    b.lastCollected = new Date(dt).getTime();
    // Simulate battery drain during collection
    b.battery = Math.max(0, b.battery - Math.floor(Math.random() * 5 + 1));
  });
  renderApp();
}

function randomizeLevels(){
  demoBins.forEach(b=>b.filled = Math.floor(Math.random()*100));
  renderApp();
}

// Battery simulation functions
function randomizeBatteries(){
  demoBins.forEach(b=>{
    b.battery = Math.floor(Math.random() * 100);
  });
  renderApp();
}

function simulateSolarCharge(){
  demoBins.forEach(b=>{
    // Simulate solar charging - add 15-30% battery
    const chargeAmount = Math.floor(Math.random() * 15 + 15);
    b.battery = Math.min(100, b.battery + chargeAmount);
  });
  renderApp();
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'install-notification';
  
  let bgColor = 'linear-gradient(135deg, #22c55e, #10b981)';
  let textColor = '#052e1a';
  
  if (type === 'error') {
    bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
    textColor = '#fff';
  }
  
  notification.innerHTML = `
    <div class="install-success" style="background: ${bgColor}; color: ${textColor};">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ------------------------------
// Store Actions
// ------------------------------
function redeem(id){
  const item = storeItems.find(x=>x.id===id);
  if(!item) return;
  const u = users[currentUser];
  if(u.points >= item.cost){
    u.points -= item.cost;
    save("users", users);
    showNotification("Redeemed: " + item.title, 'success');
    renderApp();
  }else{
    showNotification("Not enough points!", 'error');
  }
}

// ------------------------------
// Profile Save
// ------------------------------
document.querySelector("#saveProfile").onclick = () => {
  const newUser = document.querySelector("#profUser").value.trim();
  const newPass = document.querySelector("#profPass").value.trim();

  // Don't allow changing staff username
  if (currentUser === "staff" && newUser !== "staff") {
    document.querySelector("#profMsg").textContent = "Cannot change staff username.";
    return;
  }

  if(newUser !== currentUser && users[newUser]){
    document.querySelector("#profMsg").textContent = "Username already exists.";
    return;
  }

  const oldData = users[currentUser];
  delete users[currentUser];
  users[newUser] = { 
    pass: newPass || oldData.pass, 
    points: oldData.points,
    type: oldData.type || 'user'
  };
  currentUser = newUser;
  save("users", users);
  document.querySelector("#profMsg").textContent = "Profile saved!";
  renderApp();
};

// ------------------------------
// Map Rendering - Desktop
// ------------------------------
function renderDesktopMap(){
  const map = document.querySelector("#desktopMap");
  map.innerHTML = "";
  demoBins.forEach(b=>{
    const pin = document.createElement("div");
    pin.className = "pin";
    pin.style.left = b.desktop.lng+"%";
    pin.style.top = b.desktop.lat+"%";

    let color = "limegreen";
    if(b.type === "Paper") color = "#22c55e";
    if(b.type === "Plastic") color = "#3b82f6";
    if(b.type === "Metal") color = "#f59e0b";
    if(b.type === "E-Waste") color = "#a855f7";

    const batteryStatus = getBatteryStatus(b.battery);
    const lowBatteryClass = batteryStatus.level === 'low' ? 'low-battery' : '';

    pin.innerHTML = `<div class="dot ${lowBatteryClass}" style="background:${color}; box-shadow:0 0 6px ${color}80"></div><div class="label">${b.id}</div>`;
    
    const clickHandler = () => {
      const message = `${b.id} – ${b.type} – ${b.filled}% full\nBattery: ${b.battery}% (${batteryStatus.text})\nLast collected: ${relTime(b.lastCollected)}`;
      if (isStaff) {
        const action = confirm(`${message}\n\nStaff Actions:\nOK - Clear Trash\nCancel - Charge Battery`);
        if (action) {
          clearTrash(b.id);
        } else {
          chargeBattery(b.id);
        }
      } else {
        alert(message);
      }
    };
    
    pin.onclick = clickHandler;
    map.appendChild(pin);
  });
}

// ------------------------------
// Map Rendering - Mobile
// ------------------------------
function renderMobileMap(){
  const map = document.querySelector("#mobileMap");
  map.innerHTML = "";
  demoBins.forEach(b=>{
    const pin = document.createElement("div");
    pin.className = "pin";
    pin.style.left = b.mobile.lng+"%";
    pin.style.top = b.mobile.lat+"%";

    let color = "limegreen";
    if(b.type === "Paper") color = "#22c55e";
    if(b.type === "Plastic") color = "#3b82f6";
    if(b.type === "Metal") color = "#f59e0b";
    if(b.type === "E-Waste") color = "#a855f7";

    const batteryStatus = getBatteryStatus(b.battery);
    const lowBatteryClass = batteryStatus.level === 'low' ? 'low-battery' : '';

    pin.innerHTML = `<div class="dot ${lowBatteryClass}" style="background:${color}; box-shadow:0 0 6px ${color}80"></div><div class="label">${b.id}</div>`;
    
    const clickHandler = () => {
      const message = `${b.id} – ${b.type} – ${b.filled}% full\nBattery: ${b.battery}% (${batteryStatus.text})\nLast collected: ${relTime(b.lastCollected)}`;
      if (isStaff) {
        const action = confirm(`${message}\n\nStaff Actions:\nOK - Clear Trash\nCancel - Charge Battery`);
        if (action) {
          clearTrash(b.id);
        } else {
          chargeBattery(b.id);
        }
      } else {
        alert(message);
      }
    };
    
    pin.onclick = clickHandler;
    map.appendChild(pin);
  });
}

// ------------------------------
// Tabs Navigation
// ------------------------------
document.querySelectorAll(".nav-btn[data-tab]").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelector("#tab-"+tab).classList.add("active");
  };
});

// Initialize the app
if(currentUser) {
  showApp();
} else {
  showAuth();
}

// Auto-simulate battery drain over time (optional)
setInterval(() => {
  demoBins.forEach(bin => {
    if(Math.random() < 0.1 && bin.battery > 0) {
      bin.battery = Math.max(0, bin.battery - 1);
    }
  });
  if(currentUser) {
    renderApp();
  }
}, 30000); // Update every 30 seconds

// ------------------------------
// PWA Installation
// ------------------------------
let deferredPrompt;
let isInstalled = false;

// Check if app is already installed
window.addEventListener('DOMContentLoaded', () => {
  // Check if app is running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    isInstalled = true;
    console.log('App is already installed');
  }
});

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install buttons
  showInstallButtons();
  console.log('Install prompt ready');
});

// Show install buttons when prompt is available
function showInstallButtons() {
  const installBtn = document.querySelector('#installBtn');
  const installSideBtn = document.querySelector('#installSideBtn');
  
  if (installBtn && !isInstalled) {
    installBtn.style.display = 'inline-flex';
  }
  if (installSideBtn && !isInstalled) {
    installSideBtn.style.display = 'flex';
  }
}

// Hide install buttons
function hideInstallButtons() {
  const installBtn = document.querySelector('#installBtn');
  const installSideBtn = document.querySelector('#installSideBtn');
  
  if (installBtn) {
    installBtn.style.display = 'none';
  }
  if (installSideBtn) {
    installSideBtn.style.display = 'none';
  }
}

// Install app function
async function installApp() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
    isInstalled = true;
    hideInstallButtons();
    
    // Show success message
    showInstallSuccess();
  } else {
    console.log('User dismissed the install prompt');
  }
  
  // Clear the deferred prompt
  deferredPrompt = null;
}

// Show installation success message
function showInstallSuccess() {
  // Create a temporary success notification
  const notification = document.createElement('div');
  notification.className = 'install-notification';
  notification.innerHTML = `
    <div class="install-success">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>App installed successfully!</span>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add click handlers for install buttons
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.querySelector('#installBtn');
  const installSideBtn = document.querySelector('#installSideBtn');
  
  if (installBtn) {
    installBtn.addEventListener('click', installApp);
  }
  
  if (installSideBtn) {
    installSideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      installApp();
    });
  }
});

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('App was installed');
  isInstalled = true;
  hideInstallButtons();
  deferredPrompt = null;
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch(err => console.log('SW registration failed', err));
  });
}