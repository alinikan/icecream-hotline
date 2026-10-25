import { useEffect, useId, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const QUIPS = [
  "Official scoop tester.",
  "Nice combination.",
  "That’s a serious stack.",
  "Ready for another flavour?",
  "Extra sprinkles? Good call.",
];

export default function ScoopMascot({
  world,
  scoopCount = 0,
  flavourName,
  dancing = false,
  reducedMotion = false,
  compact = false,
}) {
  const mascotId = useId().replace(/:/g, "");
  const [reaction, setReaction] = useState(null);
  const [quip, setQuip] = useState(0);
  const [boop, setBoop] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const eyeX = useSpring(x, { stiffness: 120, damping: 20 });
  const eyeY = useSpring(y, { stiffness: 120, damping: 20 });
  useEffect(() => {
    if (reducedMotion) return;
    const follow = (event) => {
      x.set((event.clientX / window.innerWidth - 0.5) * 9);
      y.set((event.clientY / window.innerHeight - 0.5) * 7);
    };
    window.addEventListener("pointermove", follow, { passive: true });
    return () => window.removeEventListener("pointermove", follow);
  }, [reducedMotion, x, y]);
  useEffect(() => {
    if (scoopCount) {
      setQuip(scoopCount % QUIPS.length);
      setReaction(flavourName ? `${flavourName}? Solid choice.` : null);
    } else setReaction(null);
  }, [scoopCount, flavourName]);

  return (
    <div className={`mascot-card ${compact ? "mascot-compact" : ""}`}>
      <motion.button
        type="button"
        className="mascot-button"
        aria-label="Say hello to Scoopie, your ice cream mascot"
        onClick={() => {
          setReaction(null);
          setBoop((value) => !value);
          setQuip((value) => (value + 1) % QUIPS.length);
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={reducedMotion ? {} : { rotate: -5 }}
      >
        <motion.svg
          viewBox="0 0 200 220"
          role="img"
          aria-label="A smiling pink ice cream character"
          animate={
            reducedMotion
              ? {}
              : {
                  y: [0, -5, 0],
                  rotate: dancing ? [-7, 7, -7] : boop ? [0, -8, 8, 0] : 0,
                }
          }
          transition={{
            y: { repeat: Infinity, duration: 3 },
            rotate: {
              repeat: dancing ? Infinity : 0,
              duration: dancing ? 0.65 : 0.5,
            },
          }}
        >
          <defs>
            <linearGradient id={`${mascotId}-cone`} x2="1" y2="1">
              <stop stopColor="#ecc48f" />
              <stop offset="1" stopColor="#cf9152" />
            </linearGradient>
            <linearGradient id={`${mascotId}-scoop`} x2=".7" y2="1">
              <stop stopColor="#ffd7d7" />
              <stop offset="1" stopColor="#ef9eac" />
            </linearGradient>
            <clipPath id={`${mascotId}-cone-clip`}>
              <path d="M62 126h76l-32 72q-6 11-12 0z" />
            </clipPath>
          </defs>
          <ellipse cx="100" cy="208" rx="39" ry="5" fill="#573c3020" />
          <path
            d="M66 135Q40 132 37 114M135 134q24 1 30-20"
            fill="none"
            stroke="#775344"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M87 186l-8 17M114 186l9 17"
            stroke="#775344"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M62 126h76l-32 72q-6 11-12 0z"
            fill={`url(#${mascotId}-cone)`}
            stroke="#a97142"
            strokeWidth="2"
          />
          <g
            clipPath={`url(#${mascotId}-cone-clip)`}
            stroke="#b17c45"
            strokeWidth="2"
            opacity=".55"
          >
            <path d="M45 130l90 74M61 121l90 74M80 116l83 70M159 130l-90 74M143 121l-90 74M124 116l-83 70" />
          </g>
          <path
            d="M47 100C29 65 54 27 83 30c20-24 66-2 67 27 24 10 25 49 6 64-7 16-22 14-29 7-8 10-23 10-31 2-12 9-29 7-33-4-15 6-26-8-16-26z"
            fill={`url(#${mascotId}-scoop)`}
            stroke="#cc7d89"
            strokeWidth="2"
          />
          <path
            d="M60 58q9-16 24-16"
            fill="none"
            stroke="#fff4ef"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".85"
          />
          <g strokeWidth="4" strokeLinecap="round">
            <path d="M107 35l5 5" stroke="#f7c968" />
            <path d="M133 66l-5 6" stroke="#fff6e6" />
            <path d="M69 85l-5-3" stroke="#c27da5" />
            <path d="M94 61l6-1" stroke="#7c9d85" />
            <path d="M143 100l5 3" stroke="#c27da5" />
          </g>
          <motion.g style={reducedMotion ? {} : { x: eyeX, y: eyeY }}>
            <ellipse
              cx="81"
              cy="94"
              rx="4"
              ry={boop ? 1.7 : 6}
              fill="#573c30"
            />
            <ellipse
              cx="119"
              cy="94"
              rx="4"
              ry={boop ? 1.7 : 6}
              fill="#573c30"
            />
            <circle cx="82" cy="92" r="1.3" fill="white" />
            <circle cx="120" cy="92" r="1.3" fill="white" />
          </motion.g>
          <ellipse
            cx="68"
            cy="107"
            rx="9"
            ry="5"
            fill="#e58a99"
            opacity=".65"
          />
          <ellipse
            cx="132"
            cy="107"
            rx="9"
            ry="5"
            fill="#e58a99"
            opacity=".65"
          />
          <path
            d="M92 108q8 10 16 0"
            fill="none"
            stroke="#573c30"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {world.id === "celebration" && (
            <>
              <path d="M82 32L100 0l18 32" fill="#a0b9a6" />
              <circle cx="100" cy="2" r="5" fill="#efc568" />
            </>
          )}
          {world.id === "needahug" && (
            <path
              d="M60 43q40-37 80 0"
              fill="none"
              stroke="#ada1d0"
              strokeWidth="14"
              strokeLinecap="round"
            />
          )}
        </motion.svg>
      </motion.button>
      {!compact && (
        <div className="mascot-copy">
          <span className="eyebrow">MEET SCOOPIE</span>
          <p aria-live="polite">{reaction || QUIPS[quip]}</p>
          <span className="tiny-muted">Go on. Give me a little boop.</span>
        </div>
      )}
    </div>
  );
}
