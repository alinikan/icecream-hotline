const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL?.trim();

// Start fresh after the requested history reset, then remember new alerts permanently.
const NOTIFIED_KEY = "mv_first_visit_notified_v2";
const VISITOR_ID_KEY = "mv_visitor_id";
const OLD_HISTORY_KEYS = ["mv_first_visit_notified", "mv_visit_count"];
let trackingInProgress = false;
let notifiedThisPage = false;

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return "Unknown Browser";
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android.*Mobile/.test(ua)) return "Android Phone";
  if (/Android/.test(ua)) return "Android Tablet";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown Device";
}

function getOS() {
  const ua = navigator.userAgent;
  if (/iPhone OS (\d+[_\.]\d+)/.test(ua)) return "iOS " + RegExp.$1.replace(/_/g, ".");
  if (/Android (\d+\.?\d*)/.test(ua)) return "Android " + RegExp.$1;
  if (/Mac OS X (\d+[_\.]\d+)/.test(ua)) return "macOS " + RegExp.$1.replace(/_/g, ".");
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}

function getStableVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;

    const raw = [
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.language,
      navigator.languages?.join(",") || "",
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency || "",
      navigator.deviceMemory || "",
      navigator.platform || "",
    ].join("|");

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }

    const id = `VIS-${Math.abs(hash).toString(36).toUpperCase()}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}

function hasAlreadyVisited() {
  // Delete only the previous notification history when this browser next enters.
  for (const key of OLD_HISTORY_KEYS) localStorage.removeItem(key);
  return localStorage.getItem(NOTIFIED_KEY) === "1";
}

function getReferrerLabel(referrer) {
  if (!referrer) return "Direct";

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("discord")) return "Discord";
    if (host.includes("twitter") || host.includes("x.com")) return "X / Twitter";
    return host;
  } catch {
    return referrer;
  }
}

function getUtmData() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "—",
    medium: params.get("utm_medium") || "—",
    campaign: params.get("utm_campaign") || "—",
    content: params.get("utm_content") || "—",
  };
}

async function getGeoData() {
  let geo = null;

  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const raw = await res.json();
      if (raw.ip && !raw.error) {
        geo = {
          ip: raw.ip,
          city: raw.city || "?",
          region: raw.region || "?",
          country: raw.country_name || "?",
          postal: raw.postal || "",
          lat: raw.latitude,
          lon: raw.longitude,
          isp: raw.org || "?",
          org: raw.asn || "?",
          proxy: false,
          hosting: false,
        };
      }
    }
  } catch {}

  if (!geo) {
    try {
      const res = await fetch("https://ipwho.is/");
      if (res.ok) {
        const raw = await res.json();
        if (raw.success !== false) {
          geo = {
            ip: raw.ip || "?",
            city: raw.city || "?",
            region: raw.region || "?",
            country: raw.country || "?",
            postal: raw.postal || "",
            lat: raw.latitude,
            lon: raw.longitude,
            isp: raw.connection?.isp || "?",
            org: raw.connection?.org || raw.connection?.asn || "?",
            proxy: Boolean(raw.security?.proxy || raw.security?.vpn || raw.security?.tor),
            hosting: Boolean(raw.security?.hosting),
          };
        }
      }
    } catch {}
  }

  if (!geo) {
    geo = {
      ip: "Blocked",
      city: "?",
      region: "?",
      country: "?",
      postal: "",
      lat: null,
      lon: null,
      isp: "?",
      org: "?",
      proxy: false,
      hosting: false,
    };
  }

  return geo;
}

export default async function trackVisitor(extra = {}) {
  if (trackingInProgress || notifiedThisPage) return;

  try {
    if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR_NEW_DISCORD_WEBHOOK_HERE")) return;
    if (typeof window === "undefined") return;
    if (document.visibilityState !== "visible") return;

    const currentPath = window.location.pathname.toLowerCase();
    const blockedPaths = ["/search", "/admin", "/api", "/checkout", "/cart"];
    if (blockedPaths.some((path) => currentPath.startsWith(path))) return;

    trackingInProgress = true;

    // Serialize first entries across tabs, then recheck the persistent marker.
    if (navigator.locks?.request) {
      await navigator.locks.request("mv_first_visit_notification", () => notifyFirstVisit(extra, currentPath));
    } else {
      await notifyFirstVisit(extra, currentPath);
    }
  } catch {
    // Tracking must never interrupt the site. If storage is unavailable, skip it.
  } finally {
    trackingInProgress = false;
  }
}

async function notifyFirstVisit(extra, currentPath) {
  if (hasAlreadyVisited()) return;

  // Confirm persistence works before sending; "0" still allows failed sends to retry.
  localStorage.setItem(NOTIFIED_KEY, "0");

  const now = new Date();
  const visitorId = getStableVisitorId();
  const browser = getBrowserInfo();
  const device = getDeviceType();
  const os = getOS();
  const referrer = document.referrer || "";
  const referrerLabel = getReferrerLabel(referrer);
  const utm = getUtmData();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lang = navigator.languages ? navigator.languages.join(", ") : navigator.language;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const connection = navigator.connection;
  const connectionInfo = connection
    ? `${connection.effectiveType || "?"}${connection.downlink ? ` / ${connection.downlink} Mbps` : ""}`
    : "?";
  const screenRes = `${screen.width} × ${screen.height}`;
  const windowSize = `${window.innerWidth} × ${window.innerHeight}`;
  const pageURL = window.location.href;
  const localTime = now.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const geo = await getGeoData();
  const locationText = `${geo.city}, ${geo.region}\n${geo.country}${geo.postal ? ` ${geo.postal}` : ""}`;
  const riskFlags = [
    geo.proxy ? "VPN/Proxy" : null,
    geo.hosting ? "Hosting/Server" : null,
  ].filter(Boolean);

  const embed = {
    title: "🍦 First Visit to Mobina's Site",
    color: 0xf472b6,
    fields: [
      {
        name: "👤 Visitor",
        value: [`ID: \`${visitorId}\``, "New visitor", "First visit"].join("\n"),
        inline: true,
      },
      {
        name: "🚪 Entry",
        value: [`Path: \`${currentPath || "/"}\``, `At: ${localTime}`].join("\n"),
        inline: true,
      },
      {
        name: "📈 Source",
        value: [`Referrer: ${referrerLabel}`, `UTM: ${utm.source} / ${utm.medium}`, `Campaign: ${utm.campaign}`].join("\n"),
        inline: true,
      },
      {
        name: "📍 Location",
        value: locationText,
        inline: true,
      },
      {
        name: "🌐 Network",
        value: [`IP: \`${geo.ip}\``, `ISP: ${geo.isp}`, `Org: ${geo.org}`].join("\n"),
        inline: true,
      },
      {
        name: "🖥️ Device",
        value: [`${device}`, `${os}`, `${browser}`].join("\n"),
        inline: true,
      },
      {
        name: "🧪 Session",
        value: [`Screen: ${screenRes}`, `Window: ${windowSize}`, `Touch: ${touch ? "Yes" : "No"}`].join("\n"),
        inline: true,
      },
      {
        name: "🌍 Environment",
        value: [`TZ: ${timezone}`, `Lang: ${lang}`, `Conn: ${connectionInfo}`].join("\n"),
        inline: true,
      },
      {
        name: "⚠️ Risk",
        value: riskFlags.length ? riskFlags.join("\n") : "None detected",
        inline: true,
      },
      {
        name: "🔗 URL",
        value: pageURL,
        inline: false,
      },
    ],
    footer: {
      text: extra.label ? `Entry Event • ${extra.label}` : "Entry Event",
    },
    timestamp: now.toISOString(),
  };

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Mobina Ice Cream 🍦",
      embeds: [embed],
    }),
  });

  if (!response.ok) return;

  notifiedThisPage = true;
  localStorage.setItem(NOTIFIED_KEY, "1");
}
