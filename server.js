const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Helper function to read from the database
function readDb() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Helper function to write to the database
function writeDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// API: Register a new user
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const db = readDb();

    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password, // In a real app, hash this!
        balance: 0,
        totalEarnings: 0,
        adsViewed: 0,
        workHistory: []
    };

    db.users.push(newUser);
    writeDb(db);
    res.json({ success: true });
});

// API: Login a user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    }

    res.json({ success: true, user });
});

// API: Update user data (e.g., after work)
app.post('/api/update-user', (req, res) => {
    const userData = req.body;
    const db = readDb();
    const index = db.users.findIndex(u => u.id === userData.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    db.users[index] = userData;
    writeDb(db);
    res.json({ success: true, user: db.users[index] });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});