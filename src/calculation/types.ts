import type { CompositionType, Dimensions, LeafCount, Project, TechnicalOptions } from '../types';

/** Everything the engine needs; matches the validated form values. */
export interface CalculationInput {
  project: Project;
  composition: { type: CompositionType; leafCount: LeafCount };
  dimensions: Dimensions;
  options: TechnicalOptions;
}
