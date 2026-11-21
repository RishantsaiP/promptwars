import { describe, it, expect } from 'vitest';
import { generateTrackingCode } from '../src/lib/domain/tracking-code';
import { getDefaultDepartment, CATEGORY_DEPARTMENT_MAP } from '../src/lib/domain/departments';
import { CATEGORIES, DEPARTMENTS } from '../src/lib/domain/types';

describe('Domain Rules & Invariants', () => {
  it('generates consistent and formatted tracking codes', () => {
    const year = new Date().getFullYear();
    expect(generateTrackingCode(0)).toBe(`CR-${year}-0001`);
    expect(generateTrackingCode(25)).toBe(`CR-${year}-0026`);
    expect(generateTrackingCode(999)).toBe(`CR-${year}-1000`);
  });

  it('every category maps to a valid municipal department', () => {
    for (const category of CATEGORIES) {
      const dept = getDefaultDepartment(category);
      expect(DEPARTMENTS).toContain(dept);
      expect(CATEGORY_DEPARTMENT_MAP[category]).toBe(dept);
    }
  });

  it('routes pothole and road damage to Roads & Infrastructure', () => {
    expect(getDefaultDepartment('Pothole/Road Damage')).toBe('Roads & Infrastructure');
    expect(getDefaultDepartment('Damaged Footpath')).toBe('Roads & Infrastructure');
  });

  it('routes garbage issues to Sanitation & Solid Waste', () => {
    expect(getDefaultDepartment('Garbage/Overflowing Bin')).toBe('Sanitation & Solid Waste');
  });

  it('routes water and drainage leaks to Water Supply & Drainage', () => {
    expect(getDefaultDepartment('Water Leakage')).toBe('Water Supply & Drainage');
    expect(getDefaultDepartment('Drainage/Sewage Overflow')).toBe('Water Supply & Drainage');
  });
});
