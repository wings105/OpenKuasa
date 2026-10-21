import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Preview/test only; no external R2 caching or production bindings.
export default defineCloudflareConfig();
