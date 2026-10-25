# Ice Cream Hotline

## Discord visitor notifications

1. In your Discord server, click **+** beside the channel list, choose **Text**, and create a channel such as `website-visitors`.
2. Open **Server Settings → Integrations → Webhooks → Create Webhook**. Select the new channel, save, and copy its webhook URL.
3. Paste it after `VITE_DISCORD_WEBHOOK_URL=` in `.env.local`. If that file is missing, copy `.env.example` to `.env.local` first.
4. Restart `npm run dev` for local use. For the live site, set the same variable in your hosting provider's build environment and rebuild/redeploy the site.

[Discord's webhook instructions](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

Notifications trigger when the visitor enters through **Let me in!**, the main navigation, or the sundae studio. A successful notification is remembered in that browser's local storage without an expiry, so refreshing, opening another tab, or closing and reopening the browser does not notify again. Failed sends can retry on a later entry; they are not marked as successfully notified. Browsers that block local storage skip notifications.

The requested history reset uses a new notification marker (`mv_first_visit_notified_v2`). When a browser next enters this updated version, the old notification marker and visit count are deleted, so previous visitors can each trigger one fresh alert. The new marker stays the same across builds, so this reset happens only once. To test, deploy the updated `dist` folder, open the site, and press **Let Me In!**; expect one alert. Refresh and enter again; expect no additional alert.

This identifies a browser profile on the same site address, rather than a physical device or an IP address. Changing networks does not trigger another alert in a recognized browser. A different browser/profile, private session, cleared site data, or a new site address can count as a new visitor. Simultaneous first entries in different tabs are coordinated with Web Locks where supported (HTTPS or localhost); without Web Locks, sequential visits are still deduplicated, but simultaneous first entries can race.

This is a static site, so the webhook URL is included in its browser bundle even when configured through an environment variable. Keeping the URL private or deduplicating IPs across devices requires a backend.

## Development

```sh
npm ci
npm run dev
```

Run `npm test` to verify first-visit behavior with mocked network requests, and `npm run build` to build the site. Tests do not post to Discord.

## Optional activities in the original site

The original opening screen, header, shop layout, menu, personal content, and text receipts are preserved. The new features live in two collapsed cards inside the shop: **3D Sundae Studio** and **Mini Arcade**.

- The studio has its own six-scoop draft, container/topping controls, rotation, local preview themes, and Scoopie. **Add to my order** adds the draft to the existing order flow. The original menu remains available independently.
- Theme colours and all activity CSS are scoped to the optional sections and game dialogs. They do not restyle the opening screen or the original menu.
- Sound effects are optional, short, and event-driven. Enabling effects starts no playback, interval, or ambient loop. The original song and DJ controls remain as originally written.
- Scoop & Catch, Flavour Match, and The Balancing Act keep saved best scores. Winning a game unlocks a cosmetic confetti topping.
- The balancing game measures the visible scoop and support widths in pixels. A scoop needs substantial overlap and a stable centre of mass. Each drop visibly falls before a supported landing can score; misses fall out of the arena. A second drop is blocked while one is falling.
- Avatar, mood, favourites, original stamps, and order history continue to be saved in this browser.

### Local verification without Discord alerts

```sh
VITE_DISCORD_WEBHOOK_URL= npm run dev -- --host 127.0.0.1
```

This overrides the local webhook only for that development process. The regular production build still reads the configured webhook.

Check the studio by adding flavours, switching containers, selecting toppings, rotating the model, and placing a pretend order. Refresh and confirm the selected world, favourites, stamp count, and order history remain. Play the games using pointer/touch controls or the on-screen/keyboard controls. Hidden game tabs pause the timed games; memory-game time excludes hidden periods.

`npm test` covers notification rules, studio limits, memory pairs, catch collisions, saved profiles, pixel-based support and tower stability, falling trajectories, and idle-audio regressions.
