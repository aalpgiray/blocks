export const eliminateMinusZero = (n: number) => {
  if (n === -0) {
    return 0;
  }
  return n;
};
