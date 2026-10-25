import { useCallback, useMemo, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Gamepad2,
  IceCream2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { FLAVOURS, TOPPINGS } from "../data/flavours.js";
import { addScoop, countScoops, MAX_SCOOPS, WORLDS } from "../data/studio.js";
import useStoredState from "../hooks/useStoredState.js";
import useSoundscape from "../hooks/useSoundscape.js";
import SundaeStudio from "./SundaeStudio.jsx";
import ScoopMascot from "./ScoopMascot.jsx";
import Arcade from "./Arcade.jsx";
import { FeatureThemeContext } from "./Dialog.jsx";
import "../styles/extras.css";

export default function CreativeCorner({
  moodId,
  favorites,
  onFavorite,
  legendaryUnlocked,
  onAddToOrder,
}) {
  const [studioOpen, setStudioOpen] = useState(false);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [worldId, setWorldId] = useStoredState(
    "mh_studio_world_v1",
    moodId,
    (value) => (WORLDS.some((world) => world.id === value) ? value : "cozy"),
  );
  const [calm, setCalm] = useStoredState(
    "mh_calm_v1",
    false,
    (value) => value === true,
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
  const [lastFlavour, setLastFlavour] = useState(null);
  const systemReduced = useReducedMotion();
  const reducedMotion = Boolean(systemReduced || calm);
  const world = WORLDS.find((item) => item.id === worldId) || WORLDS[0];
  const theme = useMemo(
    () => ({ worldId: world.id, reducedMotion }),
    [world.id, reducedMotion],
  );
  const sounds = useSoundscape();
  const total = useMemo(() => {
    const scoops = Object.entries(cart).reduce(
      (sum, [id, qty]) =>
        sum + (FLAVOURS.find((flavour) => flavour.id === id)?.price || 0) * qty,
      0,
    );
    const toppings = selectedToppings.reduce(
      (sum, id) =>
        sum + (TOPPINGS.find((topping) => topping.id === id)?.price || 0),
      0,
    );
    const vessel =
      container === "waffle" ? 1.25 : container === "cone" ? 0.75 : 0;
    const multiplier =
      moodId === "hungry" ? 1.06 : moodId === "celebration" ? 1.04 : 1;
    return countScoops(cart) ? (scoops + toppings + vessel) * multiplier : 0;
  }, [cart, container, selectedToppings, moodId]);
  const unlockReward = useCallback(
    () => setRewardUnlocked(true),
    [setRewardUnlocked],
  );
  function add(flavour) {
    if (
      countScoops(cart) >= MAX_SCOOPS ||
      (flavour.legendary && !legendaryUnlocked)
    )
      return;
    setCart((previous) => addScoop(previous, flavour.id));
    setLastFlavour(flavour.name);
    sounds.chime("scoop");
  }
  function remove(id) {
    setCart((previous) => {
      const next = { ...previous };
      if (next[id] > 1) next[id]--;
      else delete next[id];
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
  function surprise() {
    const menu = FLAVOURS.filter(
      (flavour) => !flavour.legendary || legendaryUnlocked,
    );
    const next = {};
    for (let index = 0; index < 3; index++) {
      const flavour = menu[Math.floor(Math.random() * menu.length)];
      next[flavour.id] = (next[flavour.id] || 0) + 1;
    }
    setCart(next);
    setSelectedToppings(["sprinkles"]);
    setLastFlavour(null);
    sounds.chime("scoop");
  }
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <FeatureThemeContext.Provider value={theme}>
        <div
          className="hotline-extras"
          data-world={world.id}
          data-calm={reducedMotion}
        >
          <section className="extras-card glass">
            <button
              className="extras-toggle"
              aria-expanded={studioOpen}
              aria-controls="creative-studio-panel"
              onClick={() => setStudioOpen((value) => !value)}
            >
              <span className="extras-icon">
                <IceCream2 size={23} />
              </span>
              <span>
                <b>3D Sundae Studio</b>
                <small>Try flavours and toppings in 3D 🍦</small>
              </span>
              {studioOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {studioOpen && (
              <div id="creative-studio-panel" className="extras-panel">
                <div className="extras-options">
                  <div
                    className="extras-worlds"
                    aria-label="Choose a studio theme"
                  >
                    {WORLDS.map((item) => (
                      <button
                        key={item.id}
                        aria-pressed={world.id === item.id}
                        onClick={() => setWorldId(item.id)}
                      >
                        <span style={{ background: item.colour }}>
                          {item.emoji}
                        </span>
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <div className="extras-toggles">
                    <button
                      className="extras-option"
                      aria-pressed={sounds.enabled}
                      onClick={sounds.toggle}
                    >
                      {sounds.enabled ? (
                        <Volume2 size={15} />
                      ) : (
                        <VolumeX size={15} />
                      )}{" "}
                      Sound effects {sounds.enabled ? "on" : "off"}
                    </button>
                    <button
                      className="extras-option"
                      role="switch"
                      aria-checked={reducedMotion}
                      disabled={Boolean(systemReduced)}
                      onClick={() => setCalm((value) => !value)}
                    >
                      Gentler motion {reducedMotion ? "on" : "off"}
                    </button>
                  </div>
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
                    favorites,
                    legendaryUnlocked,
                  }}
                  onAdd={add}
                  onRemoveOne={remove}
                  onClear={clear}
                  onContainer={setContainer}
                  onTopping={topping}
                  onStarSprinkles={() => {
                    setStarSprinkles((value) => !value);
                    sounds.chime("topping");
                  }}
                  onFavorite={onFavorite}
                  onSurprise={surprise}
                  onOpenOrder={() => {
                    onAddToOrder({
                      cart,
                      container,
                      toppings: selectedToppings,
                    });
                    clear();
                  }}
                />
                <div className="extras-mascot">
                  <ScoopMascot
                    world={world}
                    scoopCount={countScoops(cart)}
                    flavourName={lastFlavour}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>
            )}
          </section>
          <section className="extras-card glass">
            <button
              className="extras-toggle"
              aria-expanded={arcadeOpen}
              aria-controls="creative-arcade-panel"
              onClick={() => setArcadeOpen((value) => !value)}
            >
              <span className="extras-icon">
                <Gamepad2 size={23} />
              </span>
              <span>
                <b>Mini Arcade</b>
                <small>Three quick games and a sprinkle reward 🎮</small>
              </span>
              {arcadeOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {arcadeOpen && (
              <div id="creative-arcade-panel" className="extras-panel">
                <div className="extras-game-sound">
                  <button
                    className="extras-option"
                    aria-pressed={sounds.enabled}
                    onClick={sounds.toggle}
                  >
                    {sounds.enabled ? (
                      <Volume2 size={15} />
                    ) : (
                      <VolumeX size={15} />
                    )}{" "}
                    Sound effects {sounds.enabled ? "on" : "off"}
                  </button>
                </div>
                <Arcade
                  onReward={unlockReward}
                  chime={sounds.chime}
                  {...{ rewardUnlocked, reducedMotion }}
                />
              </div>
            )}
          </section>
        </div>
      </FeatureThemeContext.Provider>
    </MotionConfig>
  );
}
