const { Client, GatewayIntentBits } = require('discord.js');
const mineflayer = require('mineflayer');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let minecraftBot = null;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // أمر تشغيل بوت الماينكرافت
  if (message.content === '!start') {
    if (minecraftBot) {
      return message.reply('البوت داخل السيرفر بالفعل مسبقاً!');
    }

    message.reply('جاري إدخال البوت إلى سيرفر الماينكرافت...');

    minecraftBot = mineflayer.createBot({
      host: 'IP_SERVER_HERE', // اكتب آيبي سيرفرك هنا
      port: 25565,             // بورت السيرفر
      username: '247Bot'       // اسم الحساب الوهمي داخل السيرفر
    });

    minecraftBot.on('spawn', () => {
      message.channel.send('تم دخول البوت الوهمي بنجاح وإبقاء السيرفر نشطاً!');
    });

    // منع الطرد بسبب الخمول بتحريك البوت كل دقيقتين
    setInterval(() => {
      if (minecraftBot) {
        minecraftBot.setControlState('jump', true);
        setTimeout(() => minecraftBot.setControlState('jump', false), 500);
      }
    }, 120000);

    minecraftBot.on('end', () => {
      minecraftBot = null;
      message.channel.send('تم خروج بوت الماينكرافت من السيرفر.');
    });

    minecraftBot.on('error', (err) => {
      console.log(err);
      message.channel.send('حدث خطأ أثناء محاولة دخول البوت.');
    });
  }

  // أمر إيقاف بوت الماينكرافت
  if (message.content === '!stop') {
    if (!minecraftBot) {
      return message.reply('البوت ليس متصلاً بالسيرفر أصلاً!');
    }
    minecraftBot.quit();
    minecraftBot = null;
    message.reply('تم إيقاف وإخراج البوت من السيرفر.');
  }
});

// ضع توكن بوت الديسكورد هنا
client.login('YOUR_DISCORD_BOT_TOKEN');
