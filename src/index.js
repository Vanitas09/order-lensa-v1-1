import { createClient } from "@libsql/client/web";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    // =========================
    // CORS PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =========================
    // KONEKSI TURSO
    // =========================
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const url = new URL(request.url);

    // ==================================================
    //                         LENSA
    // ==================================================

    // =========================
    // GET SEMUA LENSA
    // GET /lenses
    // =========================
    if (request.method === "GET" && url.pathname === "/lenses") {
      const result = await db.execute(`
        SELECT id, name
        FROM lenses
        ORDER BY name
      `);

      return json({
        status: "ok",
        lenses: result.rows,
      });
    }

    // =========================
    // TAMBAH LENSA
    // POST /lenses
    // =========================
    if (request.method === "POST" && url.pathname === "/lenses") {
      const body = await request.json();
      const name = String(body.name || "").trim();

      if (!name) {
        return json({
          status: "error",
          message: "Nama lensa wajib diisi",
        }, 400);
      }

      try {
        const result = await db.execute({
          sql: `
            INSERT INTO lenses (name)
            VALUES (?)
          `,
          args: [name],
        });

        return json({
          status: "ok",
          message: "Lensa berhasil disimpan",
          id: Number(result.lastInsertRowid),
          name,
        }, 201);

      } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
          return json({
            status: "error",
            message: "Lensa tersebut sudah ada",
          }, 409);
        }

        throw error;
      }
    }

    // =========================
    // EDIT LENSA
    // PUT /lenses/:id
    // =========================
    if (
      request.method === "PUT" &&
      url.pathname.startsWith("/lenses/")
    ) {
      const id = url.pathname.split("/")[2];

      const body = await request.json();
      const name = String(body.name || "").trim();

      if (!name) {
        return json({
          status: "error",
          message: "Nama lensa wajib diisi",
        }, 400);
      }

      try {
        const result = await db.execute({
          sql: `
            UPDATE lenses
            SET name = ?
            WHERE id = ?
          `,
          args: [name, id],
        });

        if (Number(result.rowsAffected) === 0) {
          return json({
            status: "error",
            message: "Lensa tidak ditemukan",
          }, 404);
        }

        return json({
          status: "ok",
          message: "Lensa berhasil diubah",
          id: Number(id),
          name,
        });

      } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
          return json({
            status: "error",
            message: "Nama lensa tersebut sudah ada",
          }, 409);
        }

        throw error;
      }
    }

    // =========================
    // HAPUS LENSA
    // DELETE /lenses/:id
    // =========================
    if (
      request.method === "DELETE" &&
      url.pathname.startsWith("/lenses/")
    ) {
      const id = url.pathname.split("/")[2];

      const result = await db.execute({
        sql: `
          DELETE FROM lenses
          WHERE id = ?
        `,
        args: [id],
      });

      if (Number(result.rowsAffected) === 0) {
        return json({
          status: "error",
          message: "Lensa tidak ditemukan",
        }, 404);
      }

      return json({
        status: "ok",
        message: "Lensa berhasil dihapus",
        id: Number(id),
      });
    }

    // ==================================================
    //                          LAB
    // ==================================================

    // =========================
    // GET SEMUA LAB
    // GET /labs
    // =========================
    if (request.method === "GET" && url.pathname === "/labs") {
      const result = await db.execute(`
        SELECT id, name, whatsapp
        FROM labs
        ORDER BY name
      `);

      return json({
        status: "ok",
        labs: result.rows,
      });
    }

    // =========================
    // TAMBAH LAB
    // POST /labs
    // =========================
    if (request.method === "POST" && url.pathname === "/labs") {
      const body = await request.json();

      const name = String(body.name || "").trim();
      const whatsapp = String(body.whatsapp || "").trim();

      if (!name) {
        return json({
          status: "error",
          message: "Nama lab wajib diisi",
        }, 400);
      }

      if (!whatsapp) {
        return json({
          status: "error",
          message: "Nomor WhatsApp wajib diisi",
        }, 400);
      }

      try {
        const result = await db.execute({
          sql: `
            INSERT INTO labs (name, whatsapp)
            VALUES (?, ?)
          `,
          args: [name, whatsapp],
        });

        return json({
          status: "ok",
          message: "Lab berhasil disimpan",
          id: Number(result.lastInsertRowid),
          name,
          whatsapp,
        }, 201);

      } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
          return json({
            status: "error",
            message: "Nama lab tersebut sudah ada",
          }, 409);
        }

        throw error;
      }
    }

    // =========================
    // EDIT LAB
    // PUT /labs/:id
    // =========================
    if (
      request.method === "PUT" &&
      url.pathname.startsWith("/labs/")
    ) {
      const id = url.pathname.split("/")[2];

      const body = await request.json();

      const name = String(body.name || "").trim();
      const whatsapp = String(body.whatsapp || "").trim();

      if (!name) {
        return json({
          status: "error",
          message: "Nama lab wajib diisi",
        }, 400);
      }

      if (!whatsapp) {
        return json({
          status: "error",
          message: "Nomor WhatsApp wajib diisi",
        }, 400);
      }

      try {
        const result = await db.execute({
          sql: `
            UPDATE labs
            SET name = ?, whatsapp = ?
            WHERE id = ?
          `,
          args: [name, whatsapp, id],
        });

        if (Number(result.rowsAffected) === 0) {
          return json({
            status: "error",
            message: "Lab tidak ditemukan",
          }, 404);
        }

        return json({
          status: "ok",
          message: "Lab berhasil diubah",
          id: Number(id),
          name,
          whatsapp,
        });

      } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
          return json({
            status: "error",
            message: "Nama lab tersebut sudah ada",
          }, 409);
        }

        throw error;
      }
    }

    // =========================
    // HAPUS LAB
    // DELETE /labs/:id
    // =========================
    if (
      request.method === "DELETE" &&
      url.pathname.startsWith("/labs/")
    ) {
      const id = url.pathname.split("/")[2];

      const result = await db.execute({
        sql: `
          DELETE FROM labs
          WHERE id = ?
        `,
        args: [id],
      });

      if (Number(result.rowsAffected) === 0) {
        return json({
          status: "error",
          message: "Lab tidak ditemukan",
        }, 404);
      }

      return json({
        status: "ok",
        message: "Lab berhasil dihapus",
        id: Number(id),
      });
    }

    // =========================
    // ENDPOINT TIDAK DITEMUKAN
    // =========================
    return json({
      status: "error",
      message: "Endpoint tidak ditemukan",
    }, 404);
  },
};