import { describe, it, expect, beforeEach } from 'vitest';
import { JsonFileRepository } from '../src/lib/db/json-store';
import fs from 'fs';
import path from 'path';

describe('Duplicate Detection & Priority Escalation', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'issues.json');
  let repo: JsonFileRepository;

  beforeEach(() => {
    // Reset test repository
    repo = new JsonFileRepository();
    repo.reset();
  });

  it('detects an existing issue within 100 meters and same category', () => {
    // Gandhipuram coordinates: 11.0175, 76.9572 (CR-2026-0001)
    const nearby = repo.findNearby(
      11.0174, // ~15 meters away
      76.9573,
      100,
      'Pothole/Road Damage',
      14
    );

    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby[0].final_category).toBe('Pothole/Road Damage');
  });

  it('does NOT match issues of a different category', () => {
    const nearby = repo.findNearby(
      11.0174,
      76.9573,
      100,
      'Streetlight Fault', // different category
      14
    );

    expect(nearby.length).toBe(0);
  });

  it('does NOT match issues beyond the 100 meter radius', () => {
    // Coordinates 1 km away
    const farAway = repo.findNearby(
      11.0280,
      76.9800,
      100,
      'Pothole/Road Damage',
      14
    );

    const hasGandhipuramIssue = farAway.some((i) => i.id === 'issue-seed-001');
    expect(hasGandhipuramIssue).toBe(false);
  });

  it('escalates priority to High/Critical when report count increases to 3+', () => {
    const newIssue = repo.create({
      title: 'Medium priority test pothole',
      description: 'Minor road pothole needing attention',
      latitude: 11.0500,
      longitude: 76.9500,
      address: 'Test Location, Coimbatore',
      category: 'Pothole/Road Damage',
      image_url: null,
      ai_analysis: null,
      final_category: 'Pothole/Road Damage',
      final_department: 'Roads & Infrastructure',
      final_priority: 'Medium',
      device_id: 'test-device',
      contact: null,
    });

    expect(newIssue.report_count).toBe(1);
    expect(newIssue.final_priority).toBe('Medium');

    // Second citizen reports
    repo.incrementReportCount(newIssue.id);
    const updatedOnce = repo.getById(newIssue.id);
    expect(updatedOnce?.report_count).toBe(2);
    expect(updatedOnce?.final_priority).toBe('Medium');

    // Third citizen reports -> triggers escalation from Medium to High
    repo.incrementReportCount(newIssue.id);
    const updatedTwice = repo.getById(newIssue.id);
    expect(updatedTwice?.report_count).toBe(3);
    expect(updatedTwice?.final_priority).toBe('High');
  });
});
