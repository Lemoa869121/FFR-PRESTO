import { useEffect, useId, useState } from 'react';
import { parseFrenchNumber } from '../utils/format';

interface Props {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  unit?: string;
  readOnly?: boolean;
  integer?: boolean;
}

const toText = (v: number | undefined) => (v === undefined || Number.isNaN(v) ? '' : String(v).replace('.', ','));

/** Numeric input accepting the French decimal comma ("2036,5"). */
export function MmInput({ label, value, onChange, onBlur, error, hint, unit = 'mm', readOnly, integer }: Props) {
  const id = useId();
  const [text, setText] = useState(toText(value));

  // Keep the text in sync when the value is changed from outside (reset, derived values).
  useEffect(() => {
    if (parseFrenchNumber(text) !== value && !(text === '' && value === undefined)) setText(toText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__unit">
        <input
          id={id}
          type="text"
          inputMode={integer ? 'numeric' : 'decimal'}
          value={text}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-desc` : undefined}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = parseFrenchNumber(e.target.value);
            onChange(e.target.value.trim() === '' ? undefined : parsed);
          }}
          onBlur={onBlur}
        />
        {unit && <span aria-hidden="true">{unit}</span>}
      </div>
      {(error || hint) && (
        <p id={`${id}-desc`} className={error ? 'field__error' : 'field__hint'}>{error ?? hint}</p>
      )}
    </div>
  );
}
