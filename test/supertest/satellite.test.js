const request = require("supertest");
const app = require('./app.server'); // Importing Express app
const { Satellite } = require('../../src/models/satellite');

jest.setTimeout(20000);  // Avoid tests crash due to timeout


describe("Satellites CRUD", () => {
  it("It should create a new satellite", async () => {
    const res = await request(app)
      .post("/api/satellites")
      .send({ name: "GMV12SAT", slug: "GMV 12satellite", orbit: {
        "longitude": 45
      } });

    expect(res.statusCode).toBe(201);
    console.log("🔹 Testing Jest in debug mode: ", res.body);
    expect(res.body).toHaveProperty("_id");

    // Verify that the satellite has been successfully created in DB
    const satellite = await Satellite.findById(res.body._id);
    expect(satellite).not.toBeNull();
  });

  it("It should provide a list of satellite containing - empty because we are deleting evenrything between tests", async () => {
    const res = await request(app).get("/api/satellites");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); 
  });


});
