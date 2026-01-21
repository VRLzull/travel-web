import { pool } from "../config/db";

async function fixForeignKeys() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ensure bookings table has trip_date column
    const [bookingCols] = await conn.query(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings'"
    ) as any[];
    const bookingColSet = new Set<string>(Array.isArray(bookingCols) ? bookingCols.map((r: any) => String(r.COLUMN_NAME)) : []);
    if (!bookingColSet.has('trip_date')) {
      await conn.query("ALTER TABLE `bookings` ADD COLUMN `trip_date` DATE NULL AFTER `schedule_id`");
      console.log("[fixSchema] Added column bookings.trip_date");
    } else {
      console.log("[fixSchema] Column bookings.trip_date already exists");
    }

    // Detect target packages table
    const [pkgTables] = await conn.query(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND TABLE_NAME IN ('tour_packages','packages')"
    ) as any[];
    const hasTour = Array.isArray(pkgTables) && pkgTables.some((r: any) => r.TABLE_NAME === 'tour_packages');
    const targetTable = hasTour ? 'tour_packages' : 'packages';

    // Ensure optional columns exist on target packages table
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
      [targetTable]
    ) as any[];
    const colSet = new Set<string>(Array.isArray(cols) ? cols.map((r: any) => String(r.COLUMN_NAME)) : []);

    const addColumnIfMissing = async (name: string, ddl: string) => {
      if (!colSet.has(name)) {
        await conn.query(`ALTER TABLE \`${targetTable}\` ADD COLUMN \`${name}\` ${ddl}`);
        console.log(`[fixSchema] Added column ${targetTable}.${name}`);
      } else {
        console.log(`[fixSchema] Column ${targetTable}.${name} already exists`);
      }
    };

    await addColumnIfMissing('category', "VARCHAR(100) NULL");
    await addColumnIfMissing('short_description', "TEXT NULL");
    await addColumnIfMissing('itinerary', "TEXT NULL");
    await addColumnIfMissing('facilities', "TEXT NULL");

    // Helper to check and fix a single table FK
    const fixFK = async (table: string, fkName: string) => {
      const [fks] = await conn.query(
        "SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
        [table, fkName]
      ) as any[];
      const current = Array.isArray(fks) && fks[0];
      if (!current) return;
      const referenced = current.REFERENCED_TABLE_NAME;
      if (referenced !== targetTable) {
        await conn.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fkName}\``);
        await conn.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`package_id\`) REFERENCES \`${targetTable}\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        console.log(`[fixSchema] Updated FK ${table}.${fkName} to reference ${targetTable}(id)`);
      } else {
        console.log(`[fixSchema] FK ${table}.${fkName} already references ${targetTable}`);
      }
    };

    // Fix known FKs
    await fixFK('package_images', 'package_images_ibfk_1');
    await fixFK('package_schedules', 'package_schedules_ibfk_1');

    await conn.commit();
    console.log('[fixSchema] Foreign keys verified and updated where needed.');
  } catch (err: any) {
    await pool.query('ROLLBACK');
    console.error('[fixSchema] Error fixing schema:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

fixForeignKeys().then(() => process.exit(0)).catch(() => process.exit(1));
