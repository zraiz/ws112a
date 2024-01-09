import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './js.js'

const posts = [
  {id:0, title:'sulaiman', body:'14022'},
  {id:1, title:'xeeasoxee', body:'12131415'}
];

const router = new Router();

router.get('/', list)
  .get("/news/search",search)
  .get('/new/new', add)
  .get('/new/:id', show)
  .post("/search",find)
  .post('/post', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function list(ctx) {
  ctx.response.body = await render.list(posts);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const id = ctx.params.id;
  const post = posts[id];
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function search(ctx) {
  ctx.response.body = await render.search();
}

async function find(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    const pairs = await body.value
    let name,number
    for(let i of pairs)
      name=i
    const found = posts.some(post => post.title === name[1]);

    if (found) {
      for(let i of posts){
        if(i.title==name[1])
          number=i.body
      }
      ctx.response.body = await render.found(name[1],number);
    } else {
      ctx.response.body = await render.not_found();
    }
  }
}

async function create(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    const pairs = await body.value
    const post = {}
    for (const [key, value] of pairs) {
      post[key] = value
    }
    console.log('post=', post)
    const id = posts.push(post) - 1;
    post.created_at = new Date();
    post.id = id;
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });