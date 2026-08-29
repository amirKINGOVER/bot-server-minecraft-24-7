const mineflayer = require('mineflayer');
const http = require('http');

// خادم ويب وهمي لإبقاء Render نشطاً 24/7
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // كلمة المرور الخاصة بسيرفرك

function createBot() {
  if (bot) {
    try {
      bot.quit();
    } catch (e) {}
  }

  // استخدام عنوان IP والـ Port الجديدين مع إصدار 1.21.1
  bot = mineflayer.createBot({
    host: 'amirKINGSMP-xbj9.aternos.me',
    port: 48340,
    username: 'amirKING_BOT',
    version: '1.21.11'
  });

  bot.once('spawn', () => {
    console.log('✅ تم دخول البوت بنجاح، جاري تسجيل الدخول...');
    
    // تسجيل الدخول تلقائياً بعد دخول السيرفر
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1500);

    // نظام Anti-AFK عشوائي ومتطور لمنع رصد البوت وطرده
    setInterval(() => {
      if (bot && bot.player) {
        const actions = ['jump', 'forward', 'back'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        bot.setControlState(randomAction, true);
        setTimeout(() => {
          bot.setControlState(randomAction, false);
        }, 600);
      }
    }, 20000); // تنفيذ حركة عشوائية كل 20 ثانية
  });

  bot.on('message', (message) => {
    const text = message.toString();
    if (text.includes('/login') || text.includes('login')) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }
  });

  bot.on('kicked', (reason) => {
    console.log(`⚠️ تم طرد البوت، السبب: ${reason}`);
    reconnect();
  });

  bot.on('end', () => {
    console.log('🔌 انقطع الاتصال، جاري إعادة الدخول فوراً...');
    reconnect();
  });

  bot.on('error', (err) => {
    console.log(`❌ خطأ: ${err.message}`);
  });
}

function reconnect() {
  setTimeout(() => {
    console.log('🔄 محاولة الاتصال مجدداً...');
    createBot();
  }, 8000); // إعادة محاولة الدخول خلال 8 ثوانٍ فقط لتجنب إغلاق السيرفر
}

createBot();
