import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDown,
  Check,
  Plus,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FLAVOURS, TOPPINGS } from "../data/flavours.js";
import { expandScoops, FLAVOUR_COLOURS, MAX_SCOOPS } from "../data/studio.js";

const Scene = lazy(() => import("./SundaeScene.jsx"));

export function SundaeFallback({ scoops, container = "cup" }) {
  return (
    <div className="sundae-fallback" aria-hidden="true">
      <div className="fallback-stack">
        {scoops
          .slice()
          .reverse()
          .map((scoop, index) => (
            <span
              key={`${scoop.key}-${index}`}
              className="fallback-scoop"
              style={{
                background: `radial-gradient(circle at 30% 25%, #ffffff88, transparent 55%), ${scoop.colour}`,
                zIndex: scoops.length - index,
              }}
            />
          ))}
      </div>
      <div className={`fallback-container ${container}`}>
        <span>
          ice cream
          <br />
          <b>HOTLINE</b>
        </span>
      </div>
    </div>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function SundaePreview(props) {
  const [supported] = useState(() => {
    try {
      return Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      return false;
    }
  });
  const fallback = <SundaeFallback {...props} />;
  return supported ? (
    <SceneBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Scene {...props} />
      </Suspense>
    </SceneBoundary>
  ) : (
    fallback
  );
}

export default function SundaeStudio({
  cart,
  onAdd,
  onRemoveOne,
  onClear,
  container,
  onContainer,
  selectedToppings,
  onTopping,
  world,
  reducedMotion,
  starSprinkles,
  onStarSprinkles,
  rewardUnlocked,
  onOpenOrder,
  total,
  favorites,
  onFavorite,
  onSurprise,
  onScoopHover,
  legendaryUnlocked,
}) {
  const scoops = useMemo(() => expandScoops(cart, FLAVOURS), [cart]);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [category, setCategory] = useState("all");
  const [pouring, setPouring] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stage = useRef();
  const pourTimer = useRef();
  const suppressClick = useRef(false);
  useEffect(() => () => clearTimeout(pourTimer.current), []);
  const menu = FLAVOURS.filter(
    (flavour) => !flavour.legendary || legendaryUnlocked,
  ).filter(
    (flavour) =>
      category === "all" ||
      (category === "favorites"
        ? favorites.includes(flavour.id)
        : flavour.tags.includes(category)),
  );
  function applyTopping(topping) {
    if (!selectedToppings.includes(topping.id) && scoops.length) {
      setPouring(topping.id);
      clearTimeout(pourTimer.current);
      pourTimer.current = setTimeout(() => setPouring(null), 1000);
    }
    onTopping(topping.id);
  }
  return (
    <section id="studio" className="studio-section section-anchor">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <span className="section-number">01</span> THE SUNDAE STUDIO
          </span>
          <h2>Mix your own sundae.</h2>
        </div>
        <p>Drag a flavour into the cup, or tap to add it.</p>
      </div>
      <div className="studio-layout">
        <div className="creation-column">
          <div
            ref={stage}
            className={`creation-stage ${dropActive || dragging ? "drop-ready" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDropActive(true);
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDropActive(false);
              const id = event.dataTransfer.getData(
                "application/x-hotline-flavour",
              );
              const flavour = FLAVOURS.find((item) => item.id === id);
              if (flavour) onAdd(flavour);
            }}
          >
            <div className="stage-topline">
              <span className="live-pill">
                <i /> MADE BY MOBINA
              </span>
              <button
                className="text-button"
                disabled={!scoops.length}
                onClick={onClear}
              >
                <RotateCcw size={13} /> Start fresh
              </button>
            </div>
            <span className="stage-orbit orbit-one" />
            <span className="stage-orbit orbit-two" />
            <SundaePreview
              {...{
                scoops,
                container,
                rotation,
                autoRotate,
                reducedMotion,
                world,
                starSprinkles,
              }}
              toppings={selectedToppings}
            />
            {!scoops.length && (
              <div className="empty-stage-message">
                <ArrowDown size={18} />
                <span>Add a scoop to start building.</span>
              </div>
            )}
            <AnimatePresence>
              {pouring && !reducedMotion && (
                <motion.div
                  key={pouring}
                  className={`topping-shower ${pouring.includes("Sauce") ? "is-sauce" : ""}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                >
                  <span>
                    {TOPPINGS.find((item) => item.id === pouring)?.emoji}
                  </span>
                  {Array.from({ length: 16 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        "--i": i,
                        "--shower-colour":
                          pouring === "chocSauce"
                            ? "#654230"
                            : pouring === "caramelSauce"
                              ? "#bf8d4b"
                              : ["#e3b56c", "#da8ca2", "#99b9a4"][i % 3],
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="stage-bottomline">
              <span>
                {scoops.length} / {MAX_SCOOPS} scoops of happiness
              </span>
              <button
                className={`icon-button ${autoRotate ? "is-active" : ""}`}
                aria-label={
                  autoRotate ? "Stop rotating sundae" : "Auto rotate sundae"
                }
                aria-pressed={autoRotate}
                disabled={reducedMotion}
                onClick={() => setAutoRotate((value) => !value)}
              >
                <RotateCw size={17} />
              </button>
            </div>
          </div>
          <div className="rotation-control">
            <RotateCcw size={13} />
            <input
              aria-label="Rotate your sundae"
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(event) => {
                setRotation(Number(event.target.value));
                setAutoRotate(false);
              }}
            />
            <RotateCw size={13} />
          </div>
          <div className="container-picker" aria-label="Choose a container">
            {[
              ["cup", "The classic cup"],
              ["cone", "Sugar cone"],
              ["waffle", "Waffle cone"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={container === id ? "selected" : ""}
                aria-pressed={container === id}
                onClick={() => onContainer(id)}
              >
                <span className={`container-doodle ${id}`} />
                {label}
                {container === id && <Check size={13} />}
              </button>
            ))}
          </div>
          {scoops.length > 0 && (
            <div
              className="scoop-stack-list"
              aria-label="Scoops in your sundae"
            >
              {scoops.map((scoop) => (
                <motion.button
                  layout
                  key={scoop.key}
                  className="scoop-stack-item"
                  onClick={() => onRemoveOne(scoop.id)}
                  aria-label={`Remove one ${scoop.name} scoop`}
                >
                  <span style={{ background: scoop.colour }} />
                  {scoop.name}
                  <X size={12} />
                </motion.button>
              ))}
            </div>
          )}
          <button
            className="order-summary-button"
            onClick={onOpenOrder}
            disabled={!scoops.length}
          >
            <span>
              <span className="eyebrow">YOUR 3D CREATION</span>
              <strong>
                {scoops.length
                  ? "Add to my order"
                  : "Pick a flavour to get started"}
              </strong>
            </span>
            <span className="order-price">
              ${total.toFixed(2)}
              <span>pretend, of course ↗</span>
            </span>
          </button>
        </div>
        <div className="ingredients-column">
          <div className="ingredient-heading">
            <div>
              <span className="eyebrow">STEP ONE</span>
              <h3>Find your flavour.</h3>
            </div>
            <button className="text-button" onClick={onSurprise}>
              <Sparkles size={15} /> Surprise me
            </button>
          </div>
          <div className="category-tabs" aria-label="Filter flavours">
            {[
              ["all", "All flavours"],
              ["fruity", "Fruity"],
              ["rich", "Chocolatey"],
              ["favorites", "Your favourites"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={category === id ? "selected" : ""}
                aria-pressed={category === id}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flavour-tray">
            {menu.length === 0 && (
              <p className="empty-favorites">
                Tap a little heart on a flavour to save it here.
              </p>
            )}
            {menu.map((flavour) => (
              <motion.div
                layout
                key={flavour.id}
                className="flavour-tile"
                onPointerEnter={() => onScoopHover?.(flavour.name)}
              >
                <button
                  className={`flavour-heart ${favorites.includes(flavour.id) ? "saved" : ""}`}
                  aria-label={`${favorites.includes(flavour.id) ? "Unsave" : "Save"} ${flavour.name}`}
                  aria-pressed={favorites.includes(flavour.id)}
                  onClick={() => onFavorite(flavour.id)}
                >
                  {favorites.includes(flavour.id) ? "♥" : "♡"}
                </button>
                <motion.button
                  className="flavour-add"
                  aria-label={`Add ${flavour.name}`}
                  disabled={scoops.length >= MAX_SCOOPS}
                  drag={!reducedMotion}
                  dragSnapToOrigin
                  dragMomentum={false}
                  whileDrag={{ scale: 1.15, zIndex: 20, cursor: "grabbing" }}
                  onDragStart={() => {
                    setDragging(true);
                    suppressClick.current = true;
                  }}
                  onDragEnd={(event, info) => {
                    setDragging(false);
                    const bounds = stage.current?.getBoundingClientRect();
                    const point = {
                      x: event.clientX ?? info.point.x - window.scrollX,
                      y: event.clientY ?? info.point.y - window.scrollY,
                    };
                    if (
                      bounds &&
                      point.x >= bounds.left &&
                      point.x <= bounds.right &&
                      point.y >= bounds.top &&
                      point.y <= bounds.bottom
                    )
                      onAdd(flavour);
                    setTimeout(() => {
                      suppressClick.current = false;
                    }, 0);
                  }}
                  onClick={() => {
                    if (!suppressClick.current) onAdd(flavour);
                  }}
                >
                  <span
                    className={`flavour-scoop-art flavour-${flavour.id}`}
                    style={{ "--scoop": FLAVOUR_COLOURS[flavour.id] }}
                  >
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="flavour-name">{flavour.name}</span>
                  <span className="flavour-meta">
                    ${flavour.price.toFixed(2)}
                    <span className="flavour-plus">
                      <Plus size={13} />
                    </span>
                  </span>
                </motion.button>
              </motion.div>
            ))}
          </div>
          <div className="toppings-section">
            <div className="ingredient-heading">
              <div>
                <span className="eyebrow">STEP TWO</span>
                <h3>The finishing touches.</h3>
              </div>
              <span className="tiny-muted">A little extra is the point.</span>
            </div>
            <div className="topping-options">
              {TOPPINGS.map((topping) => (
                <button
                  key={topping.id}
                  className={
                    selectedToppings.includes(topping.id) ? "selected" : ""
                  }
                  aria-pressed={selectedToppings.includes(topping.id)}
                  onClick={() => applyTopping(topping)}
                >
                  <span>{topping.emoji}</span>
                  {topping.name}
                  {selectedToppings.includes(topping.id) ? (
                    <Check size={12} />
                  ) : (
                    <Plus size={12} />
                  )}
                </button>
              ))}
            </div>
            {rewardUnlocked ? (
              <button
                className={`arcade-topping ${starSprinkles ? "selected" : ""}`}
                onClick={onStarSprinkles}
                aria-pressed={starSprinkles}
              >
                <Sparkles size={15} /> Arcade confetti sprinkles{" "}
                <span>{starSprinkles ? "Added ✓" : "Add your reward +"}</span>
              </button>
            ) : (
              <p className="arcade-topping-hint">
                <Sparkles size={13} /> Win a game in the arcade to unlock
                confetti sprinkles.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
