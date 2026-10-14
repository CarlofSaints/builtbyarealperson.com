import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * One address for Google. www and the vercel.app alias both served the full
   * site, so Google could see three copies of every page. The canonical tags
   * already name the real one; these make it definite.
   *
   * /api/ is left alone on both: a webhook or cron registered against either
   * host would not follow a redirect, and would fail looking like an outage.
   */
  async redirects() {
    return [
      {
        source: "/:path((?!api(?:/|$)).*)",
        has: [{ type: "host", value: "www.builtbyarealperson.com" }],
        destination: "https://builtbyarealperson.com/:path",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // The vercel.app alias stays reachable (deploy checks use it), but out of the index.
        source: "/:path*",
        has: [{ type: "host", value: "builtbyarealperson.vercel.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
