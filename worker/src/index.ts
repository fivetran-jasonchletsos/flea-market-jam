import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
const MAX_IMAGES_PER_ITEM = 4;
const MAX_ITEMS_PER_PUBLISH = 8;
const MAX_PUBLISH_IMAGES_PER_ITEM = 3;
const MAX_IMAGE_BYTES = 1_500_000;
const CATEGORIES = ["cobalt-glass", "jewelry", "antique", "other"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_GUIDE: Record<Category, string> = {
  "cobalt-glass":
    "Cobalt blue glass. Reproductions are very common. Look for mold seams, pontil marks, base wear, weight, color evenness, and maker marks (Hazel-Atlas, Anchor Hocking, Fire-King, Fenton, Cambridge, Blenko, Bristol). If the base or any mark is not visible, say so in needs_more_photos. Do not claim a piece is old unless the photos give real evidence.",
  jewelry:
    "Jewelry. Look for hallmarks and stamps (925, sterling, 10k, 14k, 18k, 585, 750, PLAT, GF, GP, RGP, HGE) and maker marks. You cannot confirm metal content or whether a stone is natural from a photo, so state that limit plainly. If hallmarks are not legible, ask for close-ups in needs_more_photos. Separate fine jewelry from costume jewelry.",
  antique:
    "Antiques and vintage household items. Look for age clues: construction, joinery, tool marks, hardware, finish and patina, labels and stamps. Give a style and era range, not a single year. Note condition issues that change value and whether the item is heavy or fragile to ship.",
  other: "General secondhand item. Identify what you can and say what you cannot.",
};

interface Env {
  ANTHROPIC_API_KEY: string;
  PASSCODE?: string;
  GITHUB_TOKEN: string;
  LIMITS: KVNamespace;
  ALLOWED_ORIGIN: string;
  GH_REPO: string;
  GH_BRANCH: string;
  DAILY_IDENTIFY_CAP: string;
  DAILY_PUBLISH_CAP: string;
  PER_VISITOR_IDENTIFY_CAP: string;
  PER_VISITOR_PUBLISH_CAP: string;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "item_name", "item_type", "era_guess", "materials", "maker_guess", "marks_seen",
    "condition_notes", "reproduction_risk", "authenticity_flags", "needs_more_photos",
    "price_low", "price_high", "quick_sale_price", "price_confidence", "price_reasoning",
    "comp_search_terms", "best_platform", "best_platform_reason", "shipping_notes",
    "legal_flags", "ebay_title", "etsy_title", "etsy_tags", "marketplace_title", "description",
  ],
  properties: {
    item_name: { type: "string" },
    item_type: { type: "string" },
    era_guess: { type: "string" },
    materials: { type: "string" },
    maker_guess: { type: "string" },
    marks_seen: { type: "string" },
    condition_notes: { type: "string" },
    reproduction_risk: { type: "string", enum: ["low", "medium", "high", "unknown"] },
    authenticity_flags: { type: "array", items: { type: "string" } },
    needs_more_photos: { type: "array", items: { type: "string" } },
    price_low: { type: "number" },
    price_high: { type: "number" },
    quick_sale_price: { type: "number" },
    price_confidence: { type: "string", enum: ["low", "medium", "high"] },
    price_reasoning: { type: "string" },
    comp_search_terms: { type: "string" },
    best_platform: { type: "string", enum: ["ebay", "etsy", "marketplace"] },
    best_platform_reason: { type: "string" },
    shipping_notes: { type: "string" },
    legal_flags: { type: "array", items: { type: "string" } },
    ebay_title: { type: "string" },
    etsy_title: { type: "string" },
    etsy_tags: { type: "array", items: { type: "string" } },
    marketplace_title: { type: "string" },
    description: { type: "string" },
  },
} as const;

const SYSTEM = `You help a beginner reseller identify and price secondhand items from photos.
Rules:
- Be honest about uncertainty. Never invent a maker, a date, or a metal content. If the photos do not show it, say so and list the photos that would settle it in needs_more_photos.
- Prices are US dollars and are an AI estimate from general market knowledge, not from live sales data. Set price_confidence to low unless the item is a clearly identifiable common piece. price_low and price_high are a realistic selling range on a resale marketplace. quick_sale_price is a price likely to sell within a few weeks.
- comp_search_terms is the exact phrase the seller should type into eBay sold listings to check the estimate.
- legal_flags: list anything that may be restricted, such as ivory, tortoiseshell, feathers, Native American-made items, firearms, or glass that may contain lead or uranium. Use an empty list if none apply.
- Titles: ebay_title must be 80 characters or fewer. etsy_title 140 or fewer. Etsy tags: up to 13, each 20 characters or fewer. Use plain factual wording, no hype, no emojis, no ALL CAPS.
- description is plain factual text a buyer can read: what it is, size if visible, condition, and any flaws. Only state facts supported by the photos or the seller's notes.
- shipping_notes: say if the item is fragile, heavy or bulky and whether local pickup suits it better.`;

function cors(env: Env, extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "content-type,x-passcode",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    Vary: "Origin",
    ...extra,
  };
}

function json(env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors(env, { "content-type": "application/json" }),
  });
}

async function sameSecret(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bump(env: Env, key: string, cap: number): Promise<boolean> {
  const k = `${key}:${today()}`;
  const n = Number((await env.LIMITS.get(k)) ?? "0");
  if (n >= cap) return false;
  await env.LIMITS.put(k, String(n + 1), { expirationTtl: 172800 });
  return true;
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Accept only plain JPEGs with no EXIF/GPS segment. The browser re-encodes photos, which strips them. */
function checkJpeg(b64: string): string | null {
  if (typeof b64 !== "string" || b64.length > MAX_IMAGE_BYTES * 1.4) return "image too large";
  let bytes: Uint8Array;
  try {
    bytes = b64ToBytes(b64);
  } catch {
    return "image is not valid base64";
  }
  if (bytes.length > MAX_IMAGE_BYTES) return "image too large";
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return "image must be a JPEG";
  // Walk the marker segments before the image data and refuse APP1 (EXIF/XMP) and APP13.
  let i = 2;
  while (i + 4 < bytes.length && bytes[i] === 0xff) {
    const marker = bytes[i + 1];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0xe1 || marker === 0xed) return "image still has metadata, re-encode it first";
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    i += 2 + len;
  }
  return null;
}

function clip(s: unknown, n: number): string {
  return String(s ?? "").trim().slice(0, n);
}

function cleanResult(r: Record<string, unknown>): Record<string, unknown> {
  const tags = Array.isArray(r.etsy_tags) ? (r.etsy_tags as unknown[]) : [];
  return {
    ...r,
    ebay_title: clip(r.ebay_title, 80),
    etsy_title: clip(r.etsy_title, 140),
    marketplace_title: clip(r.marketplace_title, 100),
    etsy_tags: tags.map((t) => clip(t, 20)).filter(Boolean).slice(0, 13),
  };
}

function visitor(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? "unknown";
}

async function identify(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as {
    category?: string;
    images?: string[];
    notes?: string;
  } | null;
  if (!body || !Array.isArray(body.images) || body.images.length < 1 || body.images.length > MAX_IMAGES_PER_ITEM) {
    return json(env, { error: `send 1 to ${MAX_IMAGES_PER_ITEM} photos` }, 400);
  }
  const category = (CATEGORIES as readonly string[]).includes(body.category ?? "")
    ? (body.category as Category)
    : "other";
  for (const img of body.images) {
    const problem = checkJpeg(img);
    if (problem) return json(env, { error: problem }, 400);
  }
  if (!(await bump(env, `identify-ip:${visitor(req)}`, Number(env.PER_VISITOR_IDENTIFY_CAP)))) {
    return json(env, { error: "you have reached today's scan limit, try again tomorrow" }, 429);
  }
  if (!(await bump(env, "identify", Number(env.DAILY_IDENTIFY_CAP)))) {
    return json(env, { error: "daily scan limit reached, try again tomorrow" }, 429);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const content: Anthropic.Beta.BetaContentBlockParam[] = body.images.map((data) => ({
    type: "image",
    source: { type: "base64", media_type: "image/jpeg", data },
  }));
  content.push({
    type: "text",
    text: `Category: ${category}\n${CATEGORY_GUIDE[category]}\n\nSeller notes (may be empty): ${clip(body.notes, 500)}\n\nIdentify and price this item.`,
  });

  try {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content }],
    });
    if (res.stop_reason === "refusal") {
      return json(env, { error: "the model declined this request, try different photos" }, 422);
    }
    const text = res.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return json(env, { error: "no result returned" }, 502);
    const parsed = JSON.parse(text.text) as Record<string, unknown>;
    const u = res.usage;
    console.log(JSON.stringify({ evt: "identify_ok", model: res.model, input: u.input_tokens, output: u.output_tokens }));
    return json(env, { result: cleanResult(parsed), category, usage: { input: u.input_tokens, output: u.output_tokens, model: res.model } });
  } catch (e) {
    console.error(JSON.stringify({ evt: "identify_failed", msg: e instanceof Error ? e.message : String(e) }));
    const why = e instanceof Error ? e.message.slice(0, 160) : "unknown";
    return json(env, { error: "identification failed, try again", detail: why }, 502);
  }
}

// ---- Publishing: one commit for the whole batch, through the Git Data API ----

async function gh(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${env.GH_REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "flea-market-jam-worker",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
}

async function ghJson<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const r = await gh(env, path, init);
  if (!r.ok) throw new Error(`github ${path} ${r.status}`);
  return (await r.json()) as T;
}

async function blob(env: Env, content: string, encoding: "utf-8" | "base64"): Promise<string> {
  const r = await ghJson<{ sha: string }>(env, "/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding }),
  });
  return r.sha;
}

interface PublishItem {
  fields?: Record<string, unknown>;
  images?: string[];
}

// Only these fields are stored. There is deliberately no field for location, price paid or source.
const KEEP = [
  "title", "category", "item_name", "item_type", "era_guess", "materials", "maker_guess", "marks_seen",
  "condition_notes", "reproduction_risk", "authenticity_flags", "price_low", "price_high",
  "quick_sale_price", "price_confidence", "price_reasoning", "comp_search_terms", "best_platform",
  "best_platform_reason", "shipping_notes", "legal_flags", "ebay_title", "etsy_title", "etsy_tags",
  "marketplace_title", "description", "asking_price",
] as const;

async function publish(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { items?: PublishItem[] } | null;
  const items = body?.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS_PER_PUBLISH) {
    return json(env, { error: `publish 1 to ${MAX_ITEMS_PER_PUBLISH} items at a time` }, 400);
  }
  for (const it of items) {
    const imgs = it.images ?? [];
    if (imgs.length > MAX_PUBLISH_IMAGES_PER_ITEM) {
      return json(env, { error: `at most ${MAX_PUBLISH_IMAGES_PER_ITEM} photos per item` }, 400);
    }
    for (const img of imgs) {
      const problem = checkJpeg(img);
      if (problem) return json(env, { error: problem }, 400);
    }
  }
  if (!(await bump(env, `publish-ip:${visitor(req)}`, Number(env.PER_VISITOR_PUBLISH_CAP)))) {
    return json(env, { error: "you have reached today's publish limit" }, 429);
  }
  if (!(await bump(env, "publish", Number(env.DAILY_PUBLISH_CAP)))) {
    return json(env, { error: "daily publish limit reached" }, 429);
  }

  try {
    const ref = await ghJson<{ object: { sha: string } }>(env, `/git/ref/heads/${env.GH_BRANCH}`);
    const headCommit = await ghJson<{ tree: { sha: string } }>(env, `/git/commits/${ref.object.sha}`);

    // Current index, if any.
    let index: { items: Record<string, unknown>[] } = { items: [] };
    const cur = await gh(env, `/contents/data/index.json?ref=${env.GH_BRANCH}`);
    if (cur.ok) {
      const meta = (await cur.json()) as { content: string };
      index = JSON.parse(new TextDecoder().decode(b64ToBytes(meta.content.replace(/\n/g, ""))));
    }

    const treeEntries: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
    const added: Record<string, unknown>[] = [];

    for (const it of items) {
      const id = `${today().replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
      const record: Record<string, unknown> = { id, published: today() };
      for (const k of KEEP) if (it.fields && k in it.fields) record[k] = it.fields[k];
      const photos: string[] = [];
      let n = 0;
      for (const img of it.images ?? []) {
        n++;
        const path = `data/images/${id}-${n}.jpg`;
        treeEntries.push({ path, mode: "100644", type: "blob", sha: await blob(env, img, "base64") });
        photos.push(path);
      }
      record.photos = photos;
      treeEntries.push({
        path: `data/items/${id}.json`,
        mode: "100644",
        type: "blob",
        sha: await blob(env, JSON.stringify(record, null, 2) + "\n", "utf-8"),
      });
      added.push(record);
    }

    index.items = [...added, ...index.items];
    treeEntries.push({
      path: "data/index.json",
      mode: "100644",
      type: "blob",
      sha: await blob(env, JSON.stringify(index, null, 2) + "\n", "utf-8"),
    });

    const tree = await ghJson<{ sha: string }>(env, "/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeEntries }),
    });
    const commit = await ghJson<{ sha: string }>(env, "/git/commits", {
      method: "POST",
      body: JSON.stringify({
        message: `Add ${items.length} scanned item${items.length === 1 ? "" : "s"}`,
        tree: tree.sha,
        parents: [ref.object.sha],
      }),
    });
    await ghJson(env, `/git/refs/heads/${env.GH_BRANCH}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha }),
    });
    return json(env, { ok: true, commit: commit.sha, count: items.length });
  } catch (e) {
    console.error(JSON.stringify({ evt: "publish_failed", msg: e instanceof Error ? e.message : String(e) }));
    const why = e instanceof Error ? e.message.slice(0, 160) : "unknown";
    return json(env, { error: "publish failed, try again", detail: why }, 502);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    if (req.method !== "POST") return json(env, { error: "not found" }, 404);
    if (req.headers.get("origin") !== env.ALLOWED_ORIGIN) return json(env, { error: "forbidden" }, 403);

    // The service needs its two upstream keys. The passcode is optional: when unset, the gate is open
    // and the daily caps and the per-visitor caps below are the only limits.
    if (!env.ANTHROPIC_API_KEY || !env.GITHUB_TOKEN) {
      return json(env, { error: "service is not configured" }, 503);
    }
    if (env.PASSCODE) {
      const given = req.headers.get("x-passcode") ?? "";
      if (!(await sameSecret(given, env.PASSCODE))) {
        const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
        const k = `fail:${ip}:${today()}`;
        const n = Number((await env.LIMITS.get(k)) ?? "0") + 1;
        await env.LIMITS.put(k, String(n), { expirationTtl: 86400 });
        return json(env, { error: "unauthorized" }, n > 20 ? 429 : 401);
      }
    }

    if (url.pathname === "/identify") return identify(req, env);
    if (url.pathname === "/publish") return publish(req, env);
    if (url.pathname === "/check") return json(env, { ok: true });
    return json(env, { error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
