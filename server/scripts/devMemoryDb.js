/**
 * Runs the API against a throwaway in-memory MongoDB, for trying the app out
 * without installing MongoDB or creating an Atlas cluster.
 *
 *   npm run dev:memory
 *
 * Data is wiped when the process exits. Use a real MONGODB_URI for anything
 * you want to keep.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

const PORT = process.env.PORT || 5000;

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('taskflow_dev');

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-only-in-memory-secret';

  await mongoose.connect(uri);
  console.log('In-memory MongoDB ready (data is not saved when this process stops)');

  const server = app.listen(PORT, () => {
    console.log(`TaskFlow API listening on port ${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
