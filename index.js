const mineflayer = require('mineflayer');
const http = require('http');

// خادم وهمي لإبقاء البوت نشطاً على Render طوال اليوم
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Bot is running 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // استبدل كلمة المرور إذا كانت مختلفة

function createBot() {
  if (bot) {
    try {
      bot.quit();
    } catch (e) {}
  }

  // إنشاء اتصال البوت بالبيانات الصحيحة والسيرفر الجديد
  bot = mineflayer.createBot({
    host: 'hypixel-cixC.aternos.me',
    port: 48340,
    username: 'amirKING_BOT',
    version: '1.21.11'
  });

  bot.once('spawn', () => {
    console.log('✅ تم دخول البوت بنجاح إلى السيرفر!');
    
    // تسجيل الدخول بعد دخول السيرفر بثانية ونصف
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1500);

    // نظام الحركة العشوائية لمنع الطرد بسبب الـ AFK
    setInterval(() => {
      if (bot && bot.player) {
        const actions = ['jump', 'forward', 'back'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        bot.setControlState(randomAction, true);
        setTimeout(() => {
          bot.setControlState(randomAction, false);
        }, 500);
      }
    }, 25000); // تحرك كل 25 ثانية
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
    console.log('🔌 انقطع الاتصال، جاري إعادة المحاولة...');
    reconnect();
  });

  bot.on('error', (err) => {
    console.log(`❌ خطأ في الاتصال: ${err.message}`);
  });
}

function reconnect() {
  setTimeout(() => {
    console.log('🔄 إعادة محاولة الدخول...');
    createBot();
  }, 10000); // إعادة المحاولة بعد 10 ثوانٍ
}

createBot();
