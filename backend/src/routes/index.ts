import { Router } from 'express';
import * as dns from 'dns';
import * as https from 'https';
import { promisify } from 'util';
import packageRoutes from '../modules/packages/package.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import authRoutes from '../modules/auth/auth.routes';
import { env } from '../config/env';
import { Buffer } from 'buffer';
import { Client, LocalAuth } from 'whatsapp-web.js';
import puppeteer from 'puppeteer';
// @ts-ignore
import qrcode from 'qrcode-terminal';
import * as packageService from '../modules/packages/package.service';
import * as bookingService from '../modules/bookings/booking.service';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);

// API routes
router.use('/packages', packageRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payment', paymentRoutes);

let localClient: Client | null = null;
let botStatus = 'initializing';
let latestQrString: string | null = null;

// Endpoint untuk melihat status WA & QR Code
router.get('/whatsapp/status', (req, res) => {
  if (botStatus === 'authenticated') {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: green;">✅ WhatsApp Connected!</h1>
          <p>Bot is ready and authenticated.</p>
        </body>
      </html>
    `);
  }

  if (botStatus.startsWith('error')) {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ WhatsApp Error</h1>
          <p>Status: <strong>${botStatus}</strong></p>
          <p>The bot failed to initialize. Retrying automatically...</p>
          <script>setTimeout(() => window.location.reload(), 5000);</script>
        </body>
      </html>
    `);
  }

  if (latestQrString) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(latestQrString)}`;
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Scan WhatsApp QR Code</h1>
          <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
          <p>Status: <strong>${botStatus}</strong></p>
          <p>Please scan this with your WhatsApp (Linked Devices).</p>
          <script>setTimeout(() => window.location.reload(), 5000);</script>
        </body>
      </html>
    `);
  }

  return res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>WhatsApp Bot Status</h1>
        <p>Current Status: <strong>${botStatus}</strong></p>
        <p>Waiting for QR Code... (Page will reload)</p>
        <script>setTimeout(() => window.location.reload(), 3000);</script>
      </body>
    </html>
  `);
});

export function initializeLocalWhatsApp() {
  if (env.waProvider !== 'local') return;

  const init = async () => {
    try {
      console.log('Initializing Local WhatsApp Bot...');
      botStatus = 'initializing';

      // Multi-layer DNS Resolution Strategy
      console.log('Resolving web.whatsapp.com...');
      let whatsappIp = '';
      const resolveList = ['web.whatsapp.com','static.whatsapp.net','mmg.whatsapp.net','crashlogs.whatsapp.net','graph.whatsapp.com','api.whatsapp.com'];
      const resolvedRules: string[] = [];
      
      // 1. Try Native Node DNS
      try {
        console.log('Attempt 1: Native DNS Lookup');
        const lookup = promisify(dns.lookup);
        const result = await lookup('web.whatsapp.com', { family: 4 });
        whatsappIp = result.address;
        console.log(`✅ Native DNS success: ${whatsappIp}`);
      } catch (e) {
        console.error('❌ Native DNS failed:', (e as any).code);
        
        // 2. Try Cloudflare DoH (Direct IP)
        try {
          console.log('Attempt 2: Cloudflare DoH via 1.1.1.1');
          whatsappIp = await new Promise<string>((resolve, reject) => {
            const req = https.request({
              hostname: '1.1.1.1',
              port: 443,
              path: '/dns-query?name=web.whatsapp.com&type=A',
              method: 'GET',
              headers: { 'Accept': 'application/dns-json' },
              rejectUnauthorized: false // In case of weird cert issues in container
            }, (res) => {
              let data = '';
              res.on('data', chunk => data += chunk);
              res.on('end', () => {
                try {
                  const json = JSON.parse(data);
                  if (json.Answer && json.Answer.length > 0) {
                    // Find first A record
                    const aRecord = json.Answer.find((r: any) => r.type === 1);
                    if (aRecord) resolve(aRecord.data);
                    else reject('No A record found in DoH response');
                  } else {
                    reject('Empty DoH answer');
                  }
                } catch (err) {
                  reject('Failed to parse DoH response');
                }
              });
            });
            req.on('error', reject);
            req.end();
          });
          console.log(`✅ DoH success: ${whatsappIp}`);
        } catch (dohErr) {
          console.error('❌ DoH failed:', dohErr);
          
          // 3. Fallback to Hardcoded IPs (Meta/WhatsApp IPs)
          // These are common IPs for web.whatsapp.com. 
          // Note: These might change over time, but better than crashing.
          const FALLBACK_IPS = [
            '31.13.92.52',   // Meta
            '157.240.229.60', // Meta
            '157.240.198.60', // Meta
            '157.240.22.60'   // Meta
          ];
          whatsappIp = FALLBACK_IPS[Math.floor(Math.random() * FALLBACK_IPS.length)];
          console.log(`⚠️ Using Hardcoded Fallback IP: ${whatsappIp}`);
        }
      }

      const executablePath = process.env.CHROME_PATH || (typeof (puppeteer as any)?.executablePath === 'function' ? (puppeteer as any).executablePath() : undefined);
      const puppeteerArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--use-gl=swiftshader',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-ipv6',
        '--window-size=1366,768'
      ];

      if (whatsappIp) {
        resolvedRules.push(`MAP web.whatsapp.com ${whatsappIp}`);
      }
      for (const host of resolveList.slice(1)) {
        try {
          const lookup = promisify(dns.lookup);
          const r = await lookup(host, { family: 4 });
          resolvedRules.push(`MAP ${host} ${r.address}`);
        } catch {
          try {
            const ip = await new Promise<string>((resolve, reject) => {
              const req = https.request({
                hostname: '1.1.1.1',
                port: 443,
                path: `/dns-query?name=${host}&type=A`,
                method: 'GET',
                headers: { 'Accept': 'application/dns-json' },
                rejectUnauthorized: false
              }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                  try {
                    const json = JSON.parse(data);
                    const aRecord = (json.Answer || []).find((r: any) => r.type === 1);
                    if (aRecord) resolve(aRecord.data);
                    else reject('no_a');
                  } catch {
                    reject('parse');
                  }
                });
              });
              req.on('error', reject);
              req.end();
            });
            resolvedRules.push(`MAP ${host} ${ip}`);
          } catch {
            resolvedRules.push(`MAP ${host} ${whatsappIp}`);
          }
        }
      }
      if (resolvedRules.length > 0) {
        puppeteerArgs.push(`--host-resolver-rules=${resolvedRules.join(',')}`);
      }

      localClient = new Client({
        authStrategy: new LocalAuth({
          dataPath: env.waSessionPath || './session'
        }),
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014.0-alpha.html'
        },
        restartOnAuthFail: true,
        puppeteer: {
          executablePath,
          ignoreHTTPSErrors: true,
          args: puppeteerArgs,
          headless: 'new',
          defaultViewport: null,
          protocolTimeout: 300000
        }
      });

      localClient.on('qr', (qr) => {
        botStatus = 'qr_required';
        latestQrString = qr;
        console.log('QR RECEIVED. SCAN THIS WITH YOUR WHATSAPP:');
        qrcode.generate(qr, { small: true });
        console.log(`QR_STRING=${qr}`);
      });

      localClient.on('authenticated', () => {
        botStatus = 'authenticated';
        console.log('AUTHENTICATED: Session is valid!');
      });

      localClient.on('auth_failure', (msg) => {
        botStatus = 'auth_failure';
        console.error('AUTHENTICATION FAILURE:', msg);
      });

      localClient.on('ready', () => {
        botStatus = 'ready';
        console.log('Local WhatsApp Bot is READY!');
      });

      localClient.on('message', async (msg) => {
        console.log(`[WA] Message received from ${msg.from}: ${msg.body}`);
        const body = msg.body.trim();
        
        // ignore messages from status or groups if needed, but for now let's process all
        if (msg.from === 'status@broadcast') return;

        try {
          let reply = await keywordReply(body);
          
          // If no keyword match, check if it's a booking format or send help
          if (!reply) {
            if (body.includes(':')) {
              reply = buildReply(body);
            } else {
              // Fallback for casual messages
              reply = [
                'Maaf, saya tidak mengerti pesan tersebut. 🙏',
                '',
                'Ketik *Halo* untuk melihat daftar perintah yang tersedia.',
                'Atau ketik *Paket* untuk melihat layanan travel kami.'
              ].join('\n');
            }
          }
          
          if (reply && localClient) {
            console.log(`[WA] Sending reply to ${msg.from}...`);
            // Use client.sendMessage directly as it's often more stable than chat.sendMessage
            await localClient.sendMessage(msg.from, reply, { sendSeen: false });
            console.log(`[WA] Reply sent successfully to ${msg.from}`);
          }
        } catch (err) {
          console.error(`[WA] Error processing message from ${msg.from}:`, err);
        }
      });

      await localClient.initialize();
      console.log('WhatsApp Client initialized successfully!');

    } catch (error: any) {
      console.error('FAILED TO INITIALIZE WHATSAPP CLIENT:', error);
      const msg = typeof error === 'string' ? error : (error && error.message) ? error.message : 'unknown';
      botStatus = `error: ${msg}`;
      
      // Destroy existing client to free resources/lock before retrying
      if (localClient) {
        try {
          await localClient.destroy();
          console.log('Previous client instance destroyed.');
        } catch (destroyErr) {
          console.error('Error destroying client instance:', destroyErr);
        }
      }

      // Retry after 10 seconds
      console.log('Retrying in 10 seconds...');
      setTimeout(init, 10000);
    }
  };

  init();
}

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp: botStatus,
    timestamp: new Date().toISOString()
  });
});

router.get('/whatsapp/qr', (_req, res) => {
  if (!latestQrString) {
    return res.status(503).send('<html><body><h1>QR belum tersedia</h1><p>Status bot: ' + botStatus + '</p></body></html>');
  }
  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>WhatsApp QR</title>
<style>
body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto}
.box{padding:24px;border-radius:12px;background:#111827;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center;width:340px}
h1{font-size:20px;margin:0 0 12px}
.hint{opacity:.8;font-size:14px;margin-top:10px}
.time{opacity:.7;font-size:12px;margin-top:8px}
</style>
</head>
<body>
  <div class="box">
    <h1>Scan QR WhatsApp</h1>
    <div id="qrcode" style="margin:auto;width:280px;height:280px"></div>
    <div class="hint">Buka WhatsApp > Perangkat tertaut > Tautkan perangkat</div>
    <div class="time" id="t"></div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script>
    var el = document.getElementById('qrcode');
    var timeEl = document.getElementById('t');
    var current = ${JSON.stringify(latestQrString)};
    function render(text){
      el.innerHTML='';
      new QRCode(el,{text:text,width:280,height:280});
      var dt = new Date();
      timeEl.textContent = 'Updated ' + dt.toLocaleTimeString();
    }
    render(current);
    async function poll(){
      try{
        var r = await fetch('/api/whatsapp/qr.json',{cache:'no-store'});
        var j = await r.json();
        if(j && j.qr && j.qr !== current){
          current = j.qr;
          render(current);
        }
      }catch(e){}
    }
    setInterval(poll, 3000);
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

router.get('/whatsapp/qr.json', (_req, res) => {
  res.json({
    status: botStatus,
    qr: latestQrString
  });
});

router.get('/whatsapp/test', async (req, res) => {
  const { phone, text } = req.query;
  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone and text are required' });
  }

  if (!localClient || botStatus !== 'ready') {
    return res.status(503).json({ error: 'WhatsApp bot is not ready', status: botStatus });
  }

  try {
    const chatId = (phone as string).includes('@') ? (phone as string) : `${phone}@c.us`;
    const chat = await localClient.getChatById(chatId);
    await chat.sendMessage(text as string, { sendSeen: false });
    res.json({ success: true, message: `Message sent to ${chatId}` });
  } catch (error: any) {
    console.error('Test send failed:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/whatsapp/webhook', (req, res) => {
  const mode = String(req.query['hub.mode'] || '');
  const token = String(req.query['hub.verify_token'] || '');
  const challenge = String(req.query['hub.challenge'] || '');
  if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

router.post('/whatsapp/webhook', async (req, res) => {
  try {
    const entry = Array.isArray(req.body?.entry) ? req.body.entry[0] : undefined;
    const changes = Array.isArray(entry?.changes) ? entry.changes[0] : undefined;
    const value = changes?.value || {};
    const messages = Array.isArray(value.messages) ? value.messages : [];
    const msg = messages[0] || {};
    const from = msg.from || '';
    const text = (msg.text?.body || '').trim();
    const phoneId = value.metadata?.phone_number_id || env.whatsappPhoneNumberId;
    if (from && phoneId && text) {
      const reply = await keywordReply(text) || buildReply(text);
      await sendWhatsAppMessage(from, reply, phoneId);
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
});

router.post('/twilio/webhook', async (req, res) => {
  try {
    const body = String((req as any).body?.Body || '').trim();
    const from = String((req as any).body?.From || '').trim();
    if (env.waProvider !== 'twilio') {
      return res.sendStatus(200);
    }
    if (body && from) {
      const reply = await keywordReply(body) || buildReply(body);
      await sendWhatsAppMessage(from, reply);
    }
    
    // Return empty TwiML to avoid sending "OK" back to the user
    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    res.type('text/xml');
    res.send('<Response></Response>');
  }
});

async function keywordReply(t: string): Promise<string | null> {
  const s = t.toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || process.env.FRONTEND_URL || 'https://travelkamu.com';

  if (s.includes('order id:') || s.includes('order id :')) {
    const orderId = t.split(/order id\s*:/i)[1]?.trim().split('\n')[0];
    if (orderId) {
      try {
        // Cari booking berdasarkan order_id (bisa dari ID database atau Midtrans order_id)
        const booking = await bookingService.getBookingByOrderId(orderId);
        if (booking) {
          const isPaid = booking.payment_status === 'paid' || s.includes('sudah bayar');
          const statusText = isPaid ? 'LUNAS' : 'MENUNGGU PEMBAYARAN';
          const titleText = isPaid ? '✅ *Pembayaran Berhasil*' : '📄 *Detail Pesanan Anda*';
          
          const lines = [
            titleText,
            '',
            'Ini ringkasan pesanan Anda:',
            '',
            `📌 Layanan: ${booking.package?.title || 'Layanan Travel'}`,
            `📅 Tanggal: ${new Date(booking.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
            `👥 Durasi/Unit: ${booking.total_participants} Hari`,
          ];

          if (booking.travel_time) lines.push(`🕕 Jam Travel: ${booking.travel_time}`);
          if (booking.landing_time) lines.push(`🛬 Jam Landing: ${booking.landing_time}`);
          if (booking.airline) lines.push(`✈️ Maskapai: ${booking.airline}`);
          if (booking.flight_code) lines.push(`🎫 Kode Penerbangan: ${booking.flight_code}`);
          if (booking.terminal) lines.push(`🏢 Terminal: ${booking.terminal}`);
          if (booking.pickup_address) lines.push(`📍 Jemput: ${booking.pickup_address}`);
          if (booking.dropoff_address) lines.push(`🏁 Tujuan: ${booking.dropoff_address}`);
          if (booking.notes) lines.push(`📝 Catatan: ${booking.notes}`);

          lines.push(
            '',
            '📄 Detail lengkap bisa dilihat di:',
            `👉 ${baseUrl}/orders`,
            '',
            `*Status: ${statusText}*`,
            '',
            isPaid ? 'Terimakasih 🙏' : 'Silakan lakukan pembayaran ke sopir saat penjemputan.\n\nTerimakasih 🙏'
          );

          return lines.join('\n');
        }
      } catch (err) {
        console.error('Error fetching booking for bot:', err);
      }
    }
  }

  if (s.includes('halo') || s.includes('hi') || s === 'p' || s === 'ping') {
    return [
      '👋 *Halo! Selamat datang di Faraday Tour and Travel*',
      '',
      'Saya adalah asisten bot yang siap membantu Anda.',
      'Ketik salah satu kata kunci di bawah ini untuk bantuan:',
      '',
      '👉 *Paket* : Untuk melihat daftar layanan kami',
      '👉 *Harga* : Untuk melihat daftar harga terbaru',
      '👉 *Konfirmasi* : Untuk info status pesanan',
      '',
      'Atau Anda bisa langsung mengirimkan format pesanan yang didapat dari website.',
      '',
      'Ada yang bisa kami bantu? 🙏'
    ].join('\n');
  }

  if (s.includes('paket') || s.includes('travel') || s.includes('layanan')) {
    try {
      const packages = await packageService.getAllPackages();
      if (!packages || packages.length === 0) {
        return 'Maaf, saat ini belum ada layanan travel yang tersedia. 🙏';
      }

      const list = packages.slice(0, 5).map((p, i) => `${i + 1}️⃣ ${p.title}`).join('\n');
      
      return [
        '✈️ *Layanan Travel Tersedia Hari Ini*',
        '',
        list,
        '',
        '💡 Untuk melihat harga, jadwal lengkap & unit tersedia, silakan kunjungi:',
        `👉 ${baseUrl}/paket`,
        '',
        'Terimakasih 🙏'
      ].join('\n');
    } catch (err) {
      return `Silakan cek daftar layanan lengkap kami di: ${baseUrl}/paket`;
    }
  }

  if (s.includes('konfirmasi')) {
    return 'Pesanan Anda sudah kami terima. Silakan cek detailnya melalui link yang dikirimkan sebelumnya. Terimakasih 🙏';
  }
  
  if (s.includes('pricelist') || s.includes('harga') || s.includes('tarif') || s.includes('ongkos')) {
    return [
      '💰 *DAFTAR HARGA LAYANAN & SEWA*',
      '_(Harga berlaku per hari)_',
      '--------------------------------------',
      '📍 *Layanan Reguler:*',
      '• Malang - Surabaya: 150k /hari',
      '• Malang - Juanda: 150k /hari',
      '• Malang - Kediri: 130k /hari',
      '• Surabaya - Kediri: 180k /hari',
      '',
      '🚗 *Sewa Mobil:*',
      '• Lepas Kunci: 300k /hari',
      '• Mobil + Driver: 500k /hari',
      '_(Harga belum termasuk BBM, Tol, Parkir)_',
      '',
      '🚐 *Sewa Unit Besar:*',
      '• Hiace: 1,2 Jt /hari',
      '• Elf Long: 1 Jt /hari',
      '• Elf Short: 800k /hari',
      '',
      '💡 *Pesan Sekarang Melalui Website:*',
      `👉 ${baseUrl}/paket`,
      '',
      'Terimakasih 🙏'
    ].join('\n');
  }

  if (s.includes('malang') || s.includes('surabaya') || s.includes('juanda') || s.includes('kediri')) {
    return [
      '🚐 *Layanan Reguler (Malang, Juanda, Surabaya, Kediri)*',
      '',
      'Kami melayani rute tersebut setiap hari dengan armada terbaik.',
      'Untuk melihat jadwal keberangkatan dan pesan unit, silakan klik:',
      `👉 ${baseUrl}/paket`,
      '',
      'Atau ketik *Pricelist* untuk melihat daftar harga.'
    ].join('\n');
  }

  return null;
}

function buildReply(t: string): string {
  const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || process.env.FRONTEND_URL || 'https://travelkamu.com';
  
  const get = (label: string) => {
    const target = lines.find(l => l.toLowerCase().startsWith(label.toLowerCase()));
    return target ? target.split(':').slice(1).join(':').trim() : '';
  };

  const packageTitle = lines[0]?.replace(/\*/g, '') || 'Layanan Travel';
  const nama = get('nama');
  const tanggal = get('hari/tgl');
  const jam = get('jam travel') || get('jam jemput') || '06.00';
  const orang = get('jumlah orang') || get('peserta') || get('durasi') || get('unit') || '1';
  const metodeBayar = get('metode bayar');
  const orderId = get('order id') || 'TRX' + Math.floor(Math.random() * 10000);
  
  // Extra Travel Details from input text
  const landingTime = get('jam landing');
  const maskapai = get('maskapai');
  const kodePenerbangan = get('kode penerbangan');
  const terminal = get('terminal');
  const jemput = get('alamat penjemputan');
  const tujuan = get('alamat tujuan');
  const catatan = get('catatan');

  const isOnline = 
    metodeBayar.toLowerCase().includes('online') || 
    metodeBayar.toLowerCase().includes('midtrans') ||
    t.toLowerCase().includes('sudah bayar');
  
  const statusText = isOnline ? 'LUNAS' : 'MENUNGGU PEMBAYARAN';
  const titleText = isOnline ? '✅ *Pembayaran Berhasil*' : '📄 *Detail Pesanan Anda*';

  const replyLines = [
    titleText,
    '',
    'Ini ringkasan pesanan Anda:',
    '',
    `📌 Layanan: ${packageTitle}`,
    `📅 Tanggal: ${tanggal || '-'}`,
    `🕕 Jam Jemput: ${jam}`,
    `👥 Durasi/Unit: ${orang} Hari`,
  ];

  if (landingTime) replyLines.push(`🛬 Jam Landing: ${landingTime}`);
  if (maskapai) replyLines.push(`✈️ Maskapai: ${maskapai}`);
  if (kodePenerbangan) replyLines.push(`🎫 Kode Penerbangan: ${kodePenerbangan}`);
  if (terminal) replyLines.push(`🏢 Terminal: ${terminal}`);
  if (jemput) replyLines.push(`📍 Jemput: ${jemput}`);
  if (tujuan) replyLines.push(`🏁 Tujuan: ${tujuan}`);
  if (catatan) replyLines.push(`📝 Catatan: ${catatan}`);

  replyLines.push(
    '',
    '📄 Detail lengkap bisa dilihat di:',
    `👉 ${baseUrl}/orders`,
    '',
    `*Status: ${statusText}*`,
    '',
    isOnline ? 'Terimakasih 🙏' : 'Silakan lakukan pembayaran ke sopir saat penjemputan.\n\nTerimakasih 🙏'
  );

  return replyLines.join('\n');
}

async function sendWhatsAppMessage(to: string, text: string, phoneId?: string) {
  try {
    if (env.waProvider === 'local' && localClient) {
      const chatId = to.includes('@c.us') ? to : `${to.replace('whatsapp:', '').replace('+', '')}@c.us`;
      await localClient.sendMessage(chatId, text, { sendSeen: false });
      return;
    }

    if (env.waProvider === 'wati' || env.waProvider === 'respond') {
      // Logic for WATI/Respond.io (Generic API call)
      if (!env.chatbotApiEndpoint || !env.chatbotApiKey) return;
      await fetch(env.chatbotApiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': env.chatbotApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverNumber: to.replace('whatsapp:', ''), // clean number
          messageText: text
        })
      });
      return;
    }

    if (env.waProvider === 'twilio') {
      const accountSid = env.twilioAccountSid;
      const authToken = env.twilioAuthToken;
      const from = env.twilioWhatsAppFrom;
      if (!accountSid || !authToken || !from) return;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', from.startsWith('whatsapp:') ? from : `whatsapp:${from}`);
      params.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
      params.append('Body', text);
      const basic = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      return;
    }
    const pid = phoneId || env.whatsappPhoneNumberId;
    if (!pid) return;
    const url = `https://graph.facebook.com/v20.0/${pid}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/^whatsapp:/, ''),
        text: { body: text }
      })
    });
  } catch {
    return;
  }
}

export default router;
