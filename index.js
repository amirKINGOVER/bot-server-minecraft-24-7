const mineflayer = require('mineflayer');
const http = require('http');

// 1. خادم ويب وهمي لإبقاء Render شغال
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // كلمة المرور الخاصة بالبوت

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
    version: false 
  });

  // تسجيل الدخول فور الاتصال بالسيرفر وقبل حتى اكتمال الـ Spawn لتفادي الطرد
  bot.once('login', () => {
    console.log('تم الاتصال بالسيرفر، جاري إرسال بيانات الدخول...');
    setTimeout(() => {
      if (bot) {
        bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 500);
  });

  bot.on('spawn', () => {
    console.log('تم دخول البوت واستقراره في السيرفر بنجاح!');

    // إرسال أمر الـ login مرة أخرى للاحتياط بعد الدخول الكامل
    setTimeout(() => {
      if (bot) {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1000);

    // القفز التلقائي لمنع الطرد بسبب الخمول (Anti-AFK)
    setInterval(() => {
      if (bot && bot.player) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 30000); 
  });

  // الاستجابة الفورية لأي رسالة تطلب تسجيل الدخول من AuthMe
  bot.on('message', (message) => {
    const msgText = message.toString();
    if (msgText.includes('/login') || msgText.includes('login')) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    } else if (msgText.includes('/register') || msgText.includes('register')) {
      bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
    }
  });

  bot.on('kicked', (reason) => {
    console.log(`تم طرد البوت: ${reason}`);
    reconnect();
  });

  bot.on('end', () => {
    console.log('انقطع الاتصال، جاري إعادة المحاولة...');
    reconnect();
  });

  bot.on('error', (err) => {
    console.log(`خطأ: ${err.message}`);
  });
}

function reconnect() {
  setTimeout(() => {
    console.log('إعادة الاتصال الآن...');
    createBot();
  }, 15000); // محاولة إعادة الاتصال خلال 15 ثانية فقط
}

createBot();
