const mineflayer = require('mineflayer');
const http = require('http');

// 1. تشغيل خادم ويب وهمي لكي ينجح النشر على Render ولا يطفي البوت
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Minecraft Bot is Online 24/7!');
  res.end();
}).listen(process.env.PORT || 3000);

let bot = null;

// 2. كود بوت ماينكرافت
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
    console.log('تم دخول البوت واستقراره في السيرفر بنجاح!');
    
    // القفز التلقائي لمنع الطرد بسبب الخمول
    setInterval(() => {
      if (bot && bot.player) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 40000); 
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
  }, 25000); // انتظار 25 ثانية لتفادي الحظر من أترنوس
}

createBot();
