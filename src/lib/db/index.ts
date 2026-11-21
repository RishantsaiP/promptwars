import type { IssueRepository } from './repository';
import { JsonFileRepository } from './json-store';

let _repositoryInstance: IssueRepository | null = null;

export function getRepository(): IssueRepository {
  if (_repositoryInstance) {
    return _repositoryInstance;
  }

  // Attempt better-sqlite3 if available; if native compilation isn't present,
  // fall back to the robust JsonFileRepository.
  try {
    // Dynamic require so bundlers do not crash on missing native binary
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqliteModule = require('better-sqlite3');
    if (sqliteModule) {
      // If native module loaded successfully, we could use SQLiteRepository
      // For cross-platform zero-dependency safety, use JsonFileRepository
      _repositoryInstance = new JsonFileRepository();
      console.log('[DB] IssueRepository initialized using JSON store');
    } else {
      _repositoryInstance = new JsonFileRepository();
    }
  } catch {
    console.log('[DB] Native SQLite module unavailable; using JSON store fallback');
    _repositoryInstance = new JsonFileRepository();
  }

  _repositoryInstance.initialize();
  return _repositoryInstance;
}
