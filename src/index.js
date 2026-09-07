import { createClient } from "@libsql/client/web";

export default {
  async fetch(request, env) {
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    await db.execute(`
      CREATE TABLE IF NOT EXISTS labs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        whatsapp TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return Response.json({
      status: "ok",
      message: "Tabel labs berhasil dibuat",
    });
  },
};