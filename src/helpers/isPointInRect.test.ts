import { isPointInRect } from "./isPointInRect";

describe("isPointInRect", () => {
  test("should return true when point inside of rect", () => {
    expect(
      isPointInRect([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ])({ x: 5, y: 5 })
    ).toBeTruthy();
  });

  test("should return false when point is outside of rect", () => {
    expect(
      isPointInRect([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ])({ x: 15, y: 15 })
    ).toBeFalsy();
  });

  test("should return true when point is on the edge of rect", () => {
    expect(
      isPointInRect([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ])({ x: 5, y: 10 })
    ).toBeTruthy();
  });

  test("should return true when intersection is in negative plane", () => {
    expect(
      isPointInRect([
        { x: 0, y: 0 },
        { x: -10, y: -10 },
      ])({ x: -5, y: -5 })
    ).toBeTruthy();
  });
});
