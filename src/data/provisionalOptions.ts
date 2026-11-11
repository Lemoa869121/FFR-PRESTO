import type { TechnicalOptions } from '../types';
import { PRESTO_SYSTEM } from '../calculation/presto/fromInput';

/**
 * Option lists. Only the system comes from a source document; the other lists are
 * PROVISIONAL ("Donnée de démonstration"): none of these values is a Forster
 * reference, and they are not used by the calculation. Each list carries its
 * status so that the UI can display it.
 */
export interface OptionList {
  field: keyof TechnicalOptions;
  label: string;
  status: 'provisoire' | 'source';
  sourceNote: string;
  choices: { value: string; label: string }[];
}

const NOT_DEFINED = { value: '', label: '— À définir —' };
const demo = (labels: string[]) => [NOT_DEFINED, ...labels.map((l) => ({ value: l, label: `${l} (démonstration)` }))];

export const OPTION_LISTS: OptionList[] = [
  {
    field: 'system',
    label: 'Système Forster',
    status: 'source',
    sourceNote: 'Dossier de fabrication FFR Presto, « Série »',
    choices: [{ value: PRESTO_SYSTEM, label: 'Forster Presto — presto XS 50 Standard Aluminium' }],
  },
  { field: 'openingDirection', label: 'Sens d’ouverture', status: 'provisoire', sourceNote: 'Valeur provisoire', choices: demo(['Poussant', 'Tirant']) },
  { field: 'glazingType', label: 'Type de vitrage', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Vitrage 1', 'Vitrage 2']) },
  { field: 'infillType', label: 'Type de remplissage', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Vitré', 'Panneau plein']) },
  { field: 'finish', label: 'Finition', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Brut', 'Thermolaqué']) },
  { field: 'colour', label: 'Couleur', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Couleur 1', 'Couleur 2']) },
  { field: 'lockType', label: 'Type de serrure', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Serrure 1', 'Serrure 2']) },
  { field: 'handleType', label: 'Type de poignée', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: demo(['Béquille', 'Bâton de maréchal']) },
  { field: 'doorCloser', label: 'Ferme-porte', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: [{ value: '', label: 'Sans' }, ...demo(['Ferme-porte 1'])] },
  { field: 'panicBar', label: 'Barre anti-panique', status: 'provisoire', sourceNote: 'Donnée de démonstration', choices: [{ value: '', label: 'Sans' }, ...demo(['Barre 1'])] },
];

export const DEFAULT_OPTIONS: TechnicalOptions = {
  system: PRESTO_SYSTEM,
  openingDirection: '',
  openingSide: 'interieur',
  handing: 'tirant_gauche',
  glazingType: '',
  infillType: '',
  finish: '',
  colour: '',
  lockType: '',
  handleType: '',
  doorCloser: '',
  panicBar: '',
  otherAccessories: '',
};
