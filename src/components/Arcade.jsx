import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import Dialog from "./Dialog.jsx";
import BalanceGame from "./BalanceGame.jsx";
import { isCaught, shufflePairs } from "../data/studio.js";
import useStoredState from "../hooks/useStoredState.js";

const GAMES = [
  {
    id: "catch",
    number: "01",
    name: "Scoop & catch",
    description:
      "A little rain. A little reflex. Catch ten scoops before the clock runs out.",
    detail: "20 SECONDS · REFLEXES",
    colour: "peach",
  },
  {
    id: "match",
    number: "02",
    name: "Flavour match",
    description: "Find all six matching pairs. See how few moves you need.",
    detail: "6 PAIRS · MEMORY",
    colour: "sage",
  },
  {
    id: "balance",
    number: "03",
    name: "The balancing act",
    description: "Stack them high. Keep your cool. Eight scoops is the dream.",
    detail: "8 SCOOPS · TIMING",
    colour: "lavender",
  },
];

function GameIntro({ children, onStart, label = "Let's play" }) {
  return (
    <div className="game-overlay">
      <div className="game-intro-icon">✳</div>
      <p>{children}</p>
      <button className="primary-button" onClick={onStart}>
        <Play size={16} />
        {label}
      </button>
    </div>
  );
}

function GameResult({ score, won, onRestart, children }) {
  return (
    <div className="game-overlay game-result" role="status">
      <span className="game-result-icon">{won ? "✦" : "↻"}</span>
      <span className="eyebrow">
        {won ? "SWEET VICTORY" : "ONE MORE LITTLE TRY?"}
      </span>
      <h3>
        {won ? "You absolutely scooped it." : "Good try. Have another go!"}
      </h3>
      <p>{children}</p>
      <strong className="game-result-score">
        {score}
        <span>POINTS</span>
      </strong>
      <button className="primary-button" onClick={onRestart}>
        <RotateCcw size={15} /> Play again
      </button>
    </div>
  );
}

function CatchGame({ onFinish, chime }) {
  const [status, setStatus] = useState("ready");
  const [view, setView] = useState({
    items: [],
    basket: 50,
    score: 0,
    remaining: 20,
  });
  const state = useRef({
    items: [],
    basket: 50,
    score: 0,
    elapsed: 0,
    spawn: 0,
    serial: 0,
  });
  const arena = useRef();
  const keys = useRef(new Set());
  const start = () => {
    state.current = {
      items: [],
      basket: 50,
      score: 0,
      elapsed: 0,
      spawn: 0,
      serial: 0,
    };
    keys.current.clear();
    setView({ items: [], basket: 50, score: 0, remaining: 20 });
    setStatus("running");
  };
  useEffect(() => {
    if (status !== "running") return;
    let frame;
    let previous;
    let lastRender = 0;
    function tick(now) {
      const elapsedDelta = previous ? Math.max(0, (now - previous) / 1000) : 0;
      const delta = Math.min(elapsedDelta, 0.05);
      previous = now;
      const game = state.current;
      game.elapsed += elapsedDelta;
      game.spawn += elapsedDelta;
      if (keys.current.has("ArrowLeft"))
        game.basket = Math.max(8, game.basket - delta * 80);
      if (keys.current.has("ArrowRight"))
        game.basket = Math.min(92, game.basket + delta * 80);
      if (game.spawn > 0.63) {
        game.spawn = 0;
        game.items.push({
          id: game.serial++,
          x: 9 + Math.random() * 82,
          y: -5,
          colour: ["#e6a6af", "#b3c393", "#c5afd1", "#e4bd83"][game.serial % 4],
        });
      }
      game.items = game.items.filter((item) => {
        item.y += delta * (31 + game.elapsed * 0.4);
        if (isCaught(item, game.basket)) {
          game.score++;
          chime("topping");
          return false;
        }
        return item.y < 105;
      });
      if (now - lastRender > 30) {
        setView({
          items: game.items.map((item) => ({ ...item })),
          basket: game.basket,
          score: game.score,
          remaining: Math.max(0, Math.ceil(20 - game.elapsed)),
        });
        lastRender = now;
      }
      if (game.elapsed >= 20) {
        setView({
          items: [],
          basket: game.basket,
          score: game.score,
          remaining: 0,
        });
        setStatus("done");
        onFinish("catch", game.score * 10, game.score >= 10);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    const down = (event) => {
      if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        keys.current.add(event.key);
      }
    };
    const up = (event) => keys.current.delete(event.key);
    const hide = () => {
      if (document.hidden) {
        keys.current.clear();
        setStatus("paused");
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("visibilitychange", hide);
      keys.current.clear();
    };
  }, [status, onFinish, chime]);
  function move(event) {
    if (status !== "running") return;
    const bounds = arena.current.getBoundingClientRect();
    state.current.basket = Math.max(
      8,
      Math.min(92, ((event.clientX - bounds.left) / bounds.width) * 100),
    );
  }
  return (
    <>
      <div className="game-stats">
        <span>
          <b>{view.score}</b> / 10 scoops
        </span>
        <span>
          <b>{view.remaining}s</b> left
        </span>
        <button
          className="icon-button"
          disabled={status !== "running" && status !== "paused"}
          aria-label={status === "paused" ? "Resume game" : "Pause game"}
          onClick={() =>
            setStatus((value) => (value === "running" ? "paused" : "running"))
          }
        >
          {status === "paused" ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
      <div
        className="catch-arena game-arena"
        ref={arena}
        onPointerMove={move}
        onPointerDown={(event) => {
          if (status === "running" && !event.target.closest("button")) {
            arena.current.setPointerCapture(event.pointerId);
            move(event);
          }
        }}
        aria-label="Scoop catching game. Move with your pointer, touch, or left and right arrow keys."
      >
        <div className="game-background-word">sweet!</div>
        {view.items.map((item) => (
          <div
            key={item.id}
            className="falling-scoop"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              background: item.colour,
            }}
          />
        ))}
        <div className="catch-basket" style={{ left: `${view.basket}%` }}>
          <span>HOTLINE</span>
        </div>
        {status === "ready" && (
          <GameIntro onStart={start}>
            Move your cup with your mouse, finger, or ← → keys. Catch at least
            ten scoops in twenty seconds.
          </GameIntro>
        )}
        {status === "paused" && (
          <GameIntro onStart={() => setStatus("running")} label="Keep scooping">
            A little breather. Your scoops can wait.
          </GameIntro>
        )}
        {status === "done" && (
          <GameResult
            score={view.score * 10}
            won={view.score >= 10}
            onRestart={start}
          >
            {view.score >= 10
              ? "Confetti sprinkles are yours. Find them in the sundae studio."
              : "Ten scoops unlock confetti sprinkles. You've got this."}
          </GameResult>
        )}
      </div>
      <div className="game-instructions">
        <span>Drag your cup or use ← →</span>
        <div>
          <button
            className="icon-button"
            aria-label="Move basket left"
            disabled={status !== "running"}
            onClick={() => {
              state.current.basket = Math.max(8, state.current.basket - 12);
            }}
          >
            <ArrowLeft size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Move basket right"
            disabled={status !== "running"}
            onClick={() => {
              state.current.basket = Math.min(92, state.current.basket + 12);
            }}
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}

function MatchGame({ onFinish, chime }) {
  const [deck, setDeck] = useState(shufflePairs);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState("ready");
  const finalScore = Math.max(10, 250 - moves * 5 - seconds);
  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(() => {
      if (!document.hidden) setSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (open.length !== 2 || status !== "running") return;
    const timer = setTimeout(() => {
      if (deck[open[0]].pair === deck[open[1]].pair) {
        const next = [...matched, deck[open[0]].pair];
        setMatched(next);
        chime("topping");
        if (next.length === 6) {
          setStatus("done");
          onFinish("match", finalScore, true);
        }
      }
      setOpen([]);
    }, 650);
    return () => clearTimeout(timer);
  }, [open, status, deck, matched, onFinish, chime, finalScore]);
  function start() {
    setDeck(shufflePairs());
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStatus("running");
  }
  function flip(index) {
    if (
      status !== "running" ||
      open.length >= 2 ||
      open.includes(index) ||
      matched.includes(deck[index].pair)
    )
      return;
    if (open.length === 1) setMoves((value) => value + 1);
    setOpen((value) => [...value, index]);
  }
  return (
    <>
      <div className="game-stats">
        <span>
          <b>{matched.length}</b> / 6 pairs
        </span>
        <span>
          <b>{moves}</b> moves
        </span>
        <span>
          <b>{seconds}s</b>
        </span>
      </div>
      <div className="matching-arena game-arena">
        <div className="memory-grid">
          {deck.map((card, index) => {
            const revealed =
              open.includes(index) || matched.includes(card.pair);
            return (
              <button
                key={card.id}
                className={`memory-card ${revealed ? "flipped" : ""} ${matched.includes(card.pair) ? "matched" : ""}`}
                aria-label={
                  revealed
                    ? `${card.symbol}${matched.includes(card.pair) ? ", matched" : ""}`
                    : `Reveal flavour card ${index + 1}`
                }
                disabled={status !== "running" || revealed || open.length >= 2}
                onClick={() => flip(index)}
              >
                <span className="memory-card-back">✳</span>
                <span className="memory-card-face">{card.symbol}</span>
              </button>
            );
          })}
        </div>
        {status === "ready" && (
          <GameIntro onStart={start}>
            Flip two cards at a time. Find all six matching flavours. Find all
            six pairs to win.
          </GameIntro>
        )}
        {status === "done" && (
          <GameResult score={finalScore} won onRestart={start}>
            All six pairs matched in {moves} moves. Confetti sprinkles unlocked.
          </GameResult>
        )}
      </div>
      <div className="game-instructions">
        <span>Tap cards or use Tab + Enter</span>
        <button className="text-button" onClick={start}>
          <RotateCcw size={13} /> New round
        </button>
      </div>
    </>
  );
}

export default function Arcade({
  onEnter,
  onReward,
  chime,
  rewardUnlocked,
  reducedMotion,
}) {
  const [game, setGame] = useState(null);
  const [bests, setBests] = useStoredState("mh_arcade_bests_v1", {}, (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {},
  );
  const onFinish = useCallback(
    (id, score, won) => {
      setBests((previous) => ({
        ...previous,
        [id]: Math.max(Number(previous[id]) || 0, score),
      }));
      if (won) {
        onReward();
        chime("win");
      }
    },
    [onReward, chime, setBests],
  );
  const close = useCallback(() => setGame(null), []);
  const chosen = GAMES.find((item) => item.id === game);
  return (
    <section id="arcade" className="arcade-section section-anchor">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <span className="section-number">02</span> THE LITTLE ARCADE
          </span>
          <h2>Pick a game.</h2>
        </div>
        <div>
          <p>Try a quick round and unlock a topping.</p>
          <span
            className={`arcade-reward-note ${rewardUnlocked ? "unlocked" : ""}`}
          >
            {rewardUnlocked ? <Check size={14} /> : <Sparkles size={14} />}
            {rewardUnlocked
              ? "Your confetti sprinkles are unlocked"
              : "Win any game to unlock confetti sprinkles"}
          </span>
        </div>
      </div>
      <div className="arcade-cards">
        {GAMES.map((item) => (
          <motion.button
            key={item.id}
            className={`arcade-card ${item.colour}`}
            whileHover={reducedMotion ? {} : { y: -7 }}
            onClick={() => {
              onEnter?.();
              setGame(item.id);
            }}
          >
            <div className="arcade-card-top">
              <span className="eyebrow">GAME {item.number}</span>
              <span className="arcade-card-arrow">
                <ArrowUpRight size={20} />
              </span>
            </div>
            <div
              className={`arcade-illustration illustration-${item.id}`}
              aria-hidden="true"
            >
              {item.id === "match" ? (
                <>
                  <i>🍓</i>
                  <i>✳</i>
                  <i>🍓</i>
                </>
              ) : (
                <>
                  <i />
                  <i />
                  <i />
                  <span>HOTLINE</span>
                </>
              )}
            </div>
            <span className="eyebrow arcade-detail">{item.detail}</span>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="arcade-card-bottom">
              <span>
                Let's play <ArrowUpRight size={14} />
              </span>
              <span>
                <Trophy size={12} /> {Number(bests[item.id]) || 0} best
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      <Dialog
        open={Boolean(game)}
        onClose={close}
        title={chosen?.name || "Arcade"}
        className="arcade-dialog"
      >
        <div className="arcade-dialog-heading">
          <span className="eyebrow">A LITTLE FRIENDLY COMPETITION</span>
          <h2>{chosen?.name}</h2>
        </div>
        {game === "catch" && <CatchGame {...{ onFinish, chime }} />}
        {game === "match" && <MatchGame {...{ onFinish, chime }} />}
        {game === "balance" && (
          <BalanceGame {...{ onFinish, chime, GameIntro, GameResult }} />
        )}
      </Dialog>
    </section>
  );
}
