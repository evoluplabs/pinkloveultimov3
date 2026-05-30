export interface Env {
  PAGES_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pagesBase = (env.PAGES_URL ?? "https://pinkloveultimov3.pages.dev").replace(/\/$/, "");
    const url = new URL(request.url);
    const proxied = new Request(pagesBase + url.pathname + url.search, {
      method:   request.method,
      headers:  request.headers,
      body:     request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    });
    const response = await fetch(proxied);
    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    response.headers,
    });
  },
};
