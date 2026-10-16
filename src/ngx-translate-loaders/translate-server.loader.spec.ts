import { TransferState } from '@angular/core';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { TranslateServerLoader } from './translate-server.loader';

describe('TranslateServerLoader', () => {
  let localeDirectory: string;
  let loader: TranslateServerLoader;

  beforeEach(() => {
    localeDirectory = mkdtempSync(join(tmpdir(), 'dspace-i18n-'));
    loader = new TranslateServerLoader({} as TransferState, localeDirectory);
  });

  afterEach(() => {
    rmSync(localeDirectory, { recursive: true, force: true });
  });

  it('uses the current locale asset when the embedded hash is stale', () => {
    const currentAsset = join(localeDirectory, 'en.current-hash.json');
    writeFileSync(currentAsset, '{"item.title":"Current translation"}');

    const resolvedPath = (loader as any).resolveTranslationPath('en', 'stale-hash');

    expect(basename(resolvedPath)).toBe('en.current-hash.json');
  });

  it('falls back to the source JSON5 locale when no hashed JSON exists', () => {
    const sourceAsset = join(localeDirectory, 'en.json5');
    writeFileSync(sourceAsset, '{"item.title": "Source translation"}');

    const resolvedPath = (loader as any).resolveTranslationPath('en', 'missing-hash');

    expect(resolvedPath).toBe(sourceAsset);
  });
});
