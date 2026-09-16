const NodeCache = require('node-cache');

const configuredTtl = Number(process.env.CACHE_TTL_SECONDS);
const defaultTtl = Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : 300;

const apiCache = new NodeCache({
    stdTTL: defaultTtl,
    checkperiod: 60,
    deleteOnExpire: true,
    useClones: false,
});

const buildCacheKey = (namespace, req) => {
    const query = Object.entries(req.query)
        .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${namespace}:${req.baseUrl}${req.path}${query ? `?${query}` : ''}`;
};

const clearCacheNamespace = (namespace) => {
    const prefix = `${namespace}:`;
    const keys = apiCache.keys().filter((key) => key.startsWith(prefix));

    if (keys.length > 0) {
        apiCache.del(keys);
    }
};

const cacheResponse = (namespace, ttlSeconds = defaultTtl) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = buildCacheKey(namespace, req);
    const cachedResponse = apiCache.get(cacheKey);

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

    if (cachedResponse !== undefined) {
        res.set('X-Cache', 'HIT');
        return res.status(cachedResponse.statusCode).json(cachedResponse.body);
    }

    res.set('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            apiCache.set(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds);
        }

        return originalJson(body);
    };

    next();
};

const invalidateCacheOnMutation = (namespace) => (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    res.once('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            clearCacheNamespace(namespace);
        }
    });

    next();
};

module.exports = {
    apiCache,
    cacheResponse,
    clearCacheNamespace,
    invalidateCacheOnMutation,
};
