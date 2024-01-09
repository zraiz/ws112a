import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");


const app = new Application();


const router = new Router();


router
  .get('/', (ctx) => ctx.response.redirect('/public/index.html'))
  .get('/list', list)
  .get('/post/:id', show)
  .post('/post', create)
  .get('/public/(.*)', pub);


app.use(router.routes());
app.use(router.allowedMethods());


app.use(async (ctx, next) => {
  ctx.db = db;
  await next();
});


function query(sql) {
  let list = [];

  for (const [id, title, body] of db.query(sql)) {
    list.push({ id, title, body });
  }
  return list;
}


async function pub(ctx) {
  console.log('path=', ctx.request.url.pathname);
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/`,
    index: "index.html",
  });
}


async function list(ctx) {
  ctx.response.type = 'application/json';
  let posts = query("SELECT id, title, body FROM posts");
  ctx.response.body = posts;
}


async function show(ctx) {
  const id = ctx.params.id;
  let posts = query(`SELECT id, title, body FROM posts WHERE id=${id}`);
  let post = posts[0];
  if (!post) ctx.throw(404, 'Invalid post id');
  ctx.response.type = 'application/json';
  ctx.response.body = post;
}


async function create(ctx) {
  const body = ctx.request.body(); 
  if (body.type === "json") {
    let post = await body.value;
    post.id = post.length
    db.query("INSERT INTO posts (title, body) VALUES (?, ?)", [post.title, post.body]);
    ctx.response.body = 'success';
    console.log('create:save=>', post);
  }
}

console.log('Server run at http://127.0.0.1:8001');
await app.listen({ port: 8001 });