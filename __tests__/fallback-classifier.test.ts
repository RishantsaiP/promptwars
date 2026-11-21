import { describe, it, expect } from 'vitest';
import { runFallbackClassifier } from '../src/lib/gemini/fallback';

describe('Fallback Classifier', () => {
  it('correctly classifies a pothole in English', () => {
    const result = runFallbackClassifier('Huge pothole on road causing vehicle skidding');
    expect(result.category).toBe('Pothole/Road Damage');
    expect(result.department).toBe('Roads & Infrastructure');
    expect(result.method).toBe('rule-based-fallback');
  });

  it('correctly classifies road damage in Tamil', () => {
    const result = runFallbackClassifier('சாலையில் பெரிய குழி உள்ளது விபத்து அபாயம்');
    expect(result.category).toBe('Pothole/Road Damage');
    expect(result.priority).toBe('Critical'); // 'விபத்து' triggers critical
  });

  it('correctly classifies garbage in Hindi', () => {
    const result = runFallbackClassifier('सड़क पर बहुत सारा कचरा और कूड़ा फैला हुआ है');
    expect(result.category).toBe('Garbage/Overflowing Bin');
    expect(result.department).toBe('Sanitation & Solid Waste');
  });

  it('correctly identifies critical priority for open manhole emergency', () => {
    const result = runFallbackClassifier('Open manhole on main road, extreme danger to life');
    expect(result.priority).toBe('Critical');
    expect(result.urgency_score).toBeGreaterThanOrEqual(85);
  });

  it('correctly classifies water pipeline burst', () => {
    const result = runFallbackClassifier('Main drinking water pipe burst flooding the street');
    expect(result.category).toBe('Water Leakage');
    expect(result.department).toBe('Water Supply & Drainage');
    expect(result.priority).toBe('Critical'); // 'burst' triggers critical
  });

  it('correctly classifies street light issue', () => {
    const result = runFallbackClassifier('Streetlight not working, street is dark at night');
    expect(result.category).toBe('Streetlight Fault');
    expect(result.department).toBe('Street Lighting & Electricity');
  });

  it('correctly classifies sewage overflow', () => {
    const result = runFallbackClassifier('Sewage overflowing onto market street with foul smell');
    expect(result.category).toBe('Drainage/Sewage Overflow');
    expect(result.department).toBe('Water Supply & Drainage');
  });

  it('correctly classifies stray animals issue', () => {
    const result = runFallbackClassifier('Aggressive stray dog pack biting pedestrians near school');
    expect(result.category).toBe('Stray Animals/Public Health');
    expect(result.department).toBe('Public Health');
    expect(result.priority).toBe('High');
  });

  it('falls back to Other for generic complaints', () => {
    const result = runFallbackClassifier('Some general civic complaint without clear keywords');
    expect(result.category).toBe('Other');
    expect(result.department).toBe('General Administration');
  });
});
