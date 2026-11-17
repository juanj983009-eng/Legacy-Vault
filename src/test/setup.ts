import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { catalogResponse } from './catalogFixture';

beforeEach(() => vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => catalogResponse(input))));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
