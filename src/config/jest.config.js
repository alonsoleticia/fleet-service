module.exports = {
    testEnvironment: "node", // For Jest to use Node.js instead of JSDOM
    setupFilesAfterEnv: ["./test/supertest/setupTestDB.js"] //Ensure running the Mongo in memory when launching Jest
  };
  