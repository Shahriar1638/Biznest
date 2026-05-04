import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// 1. PRISMA 7 CLIENT SETUP (With Driver Adapter)
// ==========================================
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// ==========================================
// 2. MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ==========================================
// 3. DATABASE "PING" (Connection Check)
// ==========================================
async function testConnection() {
  try {
    // This is the standard "ping" for Postgres
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Successfully connected to Supabase/Postgres!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

testConnection();

// ==========================================
// 4. ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.send('BizNest Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Server is active on port: ${port}`);
});

export default app;
