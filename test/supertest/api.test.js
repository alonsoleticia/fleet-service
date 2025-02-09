const request = require("supertest");
const app = require("../../src/app"); // Importing Express app

describe("API Endpoints", () => {
  it("🔍 Debería obtener todos los elementos", async () => {
    const res = await request(app).get("/api/items");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("➕ Debería crear un nuevo elemento", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "Nuevo Item", price: 100 });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
  });

  it("🗑️ Debería eliminar un elemento", async () => {
    const res = await request(app).delete("/api/items/ID_DEL_ITEM");
    expect(res.statusCode).toEqual(200);
  });
});
