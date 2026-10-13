import {health,publish,pageEvent,type PublisherEnv} from "./lib/publisher.mjs";
declare const BUILD_SHA: string;
const app = {
  fetch(req: Request, env: any) {
    if (new URL(req.url).pathname === "/build.json")
      return Response.json(
        { app: "portable-ai-state", commit: BUILD_SHA, syntheticOnly: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    return env.ASSETS.fetch(req).then((res: Response) => {
      const r = new Response(res.body, res);
      r.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      );
      r.headers.set("X-Content-Type-Options", "nosniff");
      r.headers.set("Cache-Control", "no-store, no-transform");
      return r;
    });
  },
};

export default {async fetch(req:Request,env:PublisherEnv & {ASSETS:any},context:any){
 const probe=health(req,'/healthz','state',BUILD_SHA);if(probe)return probe;
 const response=await app.fetch(req,env);if(pageEvent(req,response)==='app_open')publish(env,context,req,'app_open');return response;
}};
