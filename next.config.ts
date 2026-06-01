import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            // Prevent the page from being embedded in iframes (clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Prevent MIME-type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Limit referrer information sent to third parties
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restrict browser features not needed by this app
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Content Security Policy
            // - default-src 'self': only load resources from same origin
            // - script-src 'self' 'unsafe-inline' 'unsafe-eval': Next.js requires these for dev/prod
            // - style-src 'self' 'unsafe-inline': Tailwind/CSS-in-JS requires inline styles
            // - img-src 'self' data:: allow data URIs for PDF export
            // - connect-src 'self': API calls only to same origin (OpenRouter is called server-side)
            // - font-src 'self': local fonts only
            // - frame-ancestors 'none': belt-and-suspenders with X-Frame-Options
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
