const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// لوحة التحكم
router.get('/dashboard', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
});

// عرض نموذج تسجيل وكيل
router.get('/agents/register', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/agents/register.html'));
});

// تنفيذ تسجيل وكيل جديد
router.post('/agents/register', ensureAuthenticated, ensureAdmin, (req, res) => {
  const {
    firstName, middleName, lastName,
    nationality, residencyCountry, address,
    email, phone,
    bankName, bankBranch, accountNumber, ibanOrSwift,
    referrerID, internalNotes, status
  } = req.body;

  const filePath = path.join(__dirname, '../data/agents.json');

  let agents = [];
  if (fs.existsSync(filePath)) {
    agents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // تحديد المستوى حسب referrerID أو تلقائي A
  let level = 'A';
  if (referrerID && referrerID.startsWith('B')) level = 'C';
  else if (referrerID && referrerID.startsWith('A')) level = 'B';

  // توليد ID تلقائي
  const currentLevelAgents = agents.filter(a => a.level === level);
  const newID = `${level}${String(currentLevelAgents.length + 1).padStart(3, '0')}`;

  const newAgent = {
    agentID: newID,
    fullName: `${firstName} ${middleName || ''} ${lastName}`.trim(),
    firstName,
    middleName,
    lastName,
    nationality,
    residencyCountry,
    address,
    email,
    phone,
    bankName,
    bankBranch,
    accountNumber,
    ibanOrSwift,
    referrerID: referrerID || null,
    internalNotes: internalNotes || "",
    status: status || "نشط",
    level,
    joinDate: new Date().toISOString()
  };

  agents.push(newAgent);
  fs.writeFileSync(filePath, JSON.stringify(agents, null, 2), 'utf8');

  res.send(`
    <div style="padding:2rem;text-align:center;font-family:sans-serif;direction:rtl">
      <h2>✅ تم تسجيل الوكيل بنجاح</h2>
      <p>رقم الوكيل: <strong>${newID}</strong></p>
      <a href="/admin/agents/register" style="display:inline-block;margin-top:1rem;">🔙 تسجيل وكيل جديد</a>
    </div>
  `);
});

// قائمة العملاء
router.get('/clients', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/clients.json');
  try {
    const clients = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({
      totalClients: clients.length,
      totalCommission: clients.length * 300,
      totalPoints: clients.length * 5,
      clients
    });
  } catch {
    res.status(500).json({ error: 'فشل قراءة العملاء' });
  }
});

// تحديث حالة عميل
router.post('/update-status', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { id, status } = req.body;
  const filePath = path.join(__dirname, '../data/clients.json');

  try {
    const clients = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index].status = status;
      fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'عميل غير موجود' });
  } catch {
    res.status(500).json({ success: false, message: 'خطأ في الحفظ' });
  }
});

// صفحة المكافآت
router.get('/rewards', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/rewards.html'));
});

// عرض صفحة طلبات استبدال النقاط
router.get('/redeem-requests', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/redeem_requests.html'));
});

// بيانات طلبات الاستبدال
router.get('/redeem-requests/data', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/redeem_requests.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// تحديث حالة طلب الاستبدال
router.post('/redeem-requests/update', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { index } = req.body;
  const filePath = path.join(__dirname, '../data/redeem_requests.json');

  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data[index]) {
      data[index].status = "تم التنفيذ";
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return res.json({ success: true });
    }
  }

  res.status(400).json({ success: false });
});

module.exports = router;
// عرض صفحة قائمة الوكلاء
router.get('/agents/list', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/agents/list.html'));
});

// API بيانات الوكلاء
router.get('/agents/data', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/agents.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});
// صفحة إدارة المكافآت
router.get('/rewards', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/rewards.html'));
});

// بيانات المكافآت (من JSON)
router.get('/redeem-requests/data', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/redeem_requests.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});
// تنفيذ الاستبدال (POST)
router.post('/redeem-requests/redeem', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { agentID } = req.body;
  const filePath = path.join(__dirname, '../data/redeem_requests.json');
  const logPath = path.join(__dirname, '../data/redeem_log.json');

  if (!fs.existsSync(filePath)) return res.json({ success: false });

  const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updated = requests.filter(r => r.agentID !== agentID);
  const redeemed = requests.find(r => r.agentID === agentID);

  // تحديث ملف الطلبات
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

  // حفظ في سجل الاستبدالات
  let log = [];
  if (fs.existsSync(logPath)) {
    log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  }
  if (redeemed) {
    redeemed.redeemedAt = new Date().toISOString();
    log.push(redeemed);
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  }

  res.json({ success: true });
});
// عرض صفحة سجل الاستبدال
router.get('/redeem-log', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/redeem_log.html'));
});

// API بيانات سجل الاستبدال
router.get('/redeem-log/data', ensureAuthenticated, ensureAdmin, (req, res) => {
  const logPath = path.join(__dirname, '../data/redeem_log.json');
  if (fs.existsSync(logPath)) {
    const data = fs.readFileSync(logPath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});
// عرض صفحة العملاء
router.get('/clients', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/clients.json');
  try {
    const clients = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({
      totalClients: clients.length,
      totalCommission: clients.length * 300,
      totalPoints: clients.length * 5,
      clients
    });
  } catch {
    res.status(500).json({ error: 'فشل قراءة العملاء' });
  }
});

// عرض الواجهة
router.get('/manage-clients', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/clients.html'));
});

// تعديل حالة العميل
router.post('/update-status', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { id, status } = req.body;
  const filePath = path.join(__dirname, '../data/clients.json');

  try {
    const clients = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index].status = status;
      fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'عميل غير موجود' });
  } catch {
    res.status(500).json({ success: false, message: 'خطأ في الحفظ' });
  }
});
// عرض واجهة إدارة الوكلاء
router.get('/agents', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/agents.html'));
});

// بيانات الوكلاء
router.get('/agents/data', ensureAuthenticated, ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, '../data/agents.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// تحديث حالة وكيل
router.post('/update-agent', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { id, status, note } = req.body;
  const filePath = path.join(__dirname, '../data/agents.json');
  try {
    const agents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = agents.findIndex(a => a.id === id);
    if (index !== -1) {
      agents[index].status = status;
      agents[index].internalNote = note;
      fs.writeFileSync(filePath, JSON.stringify(agents, null, 2));
      return res.json({ success: true });
    }
    res.status(404).json({ success: false });
  } catch {
    res.status(500).json({ success: false });
  }
});
router.get('/agents/register-log', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/agent_register_log.html'));
});
router.get('/stats', ensureAuthenticated, ensureAdmin, (req, res) => {
  const clients = loadJson('clients.json');
  const agents = loadJson('agents.json');
  const redeemed = loadJson('redeem_log.json');
  const pendingRedeem = loadJson('redeem_requests.json');
  const commissions = loadJson('commissions.json');

  const activeClients = clients.filter(c => c.status === 'تم الشراء');
  const activeAgents = agents.filter(a => a.status === 'نشط');
  const totalCommission = activeClients.length * 300;

  const totalSales = activeClients.reduce((sum, c) => sum + (c.price || 0), 0);
  const totalSold = activeClients.length;

  const totalPointsUsed = redeemed.reduce((sum, r) => sum + (r.points || 0), 0);
  const totalPointsPending = pendingRedeem.reduce((sum, r) => sum + (r.points || 0), 0);

  const commissionPaid = commissions.filter(c => c.status === 'مدفوعة')
                                    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const commissionUnpaid = commissions.filter(c => c.status === 'غير مدفوعة')
                                      .reduce((sum, c) => sum + (c.amount || 0), 0);

  res.json({
    totalClients: clients.length,
    totalAgents: agents.length,
    activeClients: activeClients.length,
    activeAgents: activeAgents.length,
    totalSold,
    totalSales,
    totalCommission,
    totalPointsUsed,
    totalPointsPending,
    commissionPaid,
    commissionUnpaid
  });
});

// دالة مساعدة لقراءة ملفات JSON من مجلد data
function loadJson(fileName) {
  const filePath = path.join(__dirname, `../data/${fileName}`);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
}
