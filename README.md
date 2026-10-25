# Ice Cream Hotline

## Discord visitor notifications

1. In your Discord server, click **+** beside the channel list, choose **Text**, and create a channel such as `website-visitors`.
2. Open **Server Settings → Integrations → Webhooks → Create Webhook**. Select the new channel, save, and copy its webhook URL.
3. Paste it after `VITE_DISCORD_WEBHOOK_URL=` in `.env.local`. If that file is missing, copy `.env.example` to `.env.local` first.
4. Restart `npm run dev` for local use. For the live site, set the same variable in your hosting provider's build environment and rebuild/redeploy the site.

[Discord's webhook instructions](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

Notifications still trigger when the visitor presses **Let Me In!**. A successful notification is remembered in that browser's local storage without an expiry, so refreshing, opening another tab, or closing and reopening the browser does not notify again. Failed sends can retry on a later entry; they are not marked as successfully notified. Browsers that block local storage skip notifications.

The requested history reset uses a new notification marker (`mv_first_visit_notified_v2`). When a browser next enters this updated version, the old notification marker and visit count are deleted, so previous visitors can each trigger one fresh alert. The new marker stays the same across builds, so this reset happens only once. To test, deploy the updated `dist` folder, open the site, and press **Let Me In!**; expect one alert. Refresh and enter again; expect no additional alert.

This identifies a browser profile on the same site address, rather than a physical device or an IP address. Changing networks does not trigger another alert in a recognized browser. A different browser/profile, private session, cleared site data, or a new site address can count as a new visitor. Simultaneous first entries in different tabs are coordinated with Web Locks where supported (HTTPS or localhost); without Web Locks, sequential visits are still deduplicated, but simultaneous first entries can race.

This is a static site, so the webhook URL is included in its browser bundle even when configured through an environment variable. Keeping the URL private or deduplicating IPs across devices requires a backend.

## Development

```sh
npm ci
npm run dev
```

Run `npm test` to verify first-visit behavior with mocked network requests, and `npm run build` to build the site. Tests do not post to Discord.
