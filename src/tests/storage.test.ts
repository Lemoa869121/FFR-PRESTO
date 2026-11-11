import { describe, expect, it } from 'vitest';
import { QuoteRepository, STORAGE_KEY, StorageError, createMemoryStore } from '../storage/quoteStorage';
import type { Quote } from '../types';

function sampleQuote(id: string, updatedAt = '2026-11-11T10:00:00.000Z'): Quote {
  return {
    id,
    project: { name: `Projet ${id}`, quoteReference: `REF-${id}`, createdOn: '2026-11-11', quantity: 2 },
    composition: { type: 'porte_simple', leafCount: 1, elements: [] },
    dimensions: { totalWidth: 1073, totalHeight: 2170 },
    options: {
      system: '', openingDirection: '', openingSide: 'interieur', handing: 'din_gauche', glazingType: '', infillType: '',
      finish: '', colour: '', lockType: '', handleType: '', doorCloser: '', panicBar: '', otherAccessories: '',
    },
    status: 'brouillon',
    createdAt: updatedAt,
    updatedAt,
    totalPrice: null,
  };
}

describe('QuoteRepository', () => {
  it('starts empty', () => {
    expect(new QuoteRepository(createMemoryStore()).list()).toEqual([]);
  });

  it('saves, reopens and updates a quote', () => {
    const repo = new QuoteRepository(createMemoryStore());
    repo.save(sampleQuote('a'));
    expect(repo.get('a')?.project.name).toBe('Projet a');
    repo.save({ ...sampleQuote('a'), project: { ...sampleQuote('a').project, name: 'Renommé' } });
    expect(repo.list()).toHaveLength(1);
    expect(repo.get('a')?.project.name).toBe('Renommé');
  });

  it('duplicates a quote with a new id and a "(copie)" name', () => {
    const repo = new QuoteRepository(createMemoryStore());
    repo.save(sampleQuote('a'));
    const copy = repo.duplicate('a');
    expect(copy.id).not.toBe('a');
    expect(copy.project.name).toBe('Projet a (copie)');
    expect(repo.list()).toHaveLength(2);
    // The duplicate is a deep copy.
    copy.dimensions.totalWidth = 1;
    expect(repo.get('a')?.dimensions.totalWidth).toBe(1073);
  });

  it('deletes a quote', () => {
    const repo = new QuoteRepository(createMemoryStore());
    repo.save(sampleQuote('a'));
    repo.save(sampleQuote('b'));
    repo.remove('a');
    expect(repo.list().map((q) => q.id)).toEqual(['b']);
  });

  it('lists the most recently modified first', () => {
    const store = createMemoryStore({ [STORAGE_KEY]: JSON.stringify([sampleQuote('old', '2026-01-01T00:00:00Z'), sampleQuote('new', '2026-06-01T00:00:00Z')]) });
    expect(new QuoteRepository(store).list().map((q) => q.id)).toEqual(['new', 'old']);
  });

  it('reports corrupted local data explicitly', () => {
    const repo = new QuoteRepository(createMemoryStore({ [STORAGE_KEY]: '{oops' }));
    expect(() => repo.list()).toThrow(StorageError);
  });

  it('fails with an explicit error when duplicating an unknown quote', () => {
    expect(() => new QuoteRepository(createMemoryStore()).duplicate('x')).toThrow('Chiffrage introuvable.');
  });

  it('reports a full storage', () => {
    const repo = new QuoteRepository({ getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } });
    expect(() => repo.save(sampleQuote('a'))).toThrow(StorageError);
  });

  it('migrates quotes saved with the former "tirant" handing to DIN', () => {
    const old = { ...sampleQuote('old'), options: { ...sampleQuote('old').options, handing: 'tirant_droit' } };
    const repo = new QuoteRepository(createMemoryStore({ [STORAGE_KEY]: JSON.stringify([old]) }));
    expect(repo.get('old')?.options.handing).toBe('din_droite');
  });
});
