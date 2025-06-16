const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// مسار ملف البيانات
const dataFile = path.join(__dirname, '..', 'data', 'clients.json');

// وظيفة للمساعدة في قراءة البيانات
function readClients() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// وظيفة لكتابة البيانات
function writeClients(clients) {
    fs.writeFileSync(dataFile, JSON.stringify(clients, null, 2));
}

// 📨 استقبال بيانات العميل من النموذج
router.post('/submit', (req, res) => {
    const clients = readClients();
    
    const newClient = {
        id: Date.now(),
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        familyName: req.body.familyName || '',
        nationality: req.body.nationality || '',
        residenceCountry: req.body.residenceCountry || '',
        phone: req.body.phone || '',
        email: req.body.email || '',
        address: req.body.address || '',
        productType: req.body.productType || '',
        customRequest: req.body.customRequest || '',
        notes: req.body.notes || '',
        declaration: req.body.declaration === 'on',
        agentID: req.body.agentID || 'غير محدد',
        timestamp: new Date().toISOString()
    };

    clients.push(newClient);
    writeClients(clients);

    res.send(`<h2>✅ تم استلام بياناتك بنجاح!</h2><p>شكرًا لك ${newClient.firstName}</p>`);
});

module.exports = router;
