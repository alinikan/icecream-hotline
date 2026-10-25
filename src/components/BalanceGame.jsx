import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { advanceBalanceFall, evaluateBalanceDrop } from "../data/balance.js";

const COLOURS = ["#e5a1ad", "#b8c39b", "#dbc094", "#b6a3cc"];
const initialState = () => ({
  x: 50,
  layers: [],
  score: 0,
  elapsed: 0,
  aimPhase: 0,
  falling: null,
  reason: null,
});

export default function BalanceGame({
  onFinish,
  chime,
  GameIntro,
  GameResult,
}) {
  const [status, setStatus] = useState("ready");
  const [view, setView] = useState({ ...initialState(), remaining: 30 });
  const state = useRef(initialState());
  const arena = useRef(null);
  const moving = useRef(null);
  const cup = useRef(null);

  const drop = useCallback(() => {
    const game = state.current;
    if (
      status !== "running" ||
      game.falling ||
      game.elapsed >= 30 ||
      !moving.current ||
      !arena.current
    )
      return;
    const bounds = arena.current.getBoundingClientRect();
    const scoopBounds = moving.current.getBoundingClientRect();
    const cupBounds = cup.current.getBoundingClientRect();
    const width = arena.current.clientWidth;
    const origin = bounds.left + arena.current.clientLeft;
    const dropCenter = scoopBounds.left + scoopBounds.width / 2 - origin;
    const baseCenter = cupBounds.left + cupBounds.width / 2 - origin;
    const supportX = game.layers.length
      ? (game.layers[game.layers.length - 1] / 100) * width
      : baseCenter;
    const supports = arena.current.querySelectorAll(".stack-scoop");
    const support = game.layers.length
      ? supports[supports.length - 1]
      : cup.current;
    const supportWidth =
      support?.getBoundingClientRect().width || scoopBounds.width;
    const result = evaluateBalanceDrop({
      dropCenter,
      supportCenter: supportX,
      scoopWidth: scoopBounds.width,
      supportWidth,
      baseCenter,
      baseWidth: cupBounds.width,
      stackCenters: game.layers.map((x) => (x / 100) * width),
    });
    const x = (dropCenter / width) * 100;
    // Freeze the horizontal position at the visible scoop's actual location.
    game.x = x;
    game.falling = {
      x,
      elapsed: 0,
      duration: result.landed ? 0.42 : 0.58,
      fromBottom: 82,
      toBottom: result.landed ? 15 + game.layers.length * 6 : -22,
      bottom: 82,
      result,
      finished: false,
    };
    setView({
      ...game,
      layers: [...game.layers],
      remaining: Math.max(0, Math.ceil(30 - game.elapsed)),
    });
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    let frame;
    let previous;
    let lastRender = 0;
    function snapshot() {
      const game = state.current;
      setView({
        ...game,
        layers: [...game.layers],
        falling: game.falling ? { ...game.falling } : null,
        remaining: Math.max(0, Math.ceil(30 - game.elapsed)),
      });
    }
    function finish(won, reason) {
      state.current.reason = reason;
      snapshot();
      setStatus("done");
      onFinish("balance", state.current.score, won);
    }
    function tick(now) {
      const delta = previous ? Math.max(0, (now - previous) / 1000) : 0;
      previous = now;
      const game = state.current;
      game.elapsed += delta;
      if (game.falling) {
        game.falling = advanceBalanceFall(game.falling, delta);
        if (game.falling.finished) {
          const fall = game.falling;
          if (!fall.result.landed) {
            finish(false, fall.result.reason);
            return;
          }
          game.layers.push(fall.x);
          game.score += fall.result.points;
          game.falling = null;
          game.aimPhase += 1.1;
          chime("topping");
          if (game.layers.length === 8) {
            finish(true, null);
            return;
          }
        }
      } else {
        game.x =
          50 +
          Math.sin(
            game.elapsed * (1.3 + game.layers.length * 0.08) + game.aimPhase,
          ) *
            34;
      }
      if (game.elapsed >= 30 && !game.falling) {
        finish(false, "timeout");
        return;
      }
      if (now - lastRender >= 16) {
        snapshot();
        lastRender = now;
      }
      frame = requestAnimationFrame(tick);
    }
    const key = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) drop();
      }
    };
    const hide = () => {
      if (document.hidden) setStatus("paused");
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [status, drop, onFinish, chime]);

  function start() {
    state.current = initialState();
    setView({ ...initialState(), remaining: 30 });
    setStatus("running");
  }
  const target = view.layers.length ? view.layers[view.layers.length - 1] : 50;
  const won = view.layers.length === 8;
  return (
    <>
      <div className="game-stats">
        <span>
          <b>{view.layers.length}</b> / 8 scoops
        </span>
        <span>
          <b>{view.remaining}s</b> left
        </span>
        <span>
          <b>{view.score}</b> points
        </span>
      </div>
      <div
        className="balance-arena game-arena"
        ref={arena}
        onPointerDown={(event) => {
          if (status === "running" && !event.target.closest("button")) {
            event.preventDefault();
            drop();
          }
        }}
        aria-label="Balance scoops by timing your drop over the dashed guide"
      >
        <div className="game-background-word">steady.</div>
        <div
          className="balance-guide"
          style={{
            left: `${target}%`,
            bottom: `${20 + view.layers.length * 6}%`,
          }}
        />
        <div
          className="balance-target"
          style={{
            left: `${target}%`,
            bottom: `${15 + view.layers.length * 6}%`,
          }}
        />
        <div className="balance-cup" ref={cup}>
          HOTLINE
        </div>
        {view.layers.map((x, index) => (
          <div
            key={index}
            className={`balance-scoop stack-scoop ${view.reason === "unstable" ? "topple" : ""}`}
            style={{
              left: `${x}%`,
              bottom: `${15 + index * 6}%`,
              background: COLOURS[index % COLOURS.length],
              "--layer": index,
            }}
          />
        ))}
        {(status === "running" || status === "paused") && !view.falling && (
          <div
            ref={moving}
            className="balance-scoop moving-scoop"
            data-testid="balance-moving-scoop"
            style={{
              left: `${view.x}%`,
              bottom: "82%",
              background: COLOURS[view.layers.length % COLOURS.length],
            }}
          />
        )}
        {view.falling && (
          <div
            className="balance-scoop falling-balance-scoop"
            data-testid="balance-falling-scoop"
            style={{
              left: `${view.falling.x}%`,
              bottom: `${view.falling.bottom}%`,
              background: COLOURS[view.layers.length % COLOURS.length],
            }}
          />
        )}
        {status === "ready" && (
          <GameIntro onStart={start}>
            Time your drop above the dashed guide. Tap the play area, use Drop
            scoop, or press Space. Off-centre scoops fall past the stack. Land
            eight to win.
          </GameIntro>
        )}
        {status === "paused" && (
          <GameIntro onStart={() => setStatus("running")} label="Resume game">
            Game paused. Your stack will stay here.
          </GameIntro>
        )}
        {status === "done" && (
          <GameResult score={view.score} won={won} onRestart={start}>
            {won
              ? "Eight scoops stacked! Confetti sprinkles unlocked."
              : view.reason === "miss"
                ? "That scoop missed the stack. Line it up with the dashed guide before dropping."
                : view.reason === "unstable"
                  ? "The tower leaned too far and tipped over. Keep the weight above the cup."
                  : "Time’s up. Try stacking eight scoops in the next round."}
          </GameResult>
        )}
      </div>
      <div className="game-instructions">
        <span>
          {view.falling && status === "running"
            ? "Scoop falling…"
            : "Align with the guide, then drop."}
        </span>
        <button
          className="primary-button small"
          disabled={status !== "running" || Boolean(view.falling)}
          onClick={drop}
        >
          Drop scoop <ArrowDown size={15} />
        </button>
      </div>
    </>
  );
}
