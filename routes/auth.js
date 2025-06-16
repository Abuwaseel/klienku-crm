const express = require('express');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// وكيل: صفحة تسجيل الدخول
router.get('/login/agent', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login_agent.html'));
});

// وكيل: معالجة تسجيل الدخول
router.post('/agent', (req, res) => {
  const { agentID, password } = req.body;

  const agentsPath = path.join(__dirname, '../data/agents.json');
  if (!fs.existsSync(agentsPath)) return res.send('❌ لا توجد بيانات وكلاء');

  const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
  const agent = agents.find(a => a.agentID === agentID && a.password === password);

  if (agent) {
    req.session.user = { id: agentID, role: 'agent' };
    res.redirect('/agent/dashboard');
  } else {
    res.send(`<div style="padding:2rem;font-family:sans-serif;direction:rtl;color:red">❌ بيانات الدخول غير صحيحة</div>`);
  }
});

module.exports = router;
// صفحة تسجيل دخول المدير
router.get('/login/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login_admin.html'));
});

// معالجة تسجيل دخول المدير
router.post('/admin', (req, res) => {
  const { username, password } = req.body;
  const adminsPath = path.join(__dirname, '../data/admins.json');

  if (!fs.existsSync(adminsPath)) return res.send('🚫 لا توجد بيانات مديرين');

  const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
  const admin = admins.find(a => a.username === username && a.password === password);

  if (admin) {
    req.session.user = { id: username, role: 'admin' };
    return res.redirect('/admin/dashboard');
  }

  res.send(`<div style="padding:2rem;font-family:sans-serif;direction:rtl;color:red">❌ بيانات الدخول غير صحيحة</div>`);
});

const bcrypt = require('bcrypt'); // تأكد من تثبيته
router.get('/change-password', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/auth/change_password.html'));
});

router.post('/change-password', ensureAuthenticated, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.session.user;
  const filePath = path.join(__dirname, '../data/admin.json'); // أو agents.json إذا كان وكيلًا

  if (!fs.existsSync(filePath)) return res.json({ success: false, message: 'تعذر الوصول إلى البيانات' });

  const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const index = users.findIndex(u => u.id === user.id);
  if (index === -1) return res.json({ success: false, message: 'المستخدم غير موجود' });

  const valid = await bcrypt.compare(oldPassword, users[index].password);
  if (!valid) return res.json({ success: false, message: 'كلمة المرور القديمة غير صحيحة' });

  const hashed = await bcrypt.hash(newPassword, 10);
  users[index].password = hashed;
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  res.json({ success: true });
});
