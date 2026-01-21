import { Request, Response } from 'express';
import * as authService from './auth.service';
import { pool } from '../../config/db';
import { IUser } from '../../types/user';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    isAdmin?: boolean;
  };
}

interface AuthRequest extends Request {
  user?: IUser | any;
  userType?: 'user' | 'admin';
  role?: 'user' | 'ADMIN' | 'SUPERADMIN';
}

export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Harap isi nama, email, dan nomor telepon'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password harus diisi dan minimal 6 karakter'
      });
    }

    const result = await authService.registerUser({
      name,
      email,
      phone,
      password
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mendaftarkan user'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('\n=== 🚀 MENERIMA REQUEST LOGIN ===');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, isAdmin } = req.body;
    
    // Validasi input
    if (!email || !password) {
      console.log('❌ Validasi gagal: Email atau password kosong');
      return res.status(400).json({
        success: false,
        message: 'Harap isi email dan password'
      });
    }

    console.log('🔍 Memproses login untuk:', { email, isAdmin });
    
    try {
      const result = await authService.loginUser(
        email.toString().trim(),
        password.toString(),
        Boolean(isAdmin)
      );
      
      console.log(`✅ Login berhasil untuk: ${email}`);
      
      return res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error saat login:', {
        message: errorMessage,
        ...(error instanceof Error && { stack: error.stack })
      });
      
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error tidak terduga:', {
      message: errorMessage,
      ...(error instanceof Error && { stack: error.stack })
    });
    
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userType = req.userType || 'user';
    const user = await authService.getMe(req.user.id, userType);
    
    // Pastikan role dalam format UPPERCASE
    const userData = {
      ...user,
      role: user.role ? user.role.toUpperCase() : 'USER'
    };
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await authService.listUsers();
    res.json({ success: true, data: users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil daftar user' });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body as { password: string };
    if (!id || !password) {
      return res.status(400).json({ success: false, message: 'User ID dan password wajib diisi' });
    }
    const user = await authService.resetUserPassword(id, String(password));
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Gagal reset password user' });
  }
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    // Ambil tanggal reset dari settings
    const [settingsRows] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'revenue_reset_date'") as any;
    const resetDate = settingsRows?.[0]?.setting_value || '2000-01-01 00:00:00';

    const [usersCountRows] = await pool.query('SELECT COUNT(*) AS count FROM users') as any;
    const [ordersCountRows] = await pool.query('SELECT COUNT(*) AS count FROM bookings') as any;
    
    // Revenue difilter berdasarkan tanggal reset
    const [revenueRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) AS total FROM bookings WHERE payment_status = 'paid' AND created_at >= ?",
      [resetDate]
    ) as any;

    const [monthlyRows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS orders,
              SUM(CASE WHEN payment_status = 'paid' AND created_at >= ? THEN total_amount ELSE 0 END) AS revenue
       FROM bookings
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`,
      [resetDate]
    ) as any;
    const monthly = (monthlyRows as any[]).reverse();
    res.json({
      success: true,
      data: {
        total_users: usersCountRows?.[0]?.count || 0,
        total_orders: ordersCountRows?.[0]?.count || 0,
        total_revenue: Number(revenueRows?.[0]?.total || 0),
        monthly,
        reset_date: resetDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil statistik' });
  }
};

export const resetRevenue = async (_req: Request, res: Response) => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query(
      "UPDATE settings SET setting_value = ? WHERE setting_key = 'revenue_reset_date'",
      [now]
    );
    res.json({ success: true, message: 'Data pendapatan telah di-reset ke nol.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal reset pendapatan' });
  }
};

export const updateMyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req?.user?.id || 0);
    const { password } = (req.body || {}) as { password?: string };
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }
    const updated = await authService.resetUserPassword(userId, String(password));
    res.json({ success: true, data: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Gagal mengubah password' });
  }
};
