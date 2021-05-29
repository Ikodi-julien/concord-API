const redis = require('redis');

const client = process.env.NODE_ENV === 'production' ?
    redis.createClient(process.env.REDIS_URL) :
    redis.createClient()

client.on("connect", () => {
    console.log("Connection to Redis has been established successfully.")
})

const { promisify } = require('util');

const asyncClient = {
    sadd: promisify(client.sadd).bind(client),
    srem: promisify(client.srem).bind(client),
    smembers: promisify(client.smembers).bind(client),
    zadd: promisify(client.zadd).bind(client),
    zcount: promisify(client.zcount).bind(client),
    zrem: promisify(client.zrem).bind(client),
    zrange: promisify(client.zrange).bind(client),
    zscore: promisify(client.zscore).bind(client),
    zrangebyscore: promisify(client.zrangebyscore).bind(client),
    setex: promisify(client.setex).bind(client),
    get: promisify(client.get).bind(client),
    del: promisify(client.del).bind(client),
    scan: promisify(client.scan).bind(client)

};

module.exports = asyncClient;