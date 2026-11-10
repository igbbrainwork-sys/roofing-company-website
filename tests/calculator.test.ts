import { describe, it, expect } from 'vitest';

describe('Roof Cost Calculator Math', () => {
  it('calculates roof area and squares accurately based on footprint and pitch multiplier', () => {
    const homeSqFt = 2400;
    const pitchMultiplier = 1.25; // 6/12 slope
    const wasteFactor = 1.12;

    const roofAreaSqFt = Math.round(homeSqFt * pitchMultiplier * wasteFactor);
    expect(roofAreaSqFt).toBe(3360);

    const roofSquares = Math.round(roofAreaSqFt / 100);
    expect(roofSquares).toBe(34);
  });

  it('calculates material and tear-off costs properly', () => {
    const roofSquares = 34;
    const layers = 1;
    const tearOffRate = 55;
    const costPerSquare = 510; // Class-4 impact shingles

    const tearOffCost = roofSquares * (layers * tearOffRate);
    expect(tearOffCost).toBe(1870);

    const materialCost = roofSquares * costPerSquare;
    expect(materialCost).toBe(17340);

    const total = materialCost + tearOffCost;
    expect(total).toBe(19210);

    const lowEstimate = Math.round(total * 0.94);
    const highEstimate = Math.round(total * 1.08);

    expect(lowEstimate).toBeLessThan(total);
    expect(highEstimate).toBeGreaterThan(total);
  });
});
