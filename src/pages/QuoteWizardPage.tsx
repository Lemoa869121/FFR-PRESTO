import { useEffect, useMemo, useState, type InputHTMLAttributes, type Ref } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CompositionType, LeafCount, Quote } from '../types';
import { quoteFormSchema, type QuoteFormValues } from '../validation/quoteSchema';
import { COMPOSITIONS, DIMENSION_LABELS, dimensionFieldSpecs, getComposition, type DimensionField } from '../domain/compositions';
import { offersSizingChoice, usesClearPassage } from '../domain/doorSizing';
import { PASSAGE_UNITS } from '../calculation/presto/clearPassage';
import { REFERENCE_PRESETS, referenceDefault } from '../domain/referencePresets';
import { formFromQuote, quoteFromForm } from '../domain/quoteFactory';
import { QuoteRepository, StorageError } from '../storage/quoteStorage';
import { DEFAULT_OPTIONS, OPTION_LISTS } from '../data/provisionalOptions';
import { calculateQuote } from '../calculation/engine';
import { todayIso } from '../utils/format';
import { navigate } from '../app/router';
import { MmInput } from '../components/MmInput';
import { CompositionPreview } from '../components/CompositionPreview';
import { DemoTag, Notice } from '../components/StatusNotice';
import { QuoteSummary } from '../features/quote/QuoteSummary';

const STEPS = ['Informations générales', 'Composition', 'Dimensions', 'Options techniques', 'Récapitulatif'] as const;

const STEP_FIELDS: FieldPath<QuoteFormValues>[][] = [
  ['project'],
  ['composition'],
  ['dimensions'],
  ['options'],
  [],
];

function defaultValues(): QuoteFormValues {
  return {
    project: { name: '', quoteReference: '', clientName: '', description: '', createdOn: todayIso(), quantity: 1 },
    composition: { type: 'porte_simple', leafCount: 1 },
    dimensions: { totalWidth: 1073, totalHeight: 2170, floorGap: 10 },
    options: { ...DEFAULT_OPTIONS },
  };
}

export function QuoteWizardPage({ repository, quoteId }: { repository: QuoteRepository; quoteId?: string }) {
  const existing = useMemo<Quote | undefined>(() => {
    try {
      return quoteId ? repository.get(quoteId) : undefined;
    } catch {
      return undefined;
    }
  }, [repository, quoteId]);

  const [step, setStep] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: existing ? formFromQuote(existing) : defaultValues(),
    mode: 'onTouched',
  });
  const { register, control, handleSubmit, trigger, setValue, formState: { errors } } = form;
  const values = useWatch({ control }) as QuoteFormValues;
  const compositionDef = getComposition(values.composition.type);
  const dimensionSpecs = dimensionFieldSpecs(values.composition.type, values.composition.leafCount, values.dimensions);
  const sizingChoice = offersSizingChoice(values.composition.type, values.composition.leafCount);
  const geometry = useMemo(() => {
    try {
      return calculateQuote(values).geometry;
    } catch {
      return undefined;
    }
  }, [values]);

  // Write the values computed from the clear passage back into the form (preview, summary, dashboard).
  useEffect(() => {
    if (!geometry) return;
    const derived: Partial<Record<'totalWidth' | 'leftSideWidth' | 'rightSideWidth' | 'clearPassage', number>> = {};
    for (const spec of dimensionSpecs) {
      if (spec.editable) continue;
      if (spec.field === 'totalWidth') derived.totalWidth = geometry.totalWidthMm;
      if (spec.field === 'leftSideWidth') derived.leftSideWidth = geometry.leftSideWidthMm;
      if (spec.field === 'rightSideWidth') derived.rightSideWidth = geometry.rightSideWidthMm;
      if (spec.field === 'clearPassage') derived.clearPassage = geometry.clearPassageMm;
    }
    for (const [field, value] of Object.entries(derived) as [keyof typeof derived, number][]) {
      if (form.getValues(`dimensions.${field}`) !== value) setValue(`dimensions.${field}`, value);
    }
  }, [geometry, dimensionSpecs, form, setValue]);

  if (quoteId && !existing) {
    return <Notice tone="bloquant" title="Chiffrage introuvable">Ce chiffrage n’existe pas ou a été supprimé.</Notice>;
  }

  const goTo = async (target: number) => {
    if (target > step) {
      for (let s = step; s < target; s += 1) {
        const ok = await trigger(STEP_FIELDS[s]);
        if (!ok) {
          setStep(s);
          return;
        }
      }
    }
    setStep(target);
  };

  /** Pre-fills the transom / side fields that appear with the values of the source file. */
  const applyComposition = (type: CompositionType, leafCount: LeafCount) => {
    setValue('composition.type', type, { shouldValidate: true });
    setValue('composition.leafCount', leafCount, { shouldValidate: true });
    const def = getComposition(type);
    const dims = form.getValues('dimensions');
    const fill = (field: 'transomHeight' | 'leftSideWidth' | 'rightSideWidth', needed: boolean) => {
      if (needed && dims[field] === undefined) setValue(`dimensions.${field}`, referenceDefault(field, leafCount));
    };
    fill('transomHeight', def.hasTransom);
    fill('leftSideWidth', def.hasLeftSide);
    fill('rightSideWidth', def.hasRightSide);
    if (def.hasDoor && dims.floorGap === undefined) setValue('dimensions.floorGap', 10);
    if (def.hasDoor && leafCount === 2 && dims.activeClearPassage === undefined) setValue('dimensions.activeClearPassage', 900);
    if (def.hasDoor && leafCount === 2 && dims.sizingMode === undefined) setValue('dimensions.sizingMode', 'largeur_totale');
    // Clear passage proposed by default: 1 UP (900) for one leaf, 3 UP (1 800) for two leaves.
    const byPassage = usesClearPassage(type, leafCount, form.getValues('dimensions'));
    const current = form.getValues('dimensions.clearPassage');
    if (byPassage && (current === undefined || (leafCount === 2 && current < 1300) || (leafCount === 1 && current > 1300))) {
      setValue('dimensions.clearPassage', leafCount === 2 ? 1800 : 900);
    }
  };

  const applyPassageUnit = (id: string) => {
    const unit = PASSAGE_UNITS.find((u) => u.id === id);
    if (!unit) return;
    if (sizingChoice) setValue('dimensions.sizingMode', 'passage_libre');
    setValue('dimensions.clearPassage', unit.clearPassage, { shouldValidate: true });
    if (values.composition.leafCount === 2) setValue('dimensions.activeClearPassage', unit.activeClearPassage, { shouldValidate: true });
  };

  const applyPreset = (id: string) => {
    const preset = REFERENCE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setValue('composition.type', preset.compositionType, { shouldValidate: true });
    setValue('composition.leafCount', preset.leafCount, { shouldValidate: true });
    setValue('dimensions', { ...preset.dimensions, floorGap: 10 }, { shouldValidate: true });
    setValue('options.openingSide', preset.openingSide);
    setValue('options.handing', preset.handing);
  };

  const derivedValue = (field: DimensionField): number | undefined => {
    if (!geometry) return undefined;
    switch (field) {
      case 'mainLeafWidth': return geometry.leafWidthMm;
      case 'secondaryLeafWidth': return geometry.secondaryLeafWidthMm;
      case 'totalWidth': return geometry.totalWidthMm;
      case 'clearPassage': return geometry.clearPassageMm;
      case 'leftSideWidth': return geometry.leftSideWidthMm;
      case 'rightSideWidth': return geometry.rightSideWidthMm;
      default: return values.dimensions[field];
    }
  };

  const derivedHint = (field: DimensionField): string => {
    if (field === 'mainLeafWidth') return values.composition.leafCount === 1 ? 'Calculée : règle P-VAN-01 (guide presto VP 3.5.33)' : 'Calculée depuis le passage libre du vantail principal (P-PL-02)';
    if (field === 'secondaryLeafWidth') return 'Calculée : passage dormant − 50 − vantail principal (P-VAN-05)';
    if (field === 'clearPassage') return 'Calculé depuis la largeur (règle P-PL-01)';
    return 'Calculée depuis la largeur totale et le passage libre (P-PL-01)';
  };

  const inputHint = (field: DimensionField): string | undefined => {
    if (field === 'transomHeight') return 'Valeur du dossier FFR Presto : 330 mm';
    if (field === 'floorGap') return 'Variable selon le guide presto (VP 3.5.32) ; dossier FFR Presto : 10 mm';
    if (field === 'clearPassage') return 'UP normalisés : 1 UP 900, 2 UP 1 400 (900 + 500), 3 UP 1 800 mm';
    if (field === 'activeClearPassage') return 'Vantail ouvert à 90° ; 900 mm = 1 UP';
    return undefined;
  };

  const onSave = handleSubmit((data) => {
    try {
      const result = calculateQuote(data);
      const status = result.status === 'non_calcule' ? 'a_completer' : 'calcule';
      const saved = repository.save(quoteFromForm(data, existing, status, result.totals.materialForQuantity));
      navigate({ name: 'edit', id: saved.id });
      setSaveError(null);
    } catch (e) {
      setSaveError(e instanceof StorageError ? e.message : 'Enregistrement impossible.');
    }
  }, () => setSaveError('Le formulaire contient des erreurs : corrigez les champs signalés.'));

  return (
    <section aria-labelledby="wizard-title">
      <div className="page-head">
        <div>
          <h1 id="wizard-title">{existing ? `Chiffrage — ${existing.project.name}` : 'Nouveau chiffrage'}</h1>
          {existing && <p className="muted mono">{existing.project.quoteReference}</p>}
        </div>
        {existing && (
          <a className="btn" href={`#/debit/${encodeURIComponent(existing.id)}`}>Voir la liste de débit</a>
        )}
      </div>

      <ol className="stepper" aria-label="Étapes du chiffrage">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button type="button" className="stepper__btn" aria-current={i === step ? 'step' : undefined} onClick={() => void goTo(i)}>
              <span className="stepper__num">{i + 1}</span> {label}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => void onSave(e)} noValidate className="panel">
        {step === 0 && (
          <fieldset>
            <legend>Étape 1 — Informations générales</legend>
            <div className="grid-2">
              <TextField label="Nom du projet" error={errors.project?.name?.message} {...register('project.name')} />
              <TextField label="Référence du chiffrage" error={errors.project?.quoteReference?.message} {...register('project.quoteReference')} />
              <TextField label="Nom du client (facultatif)" {...register('project.clientName')} />
              <TextField label="Date de création" type="date" error={errors.project?.createdOn?.message} {...register('project.createdOn')} />
              <Controller
                control={control}
                name="project.quantity"
                render={({ field, fieldState }) => (
                  <MmInput label="Quantité" unit="pce" integer value={field.value} onChange={(v) => field.onChange(v)} onBlur={field.onBlur} error={fieldState.error?.message} />
                )}
              />
            </div>
            <div className="field">
              <label htmlFor="project-description">Description (facultative)</label>
              <textarea id="project-description" rows={3} {...register('project.description')} />
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend>Étape 2 — Choix de la composition</legend>
            <div className="field">
              <label htmlFor="preset">Partir d’une position du dossier FFR Presto (facultatif)</label>
              <select id="preset" defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
                <option value="">— Choisir une position de référence —</option>
                {REFERENCE_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label} (p. {p.pdfPage})</option>)}
              </select>
              <p className="field__hint">Renseigne la composition, les dimensions, l’ouverture et le sens DIN de la position choisie.</p>
            </div>
            <div className="choice-grid" role="radiogroup" aria-label="Type de composition">
              {COMPOSITIONS.map((c) => (
                <label key={c.type} className={`choice${values.composition.type === c.type ? ' choice--active' : ''}`}>
                  <input
                    type="radio"
                    value={c.type}
                    checked={values.composition.type === c.type}
                    onChange={() => applyComposition(c.type, c.leafCounts.includes(values.composition.leafCount) ? values.composition.leafCount : (c.leafCounts[0] ?? 1))}
                  />
                  <span className="choice__title">{c.label}</span>
                  <span className="choice__desc">{c.description}</span>
                  {!c.rulesAvailable && <span className="tag tag--warn">Règle métier à fournir</span>}
                </label>
              ))}
            </div>
            {compositionDef.hasDoor && compositionDef.leafCounts.length > 1 && (
              <div className="field field--inline">
                <span className="field__label">Nombre de vantaux</span>
                {compositionDef.leafCounts.map((n) => (
                  <label key={n} className="radio">
                    <input type="radio" checked={values.composition.leafCount === n} onChange={() => applyComposition(values.composition.type, n)} />
                    {n === 1 ? '1 vantail' : '2 vantaux'}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend>Étape 3 — Dimensions (mm)</legend>
            <div className="split">
              <div className="grid-2">
                {sizingChoice && (
                  <div className="field" role="radiogroup" aria-label="Dimensionnement de la porte double">
                    <span className="field__label">Dimensionner la porte par</span>
                    <label className="radio">
                      <input type="radio" checked={values.dimensions.sizingMode !== 'passage_libre'} onChange={() => setValue('dimensions.sizingMode', 'largeur_totale', { shouldValidate: true })} /> Largeur totale
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        checked={values.dimensions.sizingMode === 'passage_libre'}
                        onChange={() => {
                          setValue('dimensions.sizingMode', 'passage_libre', { shouldValidate: true });
                          if (values.dimensions.clearPassage === undefined && geometry) setValue('dimensions.clearPassage', geometry.clearPassageMm);
                        }}
                      /> Passage libre
                    </label>
                  </div>
                )}
                {getComposition(values.composition.type).hasDoor && (
                  <div className="field">
                    <label htmlFor="passage-unit">Passage libre normalisé (UP)</label>
                    <select id="passage-unit" value="" onChange={(e) => applyPassageUnit(e.target.value)}>
                      <option value="">— Choisir une unité de passage —</option>
                      {PASSAGE_UNITS.filter((u) => u.leafCounts.includes(values.composition.leafCount)).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                    </select>
                  </div>
                )}
                {dimensionSpecs.map(({ field, editable }) => !editable ? (
                  <MmInput
                    key={field}
                    label={DIMENSION_LABELS[field]}
                    value={derivedValue(field)}
                    onChange={() => undefined}
                    readOnly
                    hint={derivedHint(field)}
                  />
                ) : (
                  <Controller
                    key={field}
                    control={control}
                    name={`dimensions.${field}`}
                    render={({ field: f, fieldState }) => (
                      <MmInput
                        label={DIMENSION_LABELS[field]}
                        value={f.value}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                        error={fieldState.error?.message}
                        hint={inputHint(field)}
                      />
                    )}
                  />
                ))}
                <Controller
                  control={control}
                  name="project.quantity"
                  render={({ field }) => (
                    <MmInput label="Quantité" unit="pce" integer value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                  )}
                />
              </div>
              <CompositionPreview
                type={values.composition.type}
                leafCount={values.composition.leafCount}
                dimensions={values.dimensions}
                handing={values.options.handing}
                openingSide={values.options.openingSide}
                leafWidths={geometry?.secondaryLeafWidthMm !== undefined ? { active: geometry.leafWidthMm, passive: geometry.secondaryLeafWidthMm } : undefined}
              />
            </div>
            <Notice tone="info">
              Passage libre = largeur de passage, vantaux ouverts à 90°. Avec une partie fixe, la largeur totale et le passage libre suffisent : les parties
              fixes prennent le reste (réparti également s’il y en a deux). Hauteur d’imposte = hauteur totale − hauteur de la zone porte (dossier : 2 170 mm).
            </Notice>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend>Étape 4 — Options techniques</legend>
            <Notice tone="demo" title="Listes provisoires">Les listes ci-dessous sont des données de démonstration, en attente du catalogue Forster.</Notice>
            <div className="grid-2">
              <div className="field">
                <span className="field__label">Ouverture</span>
                <label className="radio"><input type="radio" value="interieur" {...register('options.openingSide')} /> Intérieure</label>
                <label className="radio"><input type="radio" value="exterieur" {...register('options.openingSide')} /> Extérieure</label>
              </div>
              <div className="field">
                <span className="field__label">Sens d’ouverture DIN</span>
                <label className="radio"><input type="radio" value="din_gauche" {...register('options.handing')} /> DIN gauche</label>
                <label className="radio"><input type="radio" value="din_droite" {...register('options.handing')} /> DIN droite</label>
              </div>
              {OPTION_LISTS.map((list) => (
                <div key={list.field} className="field">
                  <label htmlFor={`opt-${list.field}`}>
                    {list.label} {list.status === 'provisoire' && <DemoTag>{list.sourceNote}</DemoTag>}
                  </label>
                  <select id={`opt-${list.field}`} {...register(`options.${list.field}`)}>
                    {list.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              ))}
              <TextField label="Autres accessoires" {...register('options.otherAccessories')} />
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend>Étape 5 — Récapitulatif</legend>
            <QuoteSummary values={values} />
          </fieldset>
        )}

        {saveError && <Notice tone="bloquant">{saveError}</Notice>}

        <div className="form-actions">
          <button type="button" className="btn" disabled={step === 0} onClick={() => void goTo(step - 1)}>Étape précédente</button>
          {step < STEPS.length - 1 && (
            <button type="button" className="btn btn--primary" onClick={() => void goTo(step + 1)}>Étape suivante</button>
          )}
          <button type="submit" className={step === STEPS.length - 1 ? 'btn btn--primary' : 'btn'}>Enregistrer le chiffrage</button>
        </div>
      </form>
    </section>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; ref?: Ref<HTMLInputElement> };

function TextField({ label, error, ref, ...rest }: TextFieldProps) {
  const id = `f-${rest.name ?? label}`.replace(/[^a-zA-Z0-9-]/g, '-');
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" ref={ref} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {error && <p id={`${id}-err`} className="field__error">{error}</p>}
    </div>
  );
}
