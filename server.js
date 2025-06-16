// إعداد المتطلبات الأساسية
const express = require('express');
const path = require('path');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// بدء التطبيق
const app = express();

// إعداد الجلسات
app.use(session({
  secret: 'klienku-secret',
  resave: false,
  saveUninitialized: true
}));

// إعداد الميدل وير
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم ملفات ثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد Swagger لعدة لغات
const languages = ['ar', 'en', 'id'];
languages.forEach(lang => {
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `Klienku CRM API (${lang.toUpperCase()})`,
        version: '1.0.0',
      },
    },
    apis: [path.join(__dirname, `docs/swagger_${lang}.yaml`)]
  });
  app.use(`/api-docs/${lang}`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
});

// تقديم نموذج العميل حسب اللغة
app.get('/form/:lang', (req, res) => {
  const lang = req.params.lang;
  const filePath = path.join(__dirname, 'views', lang, 'form.html');
  res.sendFile(filePath, err => {
    if (err) res.status(404).send('النموذج غير متوفر لهذه اللغة.');
  });
});

// تقديم الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`
    <h2>🎉 مرحبًا بك في نظام Klienku CRM</h2>
    <p>اختر اللغة لعرض النموذج:</p>
    <ul>
        <li><a href="/form/ar">النموذج بالعربية</a></li>
        <li><a href="/form/en">Form in English</a></li>
        <li><a href="/form/id">Form Bahasa Indonesia</a></li>
    </ul>
    <p>📄 <a href="/api-docs/ar">توثيق API - العربية</a></p>
    <p>📄 <a href="/api-docs/en">API Docs - English</a></p>
    <p>📄 <a href="/api-docs/id">Dokumentasi API - Indonesia</a></p>
  `);
});

// استيراد المسارات
const clientRoutes = require('./routes/clients');
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// استخدام المسارات
app.use('/clients', clientRoutes);
app.use('/agent', agentRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// بدء السيرفر
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
  console.log(`📄 API Docs: /api-docs/ar /api-docs/en /api-docs/id`);
  console.log(`📝 نماذج: /form/ar /form/en /form/id`);
  console.log(`👤 تسجيل دخول: /auth/login`);
});
