module.exports = {
    rootDir: '../..',
    setupFilesAfterEnv: ["<rootDir>/test/supertest/setupTestDB.js"], //Ensure running the Mongo in memory when launching Jest
    testEnvironment: "node", // For Jest to use Node.js instead of JSDOM
    verbose: true,
  };
  