import type { IssueRepository } from './repository';
import { JsonFileRepository } from './json-store';
import { SqliteRepository } from './sqlite-store';

let _repositoryInstance: IssueRepository | null = null;
let _activeStoreType: 'sqlite' | 'json' = 'json';

export function getActiveStoreType(): 'sqlite' | 'json' {
  return _activeStoreType;
}

export function getRepository(): IssueRepository {
  if (_repositoryInstance) {
    return _repositoryInstance;
  }

  try {
    _repositoryInstance = new SqliteRepository();
    _activeStoreType = 'sqlite';
    console.log('[DB] IssueRepository initialized using SQLite store');
  } catch (err) {
    console.warn('[DB] SQLite store initialization failed; falling back to JSON store:', err);
    _repositoryInstance = new JsonFileRepository();
    _activeStoreType = 'json';
    console.log('[DB] IssueRepository initialized using JSON store');
  }

  _repositoryInstance.initialize();
  return _repositoryInstance;
}
