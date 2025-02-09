/**
 * 📌 This setup file is exclusively used for Jest & Supertest.
 * It runs a MongoDB instance in memory, preventing any interaction with the real database.
 *
 * 🛠️ How it works:
 * - Before all tests: Initializes an in-memory MongoDB instance and connects Mongoose.
 * - After each test: Cleans up collections to ensure data isolation.
 * - After all tests: Closes the database connection and stops the in-memory server.
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

console.log("🔧 setupTestDB.js has been successfully injected!");

let mongoServer;

beforeAll(async () => {
  console.log("🚀 Starting MongoMemoryServer...");
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`🔗 Connected to in-memory MongoDB at: ${mongoUri}`);

  // Ensure the database is clean before any test runs
  await mongoose.connection.dropDatabase();
  console.log("✅ Database dropped before tests.");

});

afterAll(async () => {
  console.log("🛑 Stopping MongoMemoryServer...");
  await mongoose.connection.dropDatabase(); // Clean up database
  await mongoose.connection.close(); // Close connection
  await mongoServer.stop(); // Stop in-memory server
  console.log("✅ MongoMemoryServer stopped.");
});

afterEach(async () => {
  console.log("🧹 Cleaning up database collections...");
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  console.log("✅ Collections cleared.");
});
