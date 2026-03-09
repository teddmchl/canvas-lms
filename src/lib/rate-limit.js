import { LRUCache } from "lru-cache";

const tokenCache = new LRUCache({
  max: 500, // Maximum ips to track simultaneously
  ttl: 60000, // Default 1 minute
});

export function rateLimit(req, options = {}) {
  const limit = options.limit || 10; 
  const ttl = options.ttl || 60000;

  // Attempt to grab IP from headers or fallback
  let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.ip;
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  ip = ip || "anonymous";

  const tokenCount = tokenCache.get(ip) || [0];
  if (tokenCount[0] === 0) {
    tokenCache.set(ip, tokenCount, { ttl });
  }
  tokenCount[0] += 1;

  const isRateLimited = tokenCount[0] > limit;

  return { isRateLimited };
}
