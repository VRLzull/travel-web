import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { IUser, IAdminUser, UserRole } from '../../types/user';

// Extend IUser with password for internal use
interface IUserWithPassword extends IUser {
  password?: string;
}

type UserType = 'user' | 'admin';
const JWT_SECRET = env.jwtSecret;
const JWT_EXPIRES_IN = '7d';

// Helper untuk generate token JWT
const generateToken = (id: number, type: UserType, role: UserRole = 'user') => {
  return jwt.sign(
    { id, type, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register user biasa (tidak untuk admin)
export const registerUser = async (userData: Omit<IUser, 'id' | 'created_at'> & { password: string }) => {
  const { name, email, phone, password } = userData;
  
  // Cek apakah email sudah terdaftar
  const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Simpan user ke database dengan password_hash
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [name, email, phone, password_hash]
  ) as any;

  // Dapatkan user yang baru dibuat
  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  const newUser = (users as IUser[])[0];
  
  // Hapus password_hash dari response
  const { password_hash: _, ...userWithoutPassword } = newUser as any;
  
  // Generate token
  const token = generateToken(newUser.id, 'user');
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Login untuk user dan admin
export const loginUser = async (email: string, password: string, isAdmin: boolean = false) => {
  try {
    console.log('=== MULAI PROSES LOGIN ===');
    console.log('Email:', email, '| isAdmin:', isAdmin);

    // 1. Tentukan tabel yang akan di-query
    const table = isAdmin ? 'admin_users' : 'users';
    console.log('Menggunakan tabel:', table);

    // 2. Query ke database
    const [users] = await pool.query<any[]>(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    console.log('Hasil query:', JSON.stringify(users, null, 2));

    // 3. Validasi user ditemukan
    if (!Array.isArray(users) || users.length === 0) {
      console.log('❌ Email tidak ditemukan');
      throw new Error('Email atau password salah');
    }

    const user = users[0];
    console.log('✅ Data user ditemukan:', {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    });

    // 4. Cek password
    console.log('🔍 Memeriksa password...');
    
    if (!user.password_hash) {
      console.log('❌ Password hash tidak ditemukan');
      throw new Error('Email atau password salah');
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.log('❌ Password tidak cocok');
      throw new Error('Email atau password salah');
    }
    
    console.log('✅ Password valid');

    // 5. Generate token dengan role yang konsisten (UPPERCASE)
    const userRole = user.role ? user.role.toUpperCase() : 'USER';
    const token = generateToken(user.id, isAdmin ? 'admin' : 'user', userRole);
    console.log('🔑 Token berhasil dibuat');

    // 6. Siapkan data user untuk response
    const userData = isAdmin 
      ? { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: userRole,
          created_at: user.created_at
        }
      : { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          role: userRole,
          created_at: user.created_at
        };

    console.log('🎉 Login berhasil');
    return { user: userData, token };

  } catch (error: unknown) {
    let message = 'Email atau password salah';
    let stack: string | undefined;
    try {
      const e = error as { message?: string; stack?: string };
      message = e.message || message;
      stack = e.stack;
    } catch {}
    console.error('❌ Error saat login:', {
      message,
      stack
    });
    throw new Error('Email atau password salah');
  }
};

// Dapatkan data user yang sedang login
export const getMe = async (userId: number, userType: UserType) => {
  const table = userType === 'admin' ? 'admin_users' : 'users';
  const [users] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [userId]);
  
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('User tidak ditemukan');
  }

  const user = users[0] as any;
  
  // Hapus data sensitif
  if (userType === 'admin') {
    const { password_hash, ...userWithoutPassword } = user as IAdminUser;
    return {
      ...userWithoutPassword,
      role: user.role
    };
  } else {
    const { password, ...userWithoutPassword } = user as IUser & { password?: string };
    return {
      ...userWithoutPassword,
      role: 'user'
    };
  }
};

export const listUsers = async () => {
  const [rows] = await pool.query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
  return rows as IUser[];
};

export const resetUserPassword = async (userId: number, newPassword: string) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password minimal 6 karakter');
  }
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);
  const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]) as any;
  if (!result || result.affectedRows === 0) {
    throw new Error('User tidak ditemukan');
  }
  const [users] = await pool.query('SELECT id, name, email, phone, created_at FROM users WHERE id = ?', [userId]);
  const updated = (users as IUser[])[0];
  return updated;
};

export const bootstrapAdminUser = async (email: string, password: string, name: string = 'Administrator') => {
  if (!email || !password) {
    throw new Error('Email dan password diperlukan');
  }
  const [exist] = await pool.query<any[]>('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
  if (Array.isArray(exist) && exist.length > 0) {
    return { created: false, id: exist[0].id };
  }
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<any>('INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, password_hash, 'ADMIN']);
  return { created: true, id: result.insertId };
};
