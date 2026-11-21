import type { Category, Department } from './types';

/**
 * Maps each civic issue category to its responsible department.
 */
export const CATEGORY_DEPARTMENT_MAP: Record<Category, Department> = {
  'Pothole/Road Damage': 'Roads & Infrastructure',
  'Garbage/Overflowing Bin': 'Sanitation & Solid Waste',
  'Streetlight Fault': 'Street Lighting & Electricity',
  'Water Leakage': 'Water Supply & Drainage',
  'Drainage/Sewage Overflow': 'Water Supply & Drainage',
  'Damaged Footpath': 'Roads & Infrastructure',
  'Traffic Signal/Signage': 'Traffic & Transport',
  'Fallen Tree/Public Space': 'Parks & Public Spaces',
  'Stray Animals/Public Health': 'Public Health',
  'Other': 'General Administration',
};

/**
 * Returns the default department responsible for the given issue category.
 */
export function getDefaultDepartment(category: Category): Department {
  return CATEGORY_DEPARTMENT_MAP[category] ?? 'General Administration';
}
