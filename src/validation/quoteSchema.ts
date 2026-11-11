import { z } from 'zod';
import { getComposition, visibleDimensionFields } from '../domain/compositions';
import type { CompositionType } from '../types';

const positiveMm = z
  .number({ error: 'Valeur numérique attendue (mm).' })
  .positive('La valeur doit être supérieure à 0 mm.')
  .max(100000, 'Valeur hors plage (mm).');

const optionalMm = positiveMm.optional();

export const COMPOSITION_TYPES = [
  'porte_simple', 'porte_double', 'chassis_fixe', 'porte_imposte', 'porte_lateral_gauche',
  'porte_lateral_droite', 'porte_deux_laterales', 'porte_imposte_lateral_gauche',
  'porte_imposte_lateral_droite', 'porte_imposte_laterales', 'personnalisee',
] as const satisfies readonly CompositionType[];

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du projet est obligatoire.'),
  quoteReference: z.string().trim().min(1, 'La référence du chiffrage est obligatoire.'),
  clientName: z.string().trim().optional(),
  description: z.string().trim().optional(),
  createdOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide.'),
  quantity: z.number({ error: 'Quantité attendue.' }).int('Nombre entier attendu.').min(1, 'Au moins 1.'),
});

export const compositionSchema = z.object({
  type: z.enum(COMPOSITION_TYPES),
  leafCount: z.union([z.literal(1), z.literal(2)]),
});

export const dimensionsSchema = z.object({
  totalWidth: positiveMm,
  totalHeight: positiveMm,
  mainLeafWidth: optionalMm,
  secondaryLeafWidth: optionalMm,
  transomHeight: optionalMm,
  leftSideWidth: optionalMm,
  rightSideWidth: optionalMm,
});

export const optionsSchema = z.object({
  system: z.string(),
  openingDirection: z.string(),
  openingSide: z.enum(['interieur', 'exterieur']),
  handing: z.enum(['tirant_gauche', 'tirant_droit']),
  glazingType: z.string(),
  infillType: z.string(),
  finish: z.string(),
  colour: z.string(),
  lockType: z.string(),
  handleType: z.string(),
  doorCloser: z.string(),
  panicBar: z.string(),
  otherAccessories: z.string(),
});

export const quoteFormSchema = z
  .object({
    project: projectSchema,
    composition: compositionSchema,
    dimensions: dimensionsSchema,
    options: optionsSchema,
  })
  .superRefine((value, ctx) => {
    const def = getComposition(value.composition.type);
    if (!def.leafCounts.includes(value.composition.leafCount)) {
      ctx.addIssue({ code: 'custom', path: ['composition', 'leafCount'], message: 'Nombre de vantaux incompatible avec la composition.' });
    }
    const required = visibleDimensionFields(value.composition.type, value.composition.leafCount)
      .filter((f) => f === 'transomHeight' || f === 'leftSideWidth' || f === 'rightSideWidth');
    for (const field of required) {
      if (value.dimensions[field] === undefined) {
        ctx.addIssue({ code: 'custom', path: ['dimensions', field], message: 'Dimension obligatoire pour cette composition.' });
      }
    }
    const d = value.dimensions;
    const parts = (def.hasLeftSide ? d.leftSideWidth ?? 0 : 0) + (def.hasRightSide ? d.rightSideWidth ?? 0 : 0);
    if (parts >= d.totalWidth) {
      ctx.addIssue({ code: 'custom', path: ['dimensions', 'totalWidth'], message: 'La largeur totale doit dépasser la somme des parties latérales.' });
    }
    if (def.hasTransom && (d.transomHeight ?? 0) >= d.totalHeight) {
      ctx.addIssue({ code: 'custom', path: ['dimensions', 'transomHeight'], message: 'L’imposte doit être moins haute que la hauteur totale.' });
    }
  });

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
