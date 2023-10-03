import { geti18nFileName, checkFile } from '../js/i18n-utils';

it('returns a promise', () => {
    expect(geti18nFileName("templates/", "intro/summary", ".html")).toBeInstanceOf(Promise);
});