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

## The modern Hotline

- **Sundae studio:** a custom Three.js scene with up to six scoops, tap/drag flavour selection, a keyboard-accessible rotation slider, auto-rotation, three containers, and visible toppings. The 3D code loads separately; a CSS illustration is available when WebGL is unavailable.
- **Scoopie:** an original animated SVG mascot with pointer-following eyes, tap reactions, mood details, scoop reactions, and a dance when optional audio is enabled.
- **Four worlds:** Strawberry Sunset, Midnight Blueberry, The Matcha Café, and Birthday Everyday change the full site palette, atmosphere, lighting, and optional generated chimes.
- **Three arcade games:** Scoop & Catch (catch 10 in 20 seconds), Flavour Crush (find all six pairs), and The Balancing Act (stack eight in 30 seconds). Winning any game unlocks a cosmetic confetti topping in the studio.
- **Saved preferences:** avatar, selected world, favourites, original stamps, up to 30 pretend orders, arcade best scores, and the cosmetic unlock persist in this browser. There is no account or cross-device synchronisation.
- **Accessibility:** keyboard controls, focus-trapped Escape-dismissable dialogs, a mobile navigation menu, system reduced-motion support, and a manual gentler-animation setting. Sound starts only after an explicit click. The original song remains in the existing DJ control.

The original fortunes, personal questions, About Mobina, original stamp card, delivery link, and text receipts remain available. This release does not add a Secret Freezer, a new Scoop Passport, radio stations, collectible receipt exports, or multiplayer.

### Local verification without Discord alerts

```sh
VITE_DISCORD_WEBHOOK_URL= npm run dev -- --host 127.0.0.1
```

This overrides the local webhook only for that development process. The regular production build still reads the configured webhook.

Check the studio by adding flavours, switching containers, selecting toppings, rotating the model, and placing a pretend order. Refresh and confirm the selected world, favourites, stamp count, and order history remain. Play the games using pointer/touch controls or the on-screen/keyboard controls. Hidden game tabs pause the timed games; memory-game time excludes hidden periods.

`npm test` covers the original notification rules plus scoop capacity, invalid quantities, memory-pair generation, catch collision bounds, balancing score/limits, and profile recovery.
