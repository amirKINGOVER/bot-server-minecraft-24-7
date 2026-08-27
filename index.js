const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const mineflayer = require('mineflayer');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let minecraftBot = null;
let lastServerConfig = null; // لحفظ آخر إعدادات اتصال لاستخدامها في إعادة الاتصال

// تسجيل الأوامر الوهمية (Slash Commands)
const commands = [
  new SlashCommandBuilder()
    .setName('connected')
    .setDescription('إدخال بوت الماينكرافت إلى سيرفر جديد')
    .addStringOption(option => option.setName('ip').setDescription('آيبي السيرفر').setRequired(true))
    .addIntegerOption(option => option.setName('port').setDescription('بورت السيرفر').setRequired(true))
    .addStringOption(option => option.setName('name').setDescription('اسم البوت داخل السيرفر').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('disconnected')
    .setDescription('فصل بوت الماينكرافت وإخراجه من السيرفر'),

  new SlashCommandBuilder()
    .setName('reconnected')
    .setDescription('إعادة اتصال البوت بآخر سيرفر تم حفظه')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // تسجيل الأوامر في سيرفرك (تأكد من استبدال YOUR_CLIENT_ID و YOUR_GUILD_ID)
  const rest = new REST({ version: '10' }).setToken('YOUR_DISCORD_BOT_TOKEN');
  try {
    await rest.put(
      Routes.applicationGuildCommands('YOUR_CLIENT_ID', 'YOUR_GUILD_ID'),
      { body: commands },
    );
    console.log('تم تسجيل الأوامر بنجاح!');
  } catch (error) {
    console.error(error);
  }
});

// دالة إنشاء اتصال الماينكرافت
function connectMinecraft(ip, port, name, interaction) {
  if (minecraftBot) {
    interaction.reply('البوت متصل بالسيرفر مسبقاً! قم بقطع الاتصال أولاً.');
    return;
  }

  // حفظ الإعدادات لامر إعادة الاتصال
  lastServerConfig = { ip, port, name };

  interaction.reply(`جاري إدخال البوت باسم ${name} إلى ${ip}:${port}...`);

  minecraftBot = mineflayer.createBot({
    host: ip,
    port: port,
    username: name
  });

  minecraftBot.on('spawn', () => {
    interaction.followUp('تم دخول البوت الوهمي بنجاح وإبقاء السيرفر نشطاً!');
  });

  // منع الطرد بسبب الخمول
  const antiAfkInterval = setInterval(() => {
    if (minecraftBot) {
      minecraftBot.setControlState('jump', true);
      setTimeout(() => minecraftBot.setControlState('jump', false), 500);
    } else {
      clearInterval(antiAfkInterval);
    }
  }, 120000);

  minecraftBot.on('end', () => {
    minecraftBot = null;
  });

  minecraftBot.on('error', (err) => {
    console.log(err);
    interaction.followUp('حدث خطأ أثناء محاولة دخول البوت للسيرفر.');
    minecraftBot = null;
  });
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'connected') {
    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');
    const name = interaction.options.getString('name');
    connectMinecraft(ip, port, name, interaction);
  } 
  
  else if (commandName === 'disconnected') {
    if (!minecraftBot) {
      return interaction.reply({ content: 'البوت ليس متصلاً أصلاً!', ephemeral: true });
    }
    minecraftBot.quit();
    minecraftBot = null;
    await interaction.reply('تم قطع اتصال البوت وإخراجه من السيرفر.');
  } 
  
  else if (commandName === 'reconnected') {
    if (!lastServerConfig) {
      return interaction.reply({ content: 'لا توجد إعدادات سابقة محفوظة لإعادة الاتصال!', ephemeral: true });
    }
    if (minecraftBot) {
      minecraftBot.quit();
      minecraftBot = null;
    }
    connectMinecraft(lastServerConfig.ip, lastServerConfig.port, lastServerConfig.name, interaction);
  }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
