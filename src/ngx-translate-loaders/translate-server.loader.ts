import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';

import { TransferState } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import JSON5 from 'json5';
import {
  Observable,
  of,
} from 'rxjs';

import {
  NGX_TRANSLATE_STATE,
  NgxTranslateState,
} from './ngx-translate-state';

/**
 * A TranslateLoader for ngx-translate to parse json5 files server-side, and store them in the
 * TransferState
 */
export class TranslateServerLoader implements TranslateLoader {

  constructor(
    protected transferState: TransferState,
    protected prefix: string = 'dist/assets/i18n/',
    protected suffix: string = '.json',
  ) {
  }

  /**
   * Return the i18n messages for a given language, and store them in the TransferState
   *
   * @param lang the language code
   */
  public getTranslation(lang: string): Observable<any> {
    const translationHash: string | undefined = (process.env.languageHashes as any)?.[lang + '.json5'];
    const translationPath = this.resolveTranslationPath(lang, translationHash);
    const translationFile = readFileSync(translationPath, 'utf8');
    const messages = translationPath.endsWith('.json5') ? JSON5.parse(translationFile) : JSON.parse(translationFile);
    // Store the parsed messages in the transfer state so they'll be available immediately when the
    // app loads on the client
    this.storeInTransferState(lang, messages);
    // Return the parsed messages to translate things server side
    return of(messages);
  }

  private resolveTranslationPath(lang: string, translationHash?: string): string {
    const expectedPath = translationHash
      ? join(this.prefix, `${lang}.${translationHash}${this.suffix}`)
      : undefined;

    if (expectedPath && existsSync(expectedPath)) {
      return expectedPath;
    }

    const localePrefix = `${lang}.`;
    const currentLocaleFile = readdirSync(this.prefix)
      .filter((file) => file.startsWith(localePrefix) && file.endsWith(this.suffix))
      .map((file) => join(this.prefix, file))
      .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)[0];

    if (currentLocaleFile) {
      return currentLocaleFile;
    }

    const sourceFile = join(this.prefix, `${lang}.json5`);
    if (existsSync(sourceFile)) {
      return sourceFile;
    }

    throw new Error(`No translation asset found for language '${lang}' in '${this.prefix}'`);
  }

  /**
   * Store the i18n messages for the given language code in the transfer state, so they can be
   * retrieved client side
   *
   * @param lang the language code
   * @param messages the i18n messages
   * @protected
   */
  protected storeInTransferState(lang: string, messages) {
    const prevState = this.transferState.get<NgxTranslateState>(NGX_TRANSLATE_STATE, {});
    const nextState = Object.assign({}, prevState, {
      [lang]: messages,
    });
    this.transferState.set(NGX_TRANSLATE_STATE, nextState);
  }
}
