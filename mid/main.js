import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";
import * as render from './render.js';

const db = new DB("blog.db");
db.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    title TEXT,
    body TEXT
  )
`);
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT
  )
`);

const router = new Router();

router
  .get('/', list)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/contact/search', search)
  .get('/contact/new', add)
  .get('/contact/:id', show)
  .post('/contact', create)
  .post('/search', find)
  .get('/contact/delete/:id', deleteConfirmation)
  .post('/contact/delete/:id', deleteContact);

const app = new Application();
app.use(Session.initMiddleware());
app.use(router.routes());
app.use(router.allowedMethods());

// Utility function for handling SQL commands
function sqlcmd(sql, ...args) {
  try {
    const results = db.query(sql, ...args);
    console.log('sqlcmd: results=', results);
    return results;
  } catch (error) {
    console.log('sqlcmd error: ', error);
    throw error;
  }
}

// Utility function for querying posts from the database
function postQuery(sql, ...args) {
  const list = db.query(sql, ...args).map(([id, username, title, body]) => ({ id, username, title, body }));
  console.log('postQuery: list=', list);
  return list;
}

// Utility function for querying users from the database
function userQuery(sql, ...args) {
  const list = db.query(sql, ...args).map(([id, username, password, email]) => ({ id, username, password, email }));
  console.log('userQuery: list=', list);
  return list;
}

// Function to parse form body
async function parseFormBody(body) {
  const pairs = await body.value;
  return Object.fromEntries(pairs);
}

// Route handlers...

// Server setup...
const PORT = 8000;
console.log(`Server run at http://127.0.0.1:${PORT}`);
await app.listen({ port: PORT });
