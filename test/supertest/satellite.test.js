const request = require("supertest");
const app = require('./app.server'); // Importing Express app
const { Satellite } = require('../../src/models/satellite');

describe("Satellites CRUD", () => {
  it("It should create a new satellite", async () => {
    const res = await request(app)
      .post("/api/satellites")
      .send({ name: "GMV11SAT", slug: "GMV 11satellite", orbit: {
        "longitude": 45
      } });

    expect(res.statusCode).toBe(201);
    console.log(res.statusCode.toString)
    expect(res.body).toHaveProperty("_id");

    // Verify that the satellite has been successfully created in DB
    const satellite = await Satellite.findById(res.body._id);
    expect(satellite).not.toBeNull();
  }, 20000); // test timeout: 20 secs (from terminal it's too slow)

  it("It should provide a list of satellite containing - empty because we are deleting evenrything between tests", async () => {
    const res = await request(app).get("/api/satellites");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); 
  }, 20000);  // test timeout: 20 secs (from terminal it's too slow)


});
