export function evaluateBalanceDrop({
  dropCenter,
  supportCenter,
  scoopWidth,
  supportWidth,
  baseCenter,
  baseWidth,
  stackCenters = [],
}) {
  const dimensions = [
    dropCenter,
    supportCenter,
    scoopWidth,
    supportWidth,
    baseCenter,
    baseWidth,
    ...stackCenters,
  ];
  if (
    !dimensions.every(Number.isFinite) ||
    scoopWidth <= 0 ||
    supportWidth <= 0 ||
    baseWidth <= 0
  ) {
    return { landed: false, reason: "invalid", points: 0, overlap: 0 };
  }
  const left = Math.max(
    dropCenter - scoopWidth / 2,
    supportCenter - supportWidth / 2,
  );
  const right = Math.min(
    dropCenter + scoopWidth / 2,
    supportCenter + supportWidth / 2,
  );
  const overlap = Math.max(0, right - left);
  // A thin edge touching the support cannot carry a scoop's weight.
  if (overlap < scoopWidth * 0.62)
    return { landed: false, reason: "miss", points: 0, overlap };
  const centres = [...stackCenters, dropCenter];
  const centreOfMass =
    centres.reduce((sum, centre) => sum + centre, 0) / centres.length;
  if (Math.abs(centreOfMass - baseCenter) > baseWidth * 0.36) {
    return { landed: false, reason: "unstable", points: 0, overlap };
  }
  return {
    landed: true,
    reason: null,
    overlap,
    points: Math.round((overlap / scoopWidth) * 100) + stackCenters.length * 5,
  };
}

export function advanceBalanceFall(fall, delta) {
  const elapsed = Math.min(
    fall.duration,
    fall.elapsed + Math.max(0, Number.isFinite(delta) ? delta : 0),
  );
  const progress = elapsed / fall.duration;
  return {
    ...fall,
    elapsed,
    bottom:
      fall.fromBottom + (fall.toBottom - fall.fromBottom) * progress * progress,
    finished: elapsed >= fall.duration,
  };
}
