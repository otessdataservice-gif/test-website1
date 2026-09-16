/**
 * End to end API test. Boots the real Express app against an in memory MongoDB,
 * then exercises registration, login, CRUD, validation and (most importantly)
 * authorization: user A must never reach user B's task.
 *
 * Run with:  npm run test:api
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-used-anywhere-else';
process.env.CLIENT_URL = 'http://localhost:5173';

const assert = require('assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let baseUrl;
let server;
let mongod;

const results = [];

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, body: json };
}

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
  }
}

async function main() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('taskflow_test');

  await mongoose.connect(process.env.MONGODB_URI);

  const app = require('../app');
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const User = require('../models/User');
  const Task = require('../models/Task');

  console.log(`\nTaskFlow API tests (in memory MongoDB at ${baseUrl})\n`);

  let tokenA;
  let tokenB;
  let taskA;

  await test('health endpoint responds', async () => {
    const res = await api('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'TaskFlow API is running');
  });

  await test('register creates a user and returns a token', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Ama Owusu', email: 'Ama@Example.COM', password: 'password123' },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data.token, 'no token returned');
    assert.strictEqual(res.body.data.user.email, 'ama@example.com', 'email not lowercased');
    assert.strictEqual(res.body.data.user.password, undefined, 'password leaked in response');
    tokenA = res.body.data.token;
  });

  await test('password is stored as a bcrypt hash, not plaintext', async () => {
    const user = await User.findOne({ email: 'ama@example.com' }).select('+password');
    assert.ok(user, 'user not found in MongoDB');
    assert.notStrictEqual(user.password, 'password123', 'password stored in plaintext');
    assert.ok(/^\$2[aby]\$/.test(user.password), `not a bcrypt hash: ${user.password}`);
  });

  await test('duplicate email is rejected', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Someone Else', email: 'ama@example.com', password: 'password123' },
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  await test('short password is rejected', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Short Pass', email: 'short@example.com', password: 'abc' },
    });
    assert.strictEqual(res.status, 400);
  });

  await test('invalid email is rejected', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Bad Email', email: 'not-an-email', password: 'password123' },
    });
    assert.strictEqual(res.status, 400);
  });

  await test('login with correct credentials returns a token', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: { email: 'ama@example.com', password: 'password123' },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.password, undefined);
    tokenA = res.body.data.token;
  });

  await test('login with the wrong password is rejected', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: { email: 'ama@example.com', password: 'wrong-password' },
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.message, 'Invalid email or password');
  });

  await test('login to an account that does not exist is rejected', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: { email: 'nobody@example.com', password: 'password123' },
    });
    assert.strictEqual(res.status, 401);
    // Same message as a wrong password: does not reveal which emails exist.
    assert.strictEqual(res.body.message, 'Invalid email or password');
  });

  await test('GET /auth/me returns the token owner', async () => {
    const res = await api('/auth/me', { token: tokenA });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, 'ama@example.com');
    assert.strictEqual(res.body.data.user.password, undefined);
  });

  await test('tasks require a token', async () => {
    const res = await api('/tasks');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await test('a tampered token is rejected', async () => {
    const res = await api('/tasks', { token: `${tokenA}x` });
    assert.strictEqual(res.status, 401);
  });

  await test('a token signed with the wrong secret is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ sub: new mongoose.Types.ObjectId().toString() }, 'some-other-secret');
    const res = await api('/tasks', { token: forged });
    assert.strictEqual(res.status, 401);
  });

  await test('an expired token is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ sub: new mongoose.Types.ObjectId().toString() }, process.env.JWT_SECRET, {
      expiresIn: '-1s',
    });
    const res = await api('/tasks', { token: expired });
    assert.strictEqual(res.status, 401);
    assert.match(res.body.message, /expired/i);
  });

  await test('create task persists to MongoDB', async () => {
    const res = await api('/tasks', {
      method: 'POST',
      token: tokenA,
      body: { title: 'Write the demo script', description: 'Cover auth and CRUD' },
    });
    assert.strictEqual(res.status, 201);
    taskA = res.body.data.task;
    assert.strictEqual(taskA.completed, false);

    const inDb = await Task.findById(taskA._id);
    assert.ok(inDb, 'task not found in MongoDB');
    assert.strictEqual(inDb.title, 'Write the demo script');
  });

  await test('task owner is taken from the token, not the request body', async () => {
    const strangerId = new mongoose.Types.ObjectId().toString();
    const res = await api('/tasks', {
      method: 'POST',
      token: tokenA,
      body: { title: 'Ownership check', user: strangerId },
    });
    assert.strictEqual(res.status, 201);
    assert.notStrictEqual(res.body.data.task.user, strangerId, 'body overrode the owner');

    await Task.findByIdAndDelete(res.body.data.task._id);
  });

  await test('empty title is rejected', async () => {
    const res = await api('/tasks', { method: 'POST', token: tokenA, body: { title: '   ' } });
    assert.strictEqual(res.status, 400);
  });

  await test('list returns only the caller tasks', async () => {
    const res = await api('/tasks', { token: tokenA });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.tasks.length, 1);
  });

  await test('update changes the task in MongoDB', async () => {
    const res = await api(`/tasks/${taskA._id}`, {
      method: 'PUT',
      token: tokenA,
      body: { title: 'Write the demo script v2', description: 'Auth, CRUD, dark mode' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.task.title, 'Write the demo script v2');

    const inDb = await Task.findById(taskA._id);
    assert.strictEqual(inDb.title, 'Write the demo script v2');
    assert.strictEqual(inDb.description, 'Auth, CRUD, dark mode');
  });

  await test('toggle flips completed and persists', async () => {
    const res = await api(`/tasks/${taskA._id}/toggle`, { method: 'PATCH', token: tokenA });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.task.completed, true);
    assert.strictEqual((await Task.findById(taskA._id)).completed, true);

    const back = await api(`/tasks/${taskA._id}/toggle`, { method: 'PATCH', token: tokenA });
    assert.strictEqual(back.body.data.task.completed, false);
    assert.strictEqual((await Task.findById(taskA._id)).completed, false);
  });

  await test('a malformed task id returns 400, not a crash', async () => {
    const res = await api('/tasks/not-a-real-id', { token: tokenA });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Invalid task id');
  });

  await test('a well formed id that does not exist returns 404', async () => {
    const res = await api(`/tasks/${new mongoose.Types.ObjectId().toString()}`, { token: tokenA });
    assert.strictEqual(res.status, 404);
  });

  await test('second user can register and log in', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Kofi Mensah', email: 'kofi@example.com', password: 'password456' },
    });
    assert.strictEqual(res.status, 201);
    tokenB = res.body.data.token;
  });

  // The authorization block: user B holds a valid token and knows A's task id.
  await test('user B cannot read user A task', async () => {
    const res = await api(`/tasks/${taskA._id}`, { token: tokenB });
    assert.strictEqual(res.status, 404);
  });

  await test('user B cannot update user A task', async () => {
    const res = await api(`/tasks/${taskA._id}`, {
      method: 'PUT',
      token: tokenB,
      body: { title: 'Hijacked' },
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual((await Task.findById(taskA._id)).title, 'Write the demo script v2');
  });

  await test('user B cannot toggle user A task', async () => {
    const res = await api(`/tasks/${taskA._id}/toggle`, { method: 'PATCH', token: tokenB });
    assert.strictEqual(res.status, 404);
    assert.strictEqual((await Task.findById(taskA._id)).completed, false);
  });

  await test('user B cannot delete user A task', async () => {
    const res = await api(`/tasks/${taskA._id}`, { method: 'DELETE', token: tokenB });
    assert.strictEqual(res.status, 404);
    assert.ok(await Task.findById(taskA._id), 'task was deleted by another user');
  });

  await test('user B list does not include user A tasks', async () => {
    const res = await api('/tasks', { token: tokenB });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.tasks.length, 0);
  });

  await test('owner can delete the task', async () => {
    const res = await api(`/tasks/${taskA._id}`, { method: 'DELETE', token: tokenA });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await Task.findById(taskA._id), null, 'task still in MongoDB');
  });

  await test('unknown route returns a clean 404 JSON body', async () => {
    const res = await api('/does-not-exist');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed\n`);

  await mongoose.disconnect();
  server.close();
  await mongod.stop();

  process.exit(failed.length ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Test run crashed:', err);
  try {
    await mongoose.disconnect();
    if (server) server.close();
    if (mongod) await mongod.stop();
  } catch {
    /* ignore cleanup errors */
  }
  process.exit(1);
});
