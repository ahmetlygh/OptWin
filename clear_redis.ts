import { redisCache } from "./src/lib/redis";

async function main() {
    console.log("Flushing all OptWin translations in Redis...");
    const langs = ["tr", "en", "de", "es", "fr", "zh", "hi", "pt-br", "ru"];
    const keys = langs.map(l => `optwin:translations:${l}`);
    
    await redisCache.del(keys);
    console.log(`✅ Flushed cache for languages`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
