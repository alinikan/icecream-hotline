import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function iceGeometry(seed) {
  const geometry = new THREE.SphereGeometry(0.59, 40, 28);
  const vertices = geometry.attributes.position;
  const point = new THREE.Vector3();
  for (let index = 0; index < vertices.count; index++) {
    point.fromBufferAttribute(vertices, index);
    const noise =
      1 +
      0.035 * Math.sin(point.x * 24 + seed) * Math.cos(point.z * 22 + seed) +
      0.028 * Math.sin(point.y * 32 - seed) +
      0.028 * Math.cos(point.x * 15 + point.z * 19);
    point.multiplyScalar(noise);
    vertices.setXYZ(index, point.x, point.y * 0.94, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Cup({ container }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f5d9a5";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#bd8c52";
    ctx.lineWidth = 9;
    for (let offset = -512; offset < 1024; offset += 64) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 512, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset - 512, 512);
      ctx.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  const label = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff8e9";
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = "#c85c48";
    ctx.textAlign = "center";
    ctx.font = "italic 54px Georgia";
    ctx.fillText("ice cream", 256, 105);
    ctx.font = "bold 78px Georgia";
    ctx.fillText("HOTLINE", 256, 188);
    ctx.font = "23px sans-serif";
    ctx.fillText("MADE FOR MOBINA", 256, 250);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  useEffect(
    () => () => {
      texture.dispose();
      label.dispose();
    },
    [texture, label],
  );
  if (container !== "cup")
    return (
      <group>
        <mesh castShadow position={[0, -0.84, 0]}>
          <cylinderGeometry
            args={[0.68, container === "waffle" ? 0.2 : 0.025, 1.22, 64]}
          />
          <meshStandardMaterial map={texture} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.64, 0.045, 12, 64]} />
          <meshStandardMaterial color="#dba563" roughness={0.9} />
        </mesh>
      </group>
    );
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.76, 0.55, 0.96, 64]} />
        <meshStandardMaterial color="#ee8a73" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.745, 0.043, 16, 72]} />
        <meshStandardMaterial color="#fff4da" />
      </mesh>
      <mesh position={[0, -1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.025, 12, 64]} />
        <meshStandardMaterial color="#d76958" />
      </mesh>
      <mesh position={[0, -0.79, 0.682]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.77, 0.49]} />
        <meshStandardMaterial map={label} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Scoop({ colour, index, flavour, position, animate }) {
  const ref = useRef();
  const time = useRef(0);
  const geometry = useMemo(
    () => iceGeometry(index * 17 + (flavour?.length || 0)),
    [index, flavour],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    time.current = Math.min(1, time.current + delta * 2.2);
    ref.current.position.y =
      position[1] + (animate ? (1 - time.current) ** 2 * 1.4 : 0);
    const scale = animate ? Math.min(1, time.current * 3) : 1;
    ref.current.scale.setScalar(scale);
  });
  const flecks = [
    "cookies",
    "mint",
    "choc",
    "rocky",
    "cake",
    "legendary",
    "pistachio",
  ].includes(flavour);
  return (
    <group ref={ref} position={position}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={colour} roughness={0.86} />
      </mesh>
      {flecks &&
        Array.from({ length: 23 }, (_, i) => {
          const angle = i * 2.4;
          const py = Math.sin(i * 11.3) * 0.47;
          const radius = Math.sqrt(0.59 ** 2 - py ** 2);
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                py,
                Math.sin(angle) * radius,
              ]}
              rotation={[angle, i, 1]}
            >
              <boxGeometry args={[0.045, 0.026, 0.06]} />
              <meshStandardMaterial
                color={
                  flavour === "cake"
                    ? ["#d17691", "#79a48a", "#edbc62"][i % 3]
                    : "#543529"
                }
              />
            </mesh>
          );
        })}
    </group>
  );
}

const POSITIONS = [
  [-0.29, 0.08, 0.08],
  [0.3, 0.13, -0.03],
  [0.01, 0.81, 0],
  [-0.13, 1.39, 0],
  [0.14, 1.96, 0],
  [-0.05, 2.52, 0],
];

function Toppings({ toppings, top, starSprinkles }) {
  const topPosition = top < 0 ? [0, 0.1, 0] : POSITIONS[top];
  const drip = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        Array.from({ length: 45 }, (_, index) => {
          const angle = (index / 44) * Math.PI * 4;
          const radius = 0.12 + (index / 44) * 0.4;
          return new THREE.Vector3(
            topPosition[0] + Math.cos(angle) * radius,
            topPosition[1] + 0.59 - (index / 44) * 0.27,
            Math.sin(angle) * radius,
          );
        }),
      ),
    [top],
  );
  return (
    <group>
      {(toppings.includes("chocSauce") ||
        toppings.includes("caramelSauce")) && (
        <mesh castShadow>
          <tubeGeometry args={[drip, 80, 0.035, 8, false]} />
          <meshStandardMaterial
            color={toppings.includes("chocSauce") ? "#56382b" : "#bd7941"}
            roughness={0.4}
          />
        </mesh>
      )}
      {(toppings.includes("sprinkles") || starSprinkles) &&
        Array.from({ length: 46 }, (_, index) => {
          const angle = index * 2.4;
          const py = 0.1 + ((index % 9) / 9) * 0.42;
          const radius = Math.sqrt(Math.max(0, 0.6 ** 2 - py ** 2));
          return (
            <mesh
              key={index}
              castShadow
              position={[
                topPosition[0] + Math.cos(angle) * radius,
                topPosition[1] + py,
                Math.sin(angle) * radius,
              ]}
              rotation={[angle, index, angle / 2]}
            >
              <capsuleGeometry
                args={[0.016, starSprinkles ? 0.085 : 0.055, 3, 5]}
              />
              <meshStandardMaterial
                color={
                  ["#f6d26e", "#e88695", "#7eab9c", "#f9eee0", "#9881bb"][
                    index % 5
                  ]
                }
              />
            </mesh>
          );
        })}
      {toppings
        .filter(
          (id) =>
            !["sprinkles", "chocSauce", "caramelSauce", "coneDip"].includes(id),
        )
        .map((id, layer) =>
          Array.from({ length: id === "whip" ? 7 : 12 }, (_, index) => {
            const angle = index * 2.4 + layer;
            const radius =
              id === "whip" ? 0.19 : 0.4 * Math.sqrt((index + 1) / 12);
            const size =
              id === "berries"
                ? 0.075
                : id === "whip"
                  ? 0.15 - index * 0.011
                  : id === "marshmallow"
                    ? 0.06
                    : 0.035;
            const colours = {
              nuts: "#c68e50",
              oreos: "#573f35",
              berries: "#66618b",
              whip: "#fff7e4",
              marshmallow: index % 2 ? "#f2c5cc" : "#fff1e1",
              biscoff: "#ba8050",
            };
            return (
              <mesh
                key={`${id}-${index}`}
                castShadow
                position={[
                  topPosition[0] + Math.cos(angle) * radius,
                  topPosition[1] + 0.5 + (id === "whip" ? index * 0.035 : 0.02),
                  Math.sin(angle) * radius,
                ]}
              >
                <sphereGeometry args={[size, 10, 8]} />
                <meshStandardMaterial
                  color={colours[id] || "#bc855a"}
                  roughness={0.9}
                />
              </mesh>
            );
          }),
        )}
      {toppings.includes("coneDip") && (
        <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.75, 0.06, 12, 60]} />
          <meshStandardMaterial color="#593d31" />
        </mesh>
      )}
    </group>
  );
}

function Sculpture({
  scoops,
  toppings,
  container,
  rotation,
  autoRotate,
  reducedMotion,
  starSprinkles,
  visible,
}) {
  const ref = useRef();
  const spin = useRef(0);
  useFrame((state, delta) => {
    if (!ref.current) return;
    if (autoRotate && !reducedMotion && visible) spin.current += delta * 0.26;
    ref.current.rotation.y = (rotation * Math.PI) / 180 + spin.current;
    ref.current.position.y =
      !reducedMotion && visible
        ? Math.sin(state.clock.elapsedTime * 1.15) * 0.035 - 0.15
        : -0.15;
  });
  const scale = scoops.length > 3 ? 3.5 / (scoops.length * 0.57 + 1.5) : 1.03;
  return (
    <group ref={ref} scale={scale}>
      <Cup container={container} />
      {scoops.map((scoop, index) => (
        <Scoop
          key={`${scoop.key}-${index}`}
          flavour={scoop.id}
          colour={scoop.colour}
          index={index}
          position={scoops.length === 1 ? [0, 0.08, 0] : POSITIONS[index]}
          animate={!reducedMotion}
        />
      ))}
      {scoops.length > 0 && (
        <Toppings
          toppings={toppings}
          top={scoops.length === 1 ? -1 : scoops.length - 1}
          starSprinkles={starSprinkles}
        />
      )}
    </group>
  );
}

export default function SundaeScene({
  scoops,
  toppings = [],
  container = "cup",
  rotation = 0,
  autoRotate = false,
  reducedMotion = false,
  starSprinkles = false,
  world,
}) {
  const holder = useRef();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "50px" },
    );
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={holder} className="three-scene" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [3, 2.1, 7], fov: 34 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        frameloop={!reducedMotion && visible ? "always" : "demand"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.6} />
        <hemisphereLight
          args={[
            "#fff4e4",
            world.id === "needahug" ? "#8575aa" : "#d0b597",
            1.2,
          ]}
        />
        <directionalLight
          castShadow
          position={[4, 6, 5]}
          intensity={3.1}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.001}
        />
        <directionalLight
          position={[-4, 2, -2]}
          color={world.scene}
          intensity={2.2}
        />
        <Sculpture
          {...{
            scoops,
            toppings,
            container,
            rotation,
            autoRotate,
            reducedMotion,
            starSprinkles,
            visible,
          }}
        />
        <mesh
          receiveShadow
          position={[0, -1.6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[2.1, 64]} />
          <shadowMaterial transparent opacity={0.16} />
        </mesh>
      </Canvas>
    </div>
  );
}
