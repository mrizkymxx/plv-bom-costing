import { ENGINE_VERSION } from "../src/index";

test("smoke", () => {
  expect(ENGINE_VERSION).toBe("0.0.1");
});
