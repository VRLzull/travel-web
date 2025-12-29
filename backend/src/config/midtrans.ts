import midtransClient from "midtrans-client";
import { env } from "./env";

// Validasi environment variables
if (!env.midtransServerKey || !env.midtransClientKey) {
  console.error('ERROR: Midtrans environment variables are not properly set!');
  console.log('MIDTRANS_SERVER_KEY length:', env.midtransServerKey?.length || 0);
  console.log('MIDTRANS_CLIENT_KEY length:', env.midtransClientKey?.length || 0);
  throw new Error('Midtrans configuration is invalid. Please check your .env file');
}

// Konfigurasi Midtrans
const midtransConfig = {
  isProduction: env.midtransIsProduction,
  serverKey: env.midtransServerKey,
  clientKey: env.midtransClientKey,
  baseUrl: env.midtransIsProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com',
  httpClient: {
    httpRequest: {
      timeout: 15000, // 15 detik timeout
      rejectUnauthorized: false, // Hanya untuk testing
      secureProtocol: 'TLS_method',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  }
};

// Log konfigurasi (tanpa menampilkan seluruh key)
console.log('Midtrans Configuration:');
console.log('- Server Key:', env.midtransServerKey ? '***' + env.midtransServerKey.slice(-4) : 'not set');
console.log('- Client Key:', env.midtransClientKey ? '***' + env.midtransClientKey.slice(-4) : 'not set');
console.log('- Environment:', env.midtransIsProduction ? 'Production' : 'Sandbox');

export const midtransSnap = new midtransClient.Snap(midtransConfig);
