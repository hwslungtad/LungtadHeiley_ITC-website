import assert from "node:assert/strict";
import test from "node:test";

import { calculateNumberLab, calculatePayroll, calculateTax, convert } from "../src/programs.js";

test("Box 3 calculates gross and net payroll", () => {
  assert.deepEqual(calculatePayroll(20, 750, 500), {
    gross: 15000,
    net: 14500,
  });
});

test("Box 4 calculates factorial, sum, and average with the original loops", () => {
  assert.deepEqual(calculateNumberLab(5), {
    factorial: "120",
    sum: 15,
    average: 3,
  });
  assert.equal(calculateNumberLab(500).factorial.length, 1135);
});

test("Box 5 applies every income tax bracket", () => {
  assert.equal(calculateTax(250000).tax, 0);
  assert.equal(calculateTax(400000).tax, 30000);
  assert.equal(calculateTax(800000).tax, 130000);
  assert.equal(calculateTax(2000000).tax, 490000);
  assert.equal(calculateTax(8000000).tax, 2410000);
  assert.equal(calculateTax(9000000).tax, 2760000);
});

test("Box 6 converts temperatures and distances", () => {
  assert.equal(convert(32, "fToC"), 0);
  assert.equal(convert(0, "cToF"), 32);
  assert.equal(convert(1, "mToFt"), 3.28084);
  assert.equal(convert(3.28084, "ftToM"), 1);
});
