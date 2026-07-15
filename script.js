// ==========================================
// 1. STATE CONFIGURATION & AUTH ENGINE
// ==========================================
let usersDatabase = JSON.parse(localStorage.getItem('mellontic_users')) || {};
let currentUser = sessionStorage.getItem('mellontic_active_user') || null;
let dataLog = [];

const defaultPfp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f0ff'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const authPanel = document.getElementById('auth-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const pfpGroup = document.getElementById('pfp-group');
const dashboardPfp = document.getElementById('dashboard-pfp');

const authForm = document.getElementById('auth-form');
const authUsernameInput = document.getElementById('auth-username');
const authPasswordInput = document.getElementById('auth-password');
const authPfpInput = document.getElementById('auth-pfp');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleLink = document.getElementById('auth-toggle-link');
const authSwitchText = document.getElementById('auth-switch-text');
const authHeaderTitle = document.getElementById('auth-header-title');
const authTipBadge = document.getElementById('auth-tip-badge');

const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');

const form = document.getElementById('tracker-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const ledgerList = document.getElementById('ledger');

const balanceDisplay = document.getElementById('balance');
const incomeDisplay = document.getElementById('income');
const expensesDisplay = document.getElementById('expenses');

let signUpModeActive = false;

// Toggle registration inputs
authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    signUpModeActive = !signUpModeActive;
    authForm.reset();

    if (signUpModeActive) {
        authHeaderTitle.textContent = "REGISTER_CORE_IDENTITY";
        authTipBadge.textContent = "CREATING NEW NODE";
        authTipBadge.style.color = "var(--neon-green)";
        authSubmitBtn.textContent = "INITIALIZE_NODE();";
        authSwitchText.textContent = "Already verified?";
        authToggleLink.textContent = "Sign In";
        pfpGroup.classList.remove('hidden');
    } else {
        authHeaderTitle.textContent = "IDENTITY_VERIFICATION";
        authTipBadge.textContent = "SECURE CONNECTION";
        authTipBadge.style.color = "var(--neon-cyan)";
        authSubmitBtn.textContent = "AUTHORIZE_ACCESS();";
        authSwitchText.textContent = "New identity node?";
        authToggleLink.textContent = "Register Core";
        pfpGroup.classList.add('hidden');
    }
});

// Process credential submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = authUsernameInput.value.trim().toLowerCase();
    const password = authPasswordInput.value;
    const pfpUrl = authPfpInput.value.trim() || defaultPfp;

    if (signUpModeActive) {
        if (usersDatabase[username]) {
            alert("NODE EXISTING // IDENTITY BLOCKED");
            return;
        }
        usersDatabase[username] = { password: password, pfp: pfpUrl, ledger: [] };
        localStorage.setItem('mellontic_users', JSON.stringify(usersDatabase));
        alert("NODE REGISTRATION SUCCESSFUL // LOGGING IN");
        login(username, pfpUrl, []);
    } else {
        if (usersDatabase[username] && usersDatabase[username].password === password) {
            const userObj = usersDatabase[username];
            login(username, userObj.pfp || defaultPfp, userObj.ledger || []);
        } else {
            alert("INVALID IDENTITY OR ACCESS PASSPHRASE");
        }
    }
});

function login(username, pfp, ledger) {
    currentUser = username;
    sessionStorage.setItem('mellontic_active_user', username);
    
    statusBadge.textContent = `SYS_STATUS: OPERATIONAL // SECURE_INDEX: ACTIVE`;
    userDisplay.textContent = `USER: ${username.toUpperCase()}`;
    
    dashboardPfp.src = pfp || defaultPfp;
    dashboardPfp.onerror = function() { this.src = defaultPfp; };

    dataLog = ledger || [];

    authPanel.classList.add('hidden');
    dashboardPanel.classList.remove('hidden');

    updateHUD();
    renderLedger();
}

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('mellontic_active_user');
    currentUser = null;
    statusBadge.textContent = `SYS_STATUS: OFFLINE // AUTH_REQUIRED`;
    dashboardPanel.classList.add('hidden');
    authPanel.classList.remove('hidden');
    authForm.reset();
});

// ==========================================
// 2. CALCULATION & INTERFACE RENDER ENGINE
// ==========================================
function updateHUD() {
    let inTotal = 0;
    let outTotal = 0;

    dataLog.forEach(item => {
        if (item.type === 'income') { inTotal += item.amount; } 
        else { outTotal += item.amount; }
    });

    const netLiquidity = inTotal - outTotal;

    incomeDisplay.textContent = `+$${inTotal.toFixed(2)}`;
    expensesDisplay.textContent = `-$${outTotal.toFixed(2)}`;
    balanceDisplay.textContent = `$${netLiquidity.toFixed(2)}`;

    if (netLiquidity < 0) {
        balanceDisplay.style.color = 'var(--neon-pink)';
        balanceDisplay.style.textShadow = '0 0 20px rgba(255, 0, 127, 0.6)';
    } else {
        balanceDisplay.style.color = '#fff';
        balanceDisplay.style.textShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
    }
}

function renderLedger() {
    ledgerList.innerHTML = '';

    if (dataLog.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.style.justifyContent = 'center';
        emptyLi.style.color = '#8fa3b8';
        emptyLi.style.fontStyle = 'italic';
        emptyLi.style.border = '1px dashed rgba(255, 255, 255, 0.05)';
        emptyLi.textContent = '[ MELLONTIC SYSTEM READY: STANDING BY FOR INPUT ]';
        ledgerList.appendChild(emptyLi);
        return;
    }

    dataLog.forEach((item, index) => {
        const li = document.createElement('li');
        const isIncome = item.type === 'income';
        li.className = isIncome ? 'income-item' : 'expense-item';

        // Secure info card creation
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';

        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = item.desc; // Mitigates injection vulnerabilities

        const itemCategory = document.createElement('span');
        itemCategory.className = 'item-category';
        itemCategory.textContent = `// ${item.type.toUpperCase()}`;

        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemCategory);

        // Numeric column construction
        const amountWrapper = document.createElement('div');
        amountWrapper.className = 'amount-wrapper';

        const itemVal = document.createElement('span');
        itemVal.className = `item-val ${isIncome ? 'value-income' : 'value-expense'}`;
        itemVal.textContent = `${isIncome ? '+' : '-'}$${item.amount.toFixed(2)}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => eraseTransaction(index));

        amountWrapper.appendChild(itemVal);
        amountWrapper.appendChild(deleteBtn);

        li.appendChild(itemInfo);
        li.appendChild(amountWrapper);
        ledgerList.appendChild(li);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        desc: descInput.value.trim(),
        amount: parseFloat(amountInput.value),
        type: typeInput.value
    };
    dataLog.unshift(transaction);
    syncWithDatabase();
    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
});

function eraseTransaction(index) {
    dataLog.splice(index, 1);
    syncWithDatabase();
}

function syncWithDatabase() {
    if (currentUser && usersDatabase[currentUser]) {
        usersDatabase[currentUser].ledger = dataLog;
        localStorage.setItem('mellontic_users', JSON.stringify(usersDatabase));
    }
    updateHUD();
    renderLedger();
}

// Runtime setup verification
if (currentUser && usersDatabase[currentUser]) {
    const activeNode = usersDatabase[currentUser];
    login(currentUser, activeNode.pfp || defaultPfp, activeNode.ledger || []);
} else {
    sessionStorage.removeItem('mellontic_active_user');
    currentUser = null;
}