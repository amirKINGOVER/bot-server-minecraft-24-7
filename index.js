const mineflayer = require('mineflayer');
const http = require('http');

// خادم ويب وهمي لإبقاء Render نشطاً
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // كلمة المرور الخاصة بك

function createBot() {
  if (bot) {
    try {
      bot.quit();
    } catch (e) {}
  }

  bot = mineflayer.createBot({
    host: 'amirKINGSMP.aternos.me',
    port: 31310,
    username: 'amirKING_BOT',
    version: '1.20.1' // تأكد من مطابقة إصدار سيرفرك
  });

  bot.once('spawn', () => {
    console.log('✅ تم دخول البوت بنجاح، جاري تسجيل الدخول...');
    
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1500);

    // نظام Anti-AFK عشوائي ومتطور لمنع الرصد والطرد
    setInterval(() => {
      if (bot && bot.player) {
        const actions = ['jump', 'forward', 'back'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        bot.setControlState(randomAction, true);
        setTimeout(() => {
          bot.setControlState(randomAction, false);
        }, 600);
      }
    }, 20000); // يتخذ إجراء عشوائي كل 20 ثانية
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
  }, 8000); // إعادة اتصال سريعة جداً خلال 8 ثوانٍ فقط
}

createBot();
