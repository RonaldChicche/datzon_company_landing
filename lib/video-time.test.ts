import { expect, it } from "vitest";
import { formatTime } from "./video-time";

it("formatea segundos como mm:ss", () => {
  expect(formatTime(0)).toBe("00:00");
  expect(formatTime(7.9)).toBe("00:07");
  expect(formatTime(65)).toBe("01:05");
  expect(formatTime(600)).toBe("10:00");
});

it("tolera NaN, Infinity y negativos", () => {
  expect(formatTime(NaN)).toBe("00:00");
  expect(formatTime(Infinity)).toBe("00:00");
  expect(formatTime(-3)).toBe("00:00");
});
