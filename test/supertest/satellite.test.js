const request = require("supertest");
const app = require('./app.server'); // Importing Express app
const { Satellite } = require('../../src/models/satellite');
const testData = require('./satelliteData'); // Importing test data
const DEFAULT_URL = 'http://localhost:3000'

jest.setTimeout(20000);  // Avoid test failures due to timeout

describe("Satellites CRUD", () => {

  // Iterate over each test case
  testData.forEach((testCase) => {

    it(`${testCase.name} (HTTP ${testCase.method} ${testCase.endpoint})`, async () => {

      let res;

      // Construct the full URL with query parameters if they exist
      const url = new URL(testCase.endpoint, DEFAULT_URL);
      if (testCase.queryParams) {
        Object.keys(testCase.queryParams).forEach(key => {
          url.searchParams.append(key, testCase.queryParams[key]);
        });
      }

      // Make the HTTP request based on the method (POST, GET, etc.)
      if (testCase.method === "POST") {
        res = await request(app)
          .post(url.pathname)
          .send(testCase.body);
      } else if (testCase.method === "GET") {
        res = await request(app)
          .get(url.pathname);
      }

      // Verify the response status code
      expect(res.statusCode).toBe(testCase.expectedStatusCode);

      // Verify the response body
      if (testCase.expectedResponseBody) {
        const expectedResponse = testCase.expectedResponseBody;

        // If the response contains date fields, or dynamic UUIDs, they are ignored in these tests

        // Verify that non-date fields match the expected values
        //expect(res.body._id).toBe(expectedResponse._id);
        expect(res.body.name).toBe(expectedResponse.name);
        expect(res.body.slug).toBe(expectedResponse.slug);
        expect(res.body.status).toBe(expectedResponse.status);
        expect(res.body.company).toBe(expectedResponse.company);
        expect(res.body.creationOrigin).toBe(expectedResponse.creationOrigin);
        expect(res.body.orbit.longitude).toBe(expectedResponse.orbit.longitude);
        expect(res.body.orbit.latitude).toBe(expectedResponse.orbit.latitude);
        expect(res.body.orbit.inclination).toBe(expectedResponse.orbit.inclination);
        expect(res.body.orbit.height).toBe(expectedResponse.orbit.height);
        //expect(res.body.orbit._id).toBe(expectedResponse.orbit._id);
        expect(res.body.deleted).toBe(expectedResponse.deleted);
        expect(res.body.deletedAt).toBe(expectedResponse.deletedAt);
        expect(res.body.deletionOrigin).toBe(expectedResponse.deletionOrigin);
        //expect(res.body.updatedAt).toBe(expectedResponse.updatedAt);
      }

      // If it's a POST request, verify that the satellite is in the database
      if (testCase.method === "POST") {
        const satellite = await Satellite.findById(res.body._id);
        expect(satellite).not.toBeNull();
      }
    });
  });
});