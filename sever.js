const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper function to read database.json safely
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Helper function to write to database.json safely
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 1. REGISTER ENDPOINT
app.post('/api/register', (req, res) => {
    const { username, password, pfp } = req.body;
    const db = readDB();

    if (db[username]) {
        return res.status(400).json({ success: false, message: "IDENTITY NOT AVAILABLE // REGISTER_DENIED" });
    }

    db[username] = { password, pfp, ledger: [] };
    writeDB(db);
    res.json({ success: true, message: "NODE INITIALIZED SUCCESSFUL" });
});

// 2. LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (db[username] && db[username].password === password) {
        res.json({ 
            success: true, 
            username, 
            pfp: db[username].pfp, 
            ledger: db[username].ledger 
        });
    } else {
        res.status(401).json({ success: false, message: "ACCESS PASSPHRASE DENIED // ERROR" });
    }
});

// 3. SYNC LEDGER ENDPOINT (Saves user budget entries)
app.post('/api/sync', (req, res) => {
    const { username, ledger } = req.body;
    const db = readDB();

    if (!db[username]) {
        return res.status(404).json({ success: false, message: "USER NOT FOUND" });
    }

    db[username].ledger = ledger;
    writeDB(db);
    res.json({ success: true, message: "DATABASE SYNC COMPLETE" });
});

app.listen(PORT, () => {
    console.log(`[MELLONTIC DATABASE SERVER ONLINE] -> Running on http://localhost:${PORT}`);
});