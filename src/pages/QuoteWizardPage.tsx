import { useMemo, useState, type InputHTMLAttributes, type Ref } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Quote } from '../types';
import { quoteFormSchema, type QuoteFormValues } from '../validation/quoteSchema';
import { COMPOSITIONS, DIMENSION_LABELS, getComposition, visibleDimensionFields } from '../domain/compositions';
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
    dimensions: { totalWidth: 1073, totalHeight: 2170 },
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
  const dimensionFields = visibleDimensionFields(values.composition.type, values.composition.leafCount);

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

  const onSave = handleSubmit((data) => {
    try {
      const result = calculateQuote(data);
      const status = result.status === 'calcule' ? 'calcule' : 'a_completer';
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
            <div className="choice-grid" role="radiogroup" aria-label="Type de composition">
              {COMPOSITIONS.map((c) => (
                <label key={c.type} className={`choice${values.composition.type === c.type ? ' choice--active' : ''}`}>
                  <input
                    type="radio"
                    value={c.type}
                    checked={values.composition.type === c.type}
                    onChange={() => {
                      setValue('composition.type', c.type, { shouldValidate: true });
                      const leaves = c.leafCounts[0] ?? 1;
                      if (!c.leafCounts.includes(values.composition.leafCount)) setValue('composition.leafCount', leaves);
                    }}
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
                    <input type="radio" checked={values.composition.leafCount === n} onChange={() => setValue('composition.leafCount', n, { shouldValidate: true })} />
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
                {dimensionFields.map((field) => (
                  <Controller
                    key={field}
                    control={control}
                    name={`dimensions.${field}`}
                    render={({ field: f, fieldState }) => (
                      <MmInput label={DIMENSION_LABELS[field]} value={f.value} onChange={f.onChange} onBlur={f.onBlur} error={fieldState.error?.message} />
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
              <CompositionPreview type={values.composition.type} leafCount={values.composition.leafCount} dimensions={values.dimensions} handing={values.options.handing} />
            </div>
            <Notice tone="info">Limites dimensionnelles Forster non fournies : validation min / max désactivée (règle métier à fournir).</Notice>
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
                <span className="field__label">Tirant</span>
                <label className="radio"><input type="radio" value="tirant_gauche" {...register('options.handing')} /> Tirant gauche</label>
                <label className="radio"><input type="radio" value="tirant_droit" {...register('options.handing')} /> Tirant droit</label>
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
