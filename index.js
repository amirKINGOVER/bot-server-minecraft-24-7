const mineflayer = require('mineflayer');
const http = require('http');

// 1. خادم ويب وهمي لإبقاء Render شغال
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;
const BOT_PASSWORD = 'amirBot123456'; // اكتب هنا كلمة السر الخاصة بالبوت

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

  bot.on('spawn', () => {
    console.log('تم دخول البوت، جاري محاولة تسجيل الدخول تلقائياً...');

    // محاولة التسجيل والدخول بعد ثانية من الدخول لتفادي الطرد بـ AuthMe
    setTimeout(() => {
      if (bot) {
        bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
        bot.chat(`/login ${BOT_PASSWORD}`);
      }
    }, 1500);

    // القفز التلقائي لمنع الطرد بسبب الخمول (Anti-AFK)
    setInterval(() => {
      if (bot && bot.player) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 40000); 
  });

  // الاستجابة التلقائية إذا طلب AuthMe كلمة السر في الشات
  bot.on('message', (message) => {
    const msgText = message.toString();
    if (msgText.includes('/login')) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    } else if (msgText.includes('/register')) {
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
  }, 25000);
}

createBot();
