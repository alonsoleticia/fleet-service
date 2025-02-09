const request = require("supertest");
const app = require("../../src/app"); // Importing Express app
const app = require("../../src/models/Satellite");

describe("Satellites CRUD", () => {
  it("✅ It should create a new satellite", async () => {
    const res = await request(app)
      .post("/api/satellites")
      .send({ name: "GMVSAT", slug: "GMV satellite", orbit: {
        "longitude": 45
      } });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");

    // Verify that the satellite has been successfully created in DB
    const satellite = await Satellite.findById(res.body._id);
    expect(satellite).not.toBeNull();
  });

  it("✅ It should provide a list of satellite containing - empty", async () => {
    const res = await request(app).get("/api/satellites");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); // Al inicio no hay datos
  });
});
