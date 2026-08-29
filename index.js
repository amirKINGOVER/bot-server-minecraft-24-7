const mineflayer = require('mineflayer');
const http = require('http');

// خادم ويب وهمي لتشغيل البوت 24/7 على Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Bot is active!');
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

  // إنشاء الاتصال بالسيرفر الجديد والإصدار
  bot = mineflayer.createBot({
    host: 'hypixel-cixC.aternos.me',
    port: 55790,
    username: 'amirKING_BOT',
    version: '1.21.11' // غيرها إلى رقم إصدار سيرفرك الحالي بدقة إذا تغير
  });

  // تسجيل الدخول فوراً بمجرد ظهور رسالة أو دخول السيرفر
  bot.on('spawn', () => {
    console.log('🤖 تم الاتصال بنجاح، جاري تسجيل الدخول...');
    
    // تنفيذ أمر الدخول بسرعة لتجنب الطرد
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 500); // تقليل وقت الانتظار إلى نصف ثانية فقط

    // حركة خفيفة لمنع الطرد بسبب الخمول (AFK)
    setInterval(() => {
      if (bot && bot.player) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, 300);
      }
    }, 30000); // كل 30 ثانية
  });

  bot.on('message', (message) => {
    const text = message.toString();
    if (text.includes('/login') || text.includes('register')) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }
  });

  bot.on('kicked', (reason) => {
    console.log(`⚠️ تم طرد البوت، السبب: ${reason}`);
    reconnect();
  });

  bot.on('end', () => {
    console.log('🔌 انقطع الاتصال، جاري إعادة الدخول السريع...');
    reconnect();
  });

  bot.on('error', (err) => {
    console.log(`❌ خطأ: ${err.message}`);
  });
}

function reconnect() {
  setTimeout(() => {
    createBot();
  }, 4000); // تقليل وقت إعادة المحاولة إلى 4 ثوانٍ فقط ليدخل بسرعة
}

createBot();
