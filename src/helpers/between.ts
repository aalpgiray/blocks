export const between = (
  a: number,
  b1: number,
  b2: number,
  intersectionBufferPixel: number = 0.1
) => {
  if (a >= b1 - intersectionBufferPixel && a <= b2 + intersectionBufferPixel) {
    return true;
  }
  if (a >= b2 - intersectionBufferPixel && a <= b1 + intersectionBufferPixel) {
    return true;
  }
  return false;
};
