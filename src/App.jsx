import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  IceCream2,
  Menu,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  AVATARS,
  FLAVOURS,
  MOODS,
  STAMPS_TO_UNLOCK,
  TOPPINGS,
} from "./data/flavours.js";
import {
  addScoop,
  countScoops,
  expandScoops,
  MAX_SCOOPS,
  safeProfile,
  WORLDS,
} from "./data/studio.js";
import trackVisitor from "./data/trackVisitor.js";
import useStoredState from "./hooks/useStoredState.js";
import useSoundscape from "./hooks/useSoundscape.js";
import useAudio from "./hooks/useAudio.js";
import SundaeStudio, { SundaePreview } from "./components/SundaeStudio.jsx";
import ScoopMascot from "./components/ScoopMascot.jsx";
import Arcade from "./components/Arcade.jsx";
import Dialog from "./components/Dialog.jsx";
import OrderPanel from "./components/OrderPanel.jsx";
import ReceiptModal from "./components/ReceiptModal.jsx";
import DailyFortune from "./components/DailyFortune.jsx";
import AboutMobina from "./components/AboutMobina.jsx";
import RunawayQuestions from "./components/RunawayQuestions.jsx";
import StampCard from "./components/StampCard.jsx";
import DeliveryHotline from "./components/DeliveryHotline.jsx";
import OrderHistoryPanel from "./components/OrderHistoryPanel.jsx";
import DJBooth from "./components/DJBooth.jsx";
import Confetti from "./components/Confetti.jsx";

const HOUSE_SCOOPS = expandScoops(
  { straw: 1, vanilla: 1, matcha: 1 },
  FLAVOURS,
);
const DEFAULT_PROFILE = safeProfile(null);

export default function App() {
  const systemReduced = useReducedMotion();
  const [calm, setCalm] = useStoredState(
    "mh_calm_v1",
    false,
    (value) => value === true,
  );
  const reducedMotion = Boolean(systemReduced || calm);
  const [profile, setProfile] = useStoredState(
    "mh_profile_v1",
    DEFAULT_PROFILE,
    safeProfile,
  );
  const [rewardUnlocked, setRewardUnlocked] = useStoredState(
    "mh_arcade_sprinkles_v1",
    false,
    (value) => value === true,
  );
  const [cart, setCart] = useState({});
  const [container, setContainer] = useState("cup");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [starSprinkles, setStarSprinkles] = useState(false);
  const [note, setNote] = useState("");
  const [entered, setEntered] = useState(false);
  const [lastFlavour, setLastFlavour] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const confettiTimer = useRef();
  const world = WORLDS.find((item) => item.id === profile.moodId) || WORLDS[0];
  const mood = MOODS.find((item) => item.id === profile.moodId) || MOODS[0];
  const sounds = useSoundscape(world, reducedMotion);
  const audio = useAudio();
  const scoops = useMemo(() => expandScoops(cart, FLAVOURS), [cart]);
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const flavour = FLAVOURS.find((item) => item.id === id);
          return flavour ? { ...flavour, qty } : null;
        })
        .filter(Boolean),
    [cart],
  );
  const total = useMemo(() => {
    const flavours = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const toppings = selectedToppings.reduce(
      (sum, id) => sum + (TOPPINGS.find((item) => item.id === id)?.price || 0),
      0,
    );
    const vessel =
      container === "waffle" ? 1.25 : container === "cone" ? 0.75 : 0;
    return cartItems.length ? flavours + toppings + vessel : 0;
  }, [cartItems, selectedToppings, container]);

  useEffect(() => {
    document.documentElement.dataset.world = world.id;
    document.documentElement.dataset.calm = String(reducedMotion);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        world.id === "needahug" ? "#252337" : "#fbf6ec",
      );
  }, [world.id, reducedMotion]);
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(confettiTimer.current);
    },
    [],
  );
  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3600);
  }, []);
  const enter = useCallback(() => {
    setEntered(true);
    trackVisitor({ label: "Let Me In / sundae studio" });
  }, []);
  function visit(id) {
    enter();
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }
  function add(flavour) {
    enter();
    if (countScoops(cart) >= MAX_SCOOPS) {
      notify("Six is a beautiful stack. Remove a scoop to try another.");
      return;
    }
    if (flavour.legendary && profile.stamps < STAMPS_TO_UNLOCK) return;
    setLastFlavour(flavour.name);
    setCart((previous) => addScoop(previous, flavour.id));
    sounds.chime("scoop");
  }
  function removeOne(id) {
    setCart((previous) => {
      const next = { ...previous };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  }
  function updateQty(id, delta) {
    if (delta > 0) {
      const flavour = FLAVOURS.find((item) => item.id === id);
      if (flavour) add(flavour);
    } else removeOne(id);
  }
  function removeAll(id) {
    setCart((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }
  function clear() {
    setCart({});
    setSelectedToppings([]);
    setStarSprinkles(false);
  }
  function topping(id) {
    setSelectedToppings((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
    sounds.chime("topping");
  }
  function favorite(id) {
    setProfile((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(id)
        ? previous.favorites.filter((item) => item !== id)
        : [...previous.favorites, id],
    }));
  }
  function surprise() {
    enter();
    const flavours = FLAVOURS.filter(
      (item) => !item.legendary || profile.stamps >= STAMPS_TO_UNLOCK,
    );
    const next = {};
    for (let index = 0; index < 3; index++) {
      const flavour = flavours[Math.floor(Math.random() * flavours.length)];
      next[flavour.id] = (next[flavour.id] || 0) + 1;
    }
    setCart(next);
    setSelectedToppings(["sprinkles"]);
    sounds.chime("win");
    notify("A little house special. Excellent choice, honestly.");
  }
  const reward = useCallback(() => {
    setRewardUnlocked(true);
  }, [setRewardUnlocked]);
  const closeOrder = useCallback(() => setOrderOpen(false), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeReceipt = useCallback(() => setReceiptOpen(false), []);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  function placeOrder() {
    if (!cartItems.length) return;
    const stampsNow = profile.stamps + 1;
    const next = {
      time: Date.now(),
      profileName: "Mobina",
      profileAvatar: profile.avatar,
      mood: `${mood.emoji} ${mood.name}`,
      items: cartItems.map((item) => ({
        name: item.name,
        emoji: item.emoji,
        qty: item.qty,
      })),
      container,
      toppingsText: [
        ...selectedToppings
          .map((id) => TOPPINGS.find((item) => item.id === id)?.name)
          .filter(Boolean),
        ...(starSprinkles ? ["Arcade confetti sprinkles"] : []),
      ].join(", "),
      note,
      total,
      stampsNow,
      unlocked: stampsNow === STAMPS_TO_UNLOCK,
    };
    setProfile((previous) => ({
      ...previous,
      stamps: stampsNow,
      orderHistory: [...previous.orderHistory, next].slice(-30),
    }));
    setReceipt(next);
    setOrderOpen(false);
    setReceiptOpen(true);
    clear();
    setNote("");
    sounds.chime("win");
    if (!reducedMotion) {
      clearTimeout(confettiTimer.current);
      setConfetti(true);
      confettiTimer.current = setTimeout(() => setConfetti(false), 2600);
    }
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div className="hotline-app" data-world={world.id}>
        <a className="skip-link" href="#studio">
          Skip to the sundae studio
        </a>
        <div className="world-atmosphere" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="announcement-bar">
          <span>A VERY IMPORTANT HOTLINE FOR VERY UNIMPORTANT CRAVINGS</span>
          <span className="announcement-star">✳</span>
          <span>EXCLUSIVELY YOURS, MOBINA</span>
        </div>
        <header className="site-header">
          <a
            href="#"
            className="wordmark"
            aria-label="Ice Cream Hotline home"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "instant" : "smooth",
              });
            }}
          >
            <span className="brand-icon">
              <IceCream2 size={25} strokeWidth={1.6} />
            </span>
            <span>
              ice cream
              <br />
              <b>hotline.</b>
            </span>
          </a>
          <nav
            className={`main-navigation ${mobileMenu ? "mobile-open" : ""}`}
            aria-label="Main navigation"
          >
            {[
              ["studio", "The studio"],
              ["worlds", "Your world"],
              ["arcade", "Play a little"],
              ["little-things", "From Ali"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  visit(id);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className={`sound-button ${sounds.enabled ? "enabled" : ""}`}
              onClick={sounds.toggle}
              aria-pressed={sounds.enabled}
              aria-label={
                sounds.enabled
                  ? "Turn ambient sound off"
                  : "Turn ambient sound on"
              }
            >
              {sounds.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>Sound {sounds.enabled ? "on" : "off"}</span>
            </button>
            <button
              className="profile-button"
              aria-label="Personalise your corner"
              onClick={() => setSettingsOpen(true)}
            >
              {profile.avatar}
              <span>Mobina</span>
              <SlidersHorizontal size={13} />
            </button>
            <button
              className="mobile-menu-button icon-button"
              aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu((value) => !value)}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <main>
          <section className="hero-section">
            <motion.div
              className="hero-copy"
              initial={reducedMotion ? {} : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="eyebrow hero-eyebrow">
                <span className="open-dot" /> A PRIVATE LITTLE CORNER, JUST FOR
                YOU
              </span>
              <h1>
                Life’s a little
                <br />
                sweeter <em>with you.</em>
                <span className="hero-sparkle" aria-hidden="true">
                  ✳
                </span>
              </h1>
              <p>
                Hey, Mobina. Welcome to your happy place.
                <br />A few scoops, a little play, and all the good stuff.
                <br className="desktop-break" /> Made with a whole lot of you in
                mind.
              </p>
              <div className="hero-actions">
                <button
                  className="primary-button hero-cta"
                  onClick={() => visit("studio")}
                >
                  Let me in! <ArrowUpRight size={20} />
                </button>
                <button
                  className="hero-secondary"
                  onClick={() => visit("arcade")}
                >
                  Or, play a little <ArrowRight size={16} />
                </button>
              </div>
              <div className="hero-footnote">
                <span className="drawn-heart">♡</span>
                <span>
                  No rush. No rules.
                  <br />
                  <b>Just a little something to make you smile.</b>
                </span>
              </div>
            </motion.div>
            <motion.div
              className="hero-art"
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <div className="hero-art-arch" />
              <div className="hero-art-orbit" />
              <span className="hero-sticker">
                100%
                <br />
                <i>your kind</i>
                <br />
                OF HAPPY
              </span>
              <span className="handwritten hero-note">
                a little treat
                <br />
                looks good on you <span>↙</span>
              </span>
              <div className="hero-sundae">
                <SundaePreview
                  scoops={HOUSE_SCOOPS}
                  toppings={["sprinkles"]}
                  container="cup"
                  world={world}
                  autoRotate={!reducedMotion}
                  reducedMotion={reducedMotion}
                />
              </div>
              <span className="hero-vertical">
                HANDCRAFTED HAPPINESS · EST. 2026
              </span>
              <div className="hero-art-caption">
                <span className="eyebrow">THE HOUSE FAVOURITE</span>
                <p>Strawberry. Vanilla. A little matcha.</p>
              </div>
              <div className="hero-mascot">
                <ScoopMascot
                  world={world}
                  compact
                  reducedMotion={reducedMotion}
                  dancing={sounds.enabled || audio.isPlaying}
                />
                <span>Oh hey, Mobina.</span>
              </div>
            </motion.div>
          </section>

          <section id="worlds" className="world-selector section-anchor">
            <div>
              <span className="eyebrow">SET THE FEELING</span>
              <p>
                Your corner. <em>Your kind of day.</em>
              </p>
            </div>
            <div className="world-options">
              {WORLDS.map((item) => (
                <button
                  key={item.id}
                  className={world.id === item.id ? "selected" : ""}
                  aria-pressed={world.id === item.id}
                  onClick={() => {
                    setProfile((previous) => ({
                      ...previous,
                      moodId: item.id,
                    }));
                    sounds.chime("scoop");
                  }}
                >
                  <span
                    className="world-swatch"
                    style={{ background: item.colour }}
                  >
                    {item.emoji}
                  </span>
                  <span>{item.name}</span>
                  {world.id === item.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </section>
          <div className="marquee-strip" aria-hidden="true">
            <span>GOOD DAYS</span>
            <i>✳</i>
            <span>GREAT SCOOPS</span>
            <i>✳</i>
            <span>EXTRA SPRINKLES</span>
            <i>✳</i>
            <span>ONLY GOOD VIBES</span>
            <i>✳</i>
            <span>GOOD DAYS</span>
            <i>✳</i>
          </div>

          <SundaeStudio
            {...{
              cart,
              container,
              selectedToppings,
              world,
              reducedMotion,
              starSprinkles,
              rewardUnlocked,
              total,
            }}
            onAdd={add}
            onRemoveOne={removeOne}
            onClear={clear}
            onContainer={setContainer}
            onTopping={topping}
            onStarSprinkles={() => setStarSprinkles((value) => !value)}
            onOpenOrder={() => setOrderOpen(true)}
            favorites={profile.favorites}
            onFavorite={favorite}
            onSurprise={surprise}
            legendaryUnlocked={profile.stamps >= STAMPS_TO_UNLOCK}
          />

          <section className="scoopie-interlude">
            <div className="interlude-star" aria-hidden="true">
              ✳
            </div>
            <div>
              <span className="eyebrow">A VERY QUALIFIED OPINION</span>
              <h2>
                “You deserve the
                <br />
                <em>extra scoop.”</em>
              </h2>
              <p>— Scoopie, professional enabler since five minutes ago.</p>
            </div>
            <ScoopMascot
              world={world}
              scoopCount={scoops.length}
              flavourName={lastFlavour}
              dancing={sounds.enabled || audio.isPlaying}
              reducedMotion={reducedMotion}
            />
          </section>

          <Arcade
            onEnter={enter}
            onReward={reward}
            chime={sounds.chime}
            {...{ rewardUnlocked, reducedMotion }}
          />

          <section
            id="little-things"
            className="little-things-section section-anchor"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <span className="section-number">03</span> IT’S THE LITTLE
                  THINGS
                </span>
                <h2>
                  A little more <em>just because.</em>
                </h2>
              </div>
              <p>
                Some things never get old.
                <br />
                Especially making you smile.
              </p>
            </div>
            <div className="little-things-grid">
              <div className="legacy-content fortune-slot">
                <DailyFortune />
              </div>
              <div className="personal-note">
                <span className="eyebrow">A NOTE FROM THE FOUNDER (ALI)</span>
                <span className="note-star" aria-hidden="true">
                  ✳
                </span>
                <h3>
                  The best things
                  <br />
                  are made <em>personal.</em>
                </h3>
                <p>
                  Like this little corner of the internet.
                  <br />
                  And your very questionable taste in toppings.
                  <br />
                  Kidding. Mostly.
                </p>
                <span className="handwritten">Made for you, always.</span>
                <button
                  className="text-button"
                  onClick={() => setHistoryOpen(true)}
                >
                  Your past little treats <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="legacy-content">
                <RunawayQuestions
                  isOpen={questionsOpen}
                  onToggle={() => setQuestionsOpen((value) => !value)}
                />
              </div>
              <div className="legacy-content">
                <AboutMobina
                  isOpen={aboutOpen}
                  onToggle={() => setAboutOpen((value) => !value)}
                />
              </div>
              <div className="legacy-content">
                <StampCard stamps={profile.stamps} />
              </div>
              <div className="legacy-content">
                <DeliveryHotline />
              </div>
            </div>
          </section>

          <section className="closing-note">
            <span className="closing-doodle">♡</span>
            <h2>
              Same time,
              <br />
              <em>next craving?</em>
            </h2>
            <button className="text-button" onClick={() => visit("studio")}>
              There’s always room for one more <ArrowUpRight size={17} />
            </button>
          </section>
        </main>

        <footer className="site-footer">
          <a className="footer-brand" href="#" aria-label="Back to the top">
            ice cream hotline.
          </a>
          <span>
            Made with a little code & a lot of care.
            <br />
            Exclusively for Mobina. Pretend scoops, real smiles.
          </span>
          <button
            className="text-button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "instant" : "smooth",
              })
            }
          >
            Back to the top ↑
          </button>
        </footer>
        {entered && (
          <DJBooth
            audio={audio}
            isTouch={
              typeof window !== "undefined" &&
              window.matchMedia("(pointer: coarse)").matches
            }
          />
        )}
        <AnimatePresence>
          {scoops.length > 0 && (
            <motion.button
              className="floating-order"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              onClick={() => setOrderOpen(true)}
              aria-label={`Review your order, ${scoops.length} scoop${scoops.length === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={18} />
              <span>
                Your cup <b>{scoops.length}</b>
              </span>
              <strong>${total.toFixed(2)}</strong>
              <ArrowUpRight size={16} />
            </motion.button>
          )}
        </AnimatePresence>
        {!reducedMotion && <Confetti active={confetti} />}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="site-toast"
              role="status"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Sparkles size={16} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog
          open={settingsOpen}
          onClose={closeSettings}
          title="Personalise your corner"
          className="settings-dialog"
        >
          <span className="eyebrow">THE ONLY VIP HERE</span>
          <h2>Your little corner.</h2>
          <label className="field-label" htmlFor="vip-name">
            Your name
          </label>
          <input
            id="vip-name"
            value="Mobina"
            readOnly
            onFocus={() =>
              notify("This little corner has only one VIP: Mobina.")
            }
          />
          <label className="field-label">Pick your little avatar</label>
          <div className="avatar-options">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                aria-label={`Choose ${avatar} avatar`}
                aria-pressed={profile.avatar === avatar}
                className={profile.avatar === avatar ? "selected" : ""}
                onClick={() =>
                  setProfile((previous) => ({ ...previous, avatar }))
                }
              >
                {avatar}
              </button>
            ))}
          </div>
          <button
            className="calm-toggle"
            role="switch"
            aria-checked={calm || Boolean(systemReduced)}
            disabled={Boolean(systemReduced)}
            onClick={() => setCalm((value) => !value)}
          >
            <span>
              <b>Gentler animations</b>
              <small>
                {systemReduced
                  ? "Following your device’s reduced motion setting"
                  : "A calmer corner, with less movement"}
              </small>
            </span>
            <i className={reducedMotion ? "on" : ""} />
          </button>
          <p className="settings-note">
            Your avatar, world, favourites, orders, and original stamp card are
            saved in this browser.
          </p>
        </Dialog>
        <Dialog
          open={orderOpen}
          onClose={closeOrder}
          title="Your cup"
          className="order-dialog"
        >
          <OrderPanel
            mood={mood}
            cartItems={cartItems}
            toppings={TOPPINGS}
            {...{ selectedToppings, container, note, total }}
            onUpdateQty={updateQty}
            onRemove={removeAll}
            onContainer={setContainer}
            onToggleTopping={topping}
            onNote={setNote}
            onPlace={placeOrder}
            onSurprise={surprise}
          />
        </Dialog>
        <ReceiptModal
          open={receiptOpen}
          onClose={closeReceipt}
          receipt={receipt}
        />
        <Dialog
          open={historyOpen}
          onClose={closeHistory}
          title="Your order history"
        >
          <div className="legacy-content">
            {profile.orderHistory.length ? (
              <OrderHistoryPanel
                history={profile.orderHistory}
                onView={(item) => {
                  setReceipt(item);
                  setHistoryOpen(false);
                  setReceiptOpen(true);
                }}
              />
            ) : (
              <div className="history-empty">
                <h2>Your first treat is waiting.</h2>
                <p>
                  Your pretend orders will be saved here. Make something lovely
                  in the sundae studio.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </MotionConfig>
  );
}
