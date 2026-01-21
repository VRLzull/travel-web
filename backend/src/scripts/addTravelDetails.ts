import { pool } from "../config/db";

async function addTravelDetailsColumns() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [columns] = await conn.query(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings'"
    ) as any[];
    
    const columnNames = new Set(columns.map((c: any) => c.COLUMN_NAME));

    const newColumns = [
      { name: 'travel_time', type: 'VARCHAR(50)' },
      { name: 'landing_time', type: 'VARCHAR(50)' },
      { name: 'airline', type: 'VARCHAR(100)' },
      { name: 'flight_code', type: 'VARCHAR(50)' },
      { name: 'terminal', type: 'VARCHAR(50)' },
      { name: 'pickup_address', type: 'TEXT' },
      { name: 'dropoff_address', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' }
    ];

    for (const col of newColumns) {
      if (!columnNames.has(col.name)) {
        await conn.query(`ALTER TABLE \`bookings\` ADD COLUMN \`${col.name}\` ${col.type} NULL`);
        console.log(`Added column ${col.name} to bookings table`);
      } else {
        console.log(`Column ${col.name} already exists in bookings table`);
      }
    }

    await conn.commit();
    console.log("Database schema updated successfully");
  } catch (error) {
    await conn.rollback();
    console.error("Error updating database schema:", error);
  } finally {
    conn.release();
    process.exit();
  }
}

addTravelDetailsColumns();
