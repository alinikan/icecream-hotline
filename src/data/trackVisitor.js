const WEBHOOK_URL = "https://discord.com/api/webhooks/1486981694106894439/FRHTl05jY2eOWUTSr6LnfTYQLdIvUpnwjuzB2GNjV9KK25d-jEPFDrtueIZMKhRIL2RB";

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return ua;
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
  return "Unknown";
}

function getOS() {
  const ua = navigator.userAgent;
  if (/iPhone OS (\d+[_\.]\d+)/.test(ua)) return "iOS " + RegExp.$1.replace("_", ".");
  if (/Android (\d+\.?\d*)/.test(ua)) return "Android " + RegExp.$1;
  if (/Mac OS X (\d+[_\.]\d+)/.test(ua)) return "macOS " + RegExp.$1.replace(/_/g, ".");
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}

function getFingerprint() {
  const parts = [
    screen.width, screen.height, screen.colorDepth,
    navigator.language, navigator.languages?.join(","),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency, navigator.deviceMemory,
    navigator.platform
  ];
  let hash = 0;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

export default async function trackVisitor() {
  try {
    // collect browser-side info
    const now = new Date();
    const browser = getBrowserInfo();
    const device = getDeviceType();
    const os = getOS();
    const screenRes = `${screen.width} × ${screen.height}`;
    const windowSize = `${window.innerWidth} × ${window.innerHeight}`;
    const pixelRatio = window.devicePixelRatio || 1;
    const lang = navigator.languages ? navigator.languages.join(", ") : navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cores = navigator.hardwareConcurrency || "?";
    const memory = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "?";
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const cookiesEnabled = navigator.cookieEnabled;
    const referrer = document.referrer || "Direct (no referrer)";
    const pageURL = window.location.href;
    const connection = navigator.connection;
    const connType = connection ? (connection.effectiveType || "?") : "?";
    const downlink = connection?.downlink ? connection.downlink + " Mbps" : "?";
    const fingerprint = getFingerprint();
    const localTime = now.toLocaleString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });

    // get IP + geolocation (try multiple APIs as fallbacks)
    let geo = {};
    
    // Try API #1: ipapi.co
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const raw = await res.json();
        if (raw.ip && !raw.error) {
          geo = {
            query: raw.ip,
            city: raw.city,
            regionName: raw.region,
            country: raw.country_name,
            zip: raw.postal,
            lat: raw.latitude,
            lon: raw.longitude,
            isp: raw.org,
            org: raw.asn,
            as: raw.asn || "",
            mobile: false,
            proxy: false,
            hosting: false,
          };
        }
      }
    } catch (e) {}

    // Try API #2 if #1 failed
    if (!geo.query) {
      try {
        const res = await fetch("https://ipwho.is/");
        if (res.ok) {
          const raw = await res.json();
          if (raw.success !== false) {
            geo = {
              query: raw.ip,
              city: raw.city,
              regionName: raw.region,
              country: raw.country,
              zip: raw.postal,
              lat: raw.latitude,
              lon: raw.longitude,
              isp: raw.connection?.isp,
              org: raw.connection?.org,
              as: raw.connection?.asn ? "AS" + raw.connection.asn : "",
              mobile: false,
              proxy: raw.security?.proxy || raw.security?.vpn || raw.security?.tor,
              hosting: raw.security?.hosting,
            };
          }
        }
      } catch (e) {}
    }

    // Try API #3 if both failed (just get IP at minimum)
    if (!geo.query) {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (res.ok) {
          const raw = await res.json();
          geo = { query: raw.ip, city: "?", regionName: "?", country: "?" };
        }
      } catch (e) {
        geo = { query: "Blocked", city: "?", regionName: "?", country: "?" };
      }
    }

    const isVPN = geo.proxy ? "⚠️ Yes" : "No";
    const isHosting = geo.hosting ? "⚠️ Yes (bot/server?)" : "No";
    const isMobileData = geo.mobile ? "Yes" : "No";

    // check for returning visitor via fingerprint
    let visitCount = 1;
    let returning = "First visit";
    try {
      const key = `_mv_${fingerprint}`;
      const prev = window.localStorage?.getItem(key);
      if (prev) {
        visitCount = parseInt(prev) + 1;
        returning = `Returning visitor (#${visitCount})`;
      }
      window.localStorage?.setItem(key, visitCount.toString());
    } catch (e) {
      returning = "Unknown (storage blocked)";
    }

    // build Discord embed
    const embed = {
      title: "🍦 New Visitor on mobinaicecream.com",
      color: 0xf472b6,
      thumbnail: { url: "https://em-content.zobj.net/source/apple/391/ice-cream_1f368.png" },
      fields: [
        { name: "🌐 IP Address", value: `\`${geo.query || "?"}\``, inline: true },
        { name: "📍 Location", value: `${geo.city || "?"}, ${geo.regionName || "?"}\n${geo.country || "?"}${geo.zip ? " " + geo.zip : ""}`, inline: true },
        { name: "🗺️ Coordinates", value: geo.lat ? `[${geo.lat}, ${geo.lon}](https://www.google.com/maps?q=${geo.lat},${geo.lon})` : "?", inline: true },
        { name: "🏢 ISP", value: geo.isp || "?", inline: true },
        { name: "🏷️ Org / AS", value: `${geo.org || "?"}\n${geo.as || ""}`, inline: true },
        { name: "📱 Device", value: `${device}`, inline: true },
        { name: "💻 OS", value: os, inline: true },
        { name: "🌍 Browser", value: browser, inline: true },
        { name: "📐 Screen", value: `${screenRes} @${pixelRatio}x`, inline: true },
        { name: "🪟 Window", value: windowSize, inline: true },
        { name: "🧠 CPU Cores", value: `${cores}`, inline: true },
        { name: "💾 RAM", value: memory, inline: true },
        { name: "🗣️ Languages", value: lang, inline: true },
        { name: "🕐 Timezone", value: timezone, inline: true },
        { name: "📶 Connection", value: `${connType}${downlink !== "?" ? " / " + downlink : ""}`, inline: true },
        { name: "👆 Touch", value: touch ? "Yes" : "No", inline: true },
        { name: "🍪 Cookies", value: cookiesEnabled ? "Enabled" : "Disabled", inline: true },
        { name: "📲 Mobile Data", value: isMobileData, inline: true },
        { name: "🔒 VPN/Proxy", value: isVPN, inline: true },
        { name: "🤖 Hosting/Bot", value: isHosting, inline: true },
        { name: "🔗 Referred By", value: referrer.length > 100 ? referrer.substring(0, 100) + "..." : referrer, inline: false },
        { name: "📄 Page", value: pageURL, inline: false },
        { name: "🔁 Returning?", value: `${returning}`, inline: true },
        { name: "🆔 Fingerprint", value: `\`${fingerprint}\``, inline: true },
      ],
      footer: { text: `Visit #${visitCount}` },
      timestamp: now.toISOString(),
    };

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Mobina Ice Cream 🍦",
        embeds: [embed],
      }),
    });
  } catch (err) {
    // silent fail — visitor should never notice
  }
}
