import type { MaterialCategory } from '../types';

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  profiles: 'Profilés',
  renforts: 'Renforts',
  joints: 'Joints',
  vitrage: 'Vitrage',
  panneaux: 'Panneaux',
  quincaillerie: 'Quincaillerie',
  accessoires: 'Accessoires',
  consommables: 'Consommables',
};

export const CATEGORY_ORDER: MaterialCategory[] = ['profiles', 'renforts', 'joints', 'vitrage', 'panneaux', 'quincaillerie', 'accessoires', 'consommables'];

export const EMPTY_CUTTING_LIST_MESSAGE = 'La liste de débit sera calculée après intégration des règles métier Forster.';
