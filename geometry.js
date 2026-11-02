/* Coordinates use the padded cutout of each animal, facing right. */
window.OceanGeometry = (() => {
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const profiles = [];
  for (const sheet of FaunaBounds.sheets) {
    for (const sprite of sheet.sprites) {
      const aspect = (sprite.bounds[3] + 4) / (sprite.bounds[2] + 4);
      const [x, y, rx, ry] = sprite.body;
      profiles[sprite.id] = {
        aspect, mouth: sprite.mouth, body: sprite.body,
        mouthReach: Math.hypot(sprite.mouth[0] - .5, (sprite.mouth[1] - .5) * aspect),
        bodyReach: Math.hypot(Math.abs(x - .5) + rx, (Math.abs(y - .5) + ry) * aspect)
      };
    }
  }
  const anatomy = id => profiles[id];
  const radius = size => Math.max(2.2, size * .028);

  function angle(fish) {
    const pitch = (fish.vy || 0) / Math.max(70, Math.abs(fish.vx || 0));
    return clamp(pitch, -.30, .30) * (fish.dir || 1);
  }
  function snapshot(fish) {
    const {id, x, y, size, dir = 1, vx = 0, vy = 0} = fish;
    return {id, x, y, size, dir, vx, vy};
  }
  function point(fish, nx, ny) {
    const dx = (nx - .5) * fish.size * (fish.dir || 1);
    const dy = (ny - .5) * fish.size * anatomy(fish.id).aspect;
    const pitch = angle(fish), cos = Math.cos(pitch), sin = Math.sin(pitch);
    return {x: fish.x + dx * cos - dy * sin, y: fish.y + dx * sin + dy * cos};
  }
  function mouth(fish) {
    const center = point(fish, ...anatomy(fish.id).mouth);
    return {...center, r: radius(fish.size)};
  }
  function body(fish) {
    const profile = anatomy(fish.id), [x, y, rx, ry] = profile.body;
    return {...point(fish, x, y), rx: rx * fish.size, ry: ry * fish.size * profile.aspect, angle: angle(fish)};
  }
  function poseBetween(start, end, t) {
    const mix = (a, b) => a + (b - a) * t;
    return {id: end.id, dir: end.dir, x: mix(start.x, end.x), y: mix(start.y, end.y),
      size: mix(start.size, end.size), vx: mix(start.vx, end.vx), vy: mix(start.vy, end.vy)};
  }
  function beforeTurn(start, end) {
    // A sprite mirror is instant. Do not trace a bite through the fish's own belly.
    return start.dir === end.dir ? start : {...start, dir: end.dir, vx: end.vx, vy: end.vy};
  }
  function inBodyFrame(point, target) {
    const dx = point.x - target.x, dy = point.y - target.y;
    const cos = Math.cos(target.angle), sin = Math.sin(target.angle);
    return {x: dx * cos + dy * sin, y: -dx * sin + dy * cos};
  }
  function segmentMeetsEllipse(start, end, rx, ry) {
    const x = start.x / rx, y = start.y / ry;
    const dx = (end.x - start.x) / rx, dy = (end.y - start.y) / ry;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? clamp(-(x * dx + y * dy) / lengthSquared, 0, 1) : 0;
    return (x + t * dx) ** 2 + (y + t * dy) ** 2 <= 1;
  }
  function bite(attacker, attackerStart, target, targetStart) {
    const startA = attackerStart || attacker, startB = targetStart || target;
    const sizeA = Math.max(startA.size, attacker.size), sizeB = Math.max(startB.size, target.size);
    const reach = anatomy(attacker.id).mouthReach * sizeA + radius(sizeA) + anatomy(target.id).bodyReach * sizeB;
    // Reject distant pairs before computing any rotated ellipses. Check the
    // whole travel interval, so neither a dash nor moving prey can be skipped.
    const x0 = startA.x - startB.x, x1 = attacker.x - target.x;
    const y0 = startA.y - startB.y, y1 = attacker.y - target.y;
    if (Math.min(x0, x1) > reach || Math.max(x0, x1) < -reach ||
        Math.min(y0, y1) > reach || Math.max(y0, y1) < -reach) return false;

    const previousA = beforeTurn(startA, attacker), previousB = beforeTurn(startB, target);
    const pitchChange = Math.max(Math.abs(angle(attacker) - angle(previousA)), Math.abs(angle(target) - angle(previousB)));
    const steps = Math.max(1, Math.ceil(pitchChange / .045));
    let oldMouth = mouth(previousA), oldBody = body(previousB);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const newMouth = mouth(i === steps ? attacker : poseBetween(previousA, attacker, t));
      const newBody = body(i === steps ? target : poseBetween(previousB, target, t));
      const reachMouth = Math.max(oldMouth.r, newMouth.r);
      if (segmentMeetsEllipse(inBodyFrame(oldMouth, oldBody), inBodyFrame(newMouth, newBody),
          Math.max(oldBody.rx, newBody.rx) + reachMouth, Math.max(oldBody.ry, newBody.ry) + reachMouth)) return true;
      oldMouth = newMouth;
      oldBody = newBody;
    }
    return false;
  }
  function touches(first, second) {
    const a = body(first), b = body(second), dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return true;
    const direction = Math.atan2(dy, dx);
    const radialExtent = ellipse => 1 / Math.hypot(Math.cos(direction - ellipse.angle) / ellipse.rx,
      Math.sin(direction - ellipse.angle) / ellipse.ry);
    return distance <= radialExtent(a) + radialExtent(b);
  }
  return {anatomy, angle, snapshot, point, mouth, body, bite, touches};
})();
