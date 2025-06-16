const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { ensureAuthenticated, ensureAgent } = require('../middleware/authMiddleware');

// عرض لوحة تحكم الوكيل
router.get('/dashboard', ensureAuthenticated, ensureAgent, (req, res) => {
  const agentID = req.session.user.id;
  res.send(`
    <div style="font-family:sans-serif; direction:rtl; padding:2rem;">
      <h3>مرحبًا وكيل رقم: ${agentID}</h3>
      <p>✅ هذه لوحة التحكم الخاصة بك.</p>
      <ul>
        <li><a href="/agent/clients">📋 عملائي</a></li>
        <li><a href="/agent/rewards">🎁 نقاط الأحلام</a></li>
        <li><a href="/auth/logout">🚪 تسجيل الخروج</a></li>
      </ul>
    </div>
  `);
});

// عرض العملاء المرتبطين بالوكيل
router.get('/clients', ensureAuthenticated, ensureAgent, (req, res) => {
  const agentID = req.session.user.id;
  const clientsPath = path.join(__dirname, '../data/clients.json');
  if (!fs.existsSync(clientsPath)) return res.send('🚫 لا توجد بيانات عملاء');

  const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));
  const myClients = clients.filter(c => c.referrerAgentID === agentID);

  let html = `<h3 style="font-family:sans-serif; direction:rtl">📋 عملائي المرتبطين بالوكيل ${agentID}</h3>`;
  html += `<ul>`;
  myClients.forEach(c => {
    html += `<li>${c.firstName} ${c.lastName} - ${c.productType || 'منتج غير محدد'}</li>`;
  });
  html += `</ul>`;

  res.send(html);
});

// صفحة نقاط الأحلام (مثال بسيط)
router.get('/rewards', ensureAuthenticated, ensureAgent, (req, res) => {
  const agentID = req.session.user.id;
  const pointsPath = path.join(__dirname, '../data/dream_points.json');
  let points = 0;

  if (fs.existsSync(pointsPath)) {
    const allPoints = JSON.parse(fs.readFileSync(pointsPath, 'utf8'));
    const entry = allPoints.find(p => p.agentID === agentID);
    if (entry) points = entry.points;
  }

  res.send(`
    <h3 style="font-family:sans-serif; direction:rtl">🎁 نقاط الأحلام</h3>
    <p>وكيل رقم <strong>${agentID}</strong> لديك <strong>${points}</strong> نقطة</p>
  `);
});

module.exports = router;
