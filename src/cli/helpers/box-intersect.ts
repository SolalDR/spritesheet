interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Check if two box are collided
 */
export const doBoxesIntersect = (a: Box, b: Box) => {
  const minA = [a.x, a.y]
  const minB = [b.x, b.y]
  const maxA = [a.x + a.w, a.y + a.h]
  const maxB = [b.x + b.w, b.y + b.h]

  return maxA[0] <= minB[0] ||
    minA[0] >= maxB[0] ||
    maxA[1] <= minB[1] ||
    minA[1] >= maxB[1]
    ? false
    : true
}
