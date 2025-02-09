/**
 * This is exclusively used for Jest/supertest, which is intended to use a MongoDB in memory, avoiding using the real Mongo instance.
 * 
 * Before all the tests, it initialized MongoDB in memory and connects Mongoose.
 * In this file, it is defined everything which has to do with beforeAll, afterEach, etc, regarding the behaviour of the DB. For example, it can be defined to clean-up the DB before each individual test, or clean-up the DB just at the beginning.
 */

require('dotenv').config({ path: '.env.test' });  
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
