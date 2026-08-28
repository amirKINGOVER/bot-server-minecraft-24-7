const mineflayer = require('mineflayer');
const http = require('http');

// خادم ويب وهمي لإبقاء خدمة Render نشطة بلا توقف
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // كلمة المرور المسجلة

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
    version: '1.21.11' // تأكد من مطابقة هذا الإصدار تماماً لإصدار سيرفرك
  });

  // تسجيل الدخول فوراً عند الاتصال
  bot.once('spawn', () => {
    console.log('✅ تم دخول البوت واستقراره بنجاح!');
    
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1500);

    // نظام Anti-AFK متطور ومستمر (حركة عشوائية خفيفة لمنع الطرد نهائياً)
    setInterval(() => {
      if (bot && bot.player) {
        // تبديل اتجاه النظر خطوة بسيطة أو القفز لمنع رصد الخمول
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 400);
      }
    }, 25000); // كل 25 ثانية
  });

  // الرد الفعلي لو طالب النظام بتسجيل الدخول بأي وقت
  bot.on('message', (message) => {
    const text = message.toString();
    if (text.includes('/login') || text.includes('login')) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }
  });

  // إعادة الاتصال الذكي فوراً إذا طرد أو خرج البوت
  bot.on('kicked', (reason) => {
    console.log(`⚠️ تم طرد البوت، السبب: ${reason}`);
    attemptReconnect();
  });

  bot.on('end', () => {
    console.log('🔌 انقطع الاتصال بالخادم، جاري العودة...');
    attemptReconnect();
  });

  bot.on('error', (err) => {
    console.log(`❌ خطأ تقني: ${err.message}`);
  });
}

function attemptReconnect() {
  setTimeout(() => {
    console.log('🔄 محاولة الاتصال بالسيرفر مجدداً الآن...');
    createBot();
  }, 10000); // ينتظر 10 ثوانٍ فقط ثم يعاود الدخول تلقائياً
}

createBot();
