import { describe, it, expect } from 'vitest';
import { isDST } from '../dst';

describe('isDST', () => {
  it('US — July is DST', () => {
    expect(isDST('us', new Date(Date.UTC(2025, 6, 15)))).toBe(true);
  });
  it('US — January is not DST', () => {
    expect(isDST('us', new Date(Date.UTC(2025, 0, 15)))).toBe(false);
  });
  it('EU — July is DST', () => {
    expect(isDST('eu', new Date(Date.UTC(2025, 6, 15)))).toBe(true);
  });
  it('none — always false', () => {
    expect(isDST('none', new Date(Date.UTC(2025, 6, 15)))).toBe(false);
  });
  it('south (Chile) — July is NOT DST (southern hemisphere)', () => {
    expect(isDST('south', new Date(Date.UTC(2025, 6, 15)))).toBe(false);
  });
});
