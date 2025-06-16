const fs = require('fs');

const clients = JSON.parse(fs.readFileSync('./data/clients.json', 'utf8'));
const agents = JSON.parse(fs.readFileSync('./data/agents.json', 'utf8'));

const commissions = {};
const dreamPoints = {};
const COMMISSION = 300;
const DREAM_POINTS = 5;

clients.forEach(client => {
  if (client.status === 'اكتملت عملية الشراء') {
    const agentID = client.agentID;

    // 1. عمولة مباشرة
    commissions[agentID] = (commissions[agentID] || 0) + COMMISSION;

    // 2. نقاط الأحلام للوكيل الأعلى
    const agentData = agents.find(a => a.agentID === agentID);
    if (agentData && agentData.parentAgentID) {
      const parentID = agentData.parentAgentID;
      dreamPoints[parentID] = (dreamPoints[parentID] || 0) + DREAM_POINTS;
    }
  }
});

// حفظ النتائج
fs.writeFileSync('./data/commissions.json', JSON.stringify(commissions, null, 2), 'utf8');
fs.writeFileSync('./data/dream_points.json', JSON.stringify(dreamPoints, null, 2), 'utf8');

console.log("✅ تم احتساب العمولات والنقاط بنجاح!");
