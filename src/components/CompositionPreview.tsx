import type { CompositionType, Dimensions, Handing, LeafCount, OpeningSide } from '../types';
import { computePreviewLayout, type PreviewDimension } from '../domain/previewLayout';
import { formatMm } from '../utils/format';

interface Props {
  type: CompositionType;
  leafCount: LeafCount;
  dimensions: Dimensions;
  handing: Handing;
  openingSide?: OpeningSide;
  leafWidths?: { active: number; passive: number };
  title?: string;
}

function fmt(v: number): string {
  return formatMm(v).replace(' mm', '');
}

export function CompositionPreview({ type, leafCount, dimensions, handing, openingSide, leafWidths, title = 'Schéma simplifié de la composition' }: Props) {
  const layout = computePreviewLayout(type, leafCount, dimensions, handing, { openingSide, leafWidths });
  if (!layout) {
    return <p className="preview-empty">Saisissez des dimensions cohérentes pour afficher le schéma.</p>;
  }
  const { width: W, height: H } = layout;
  const unit = Math.max(W, H) / 60; // drawing unit proportional to the size
  const gap = unit * 3.2;
  const margin = { left: gap * 2.6, top: unit * 2, right: unit * 2, bottom: gap * 2.6 };
  const frame = unit * 0.9;
  const font = unit * 1.55;
  const vbW = W + margin.left + margin.right;
  const vbH = H + margin.top + margin.bottom;

  const renderDim = (d: PreviewDimension, i: number) => {
    if (d.orientation === 'horizontal') {
      const y = H + gap * (d.level + 1);
      return (
        <g key={`h${i}`} className="preview-dim">
          <line x1={d.from} y1={y} x2={d.to} y2={y} />
          <line x1={d.from} y1={y - unit * 0.6} x2={d.from} y2={y + unit * 0.6} />
          <line x1={d.to} y1={y - unit * 0.6} x2={d.to} y2={y + unit * 0.6} />
          <text x={(d.from + d.to) / 2} y={y - unit * 0.5} fontSize={font} textAnchor="middle">{fmt(d.value)}</text>
        </g>
      );
    }
    const x = -gap * (d.level + 1);
    const cy = (d.from + d.to) / 2;
    return (
      <g key={`v${i}`} className="preview-dim">
        <line x1={x} y1={d.from} x2={x} y2={d.to} />
        <line x1={x - unit * 0.6} y1={d.from} x2={x + unit * 0.6} y2={d.from} />
        <line x1={x - unit * 0.6} y1={d.to} x2={x + unit * 0.6} y2={d.to} />
        <text x={x - unit * 0.5} y={cy} fontSize={font} textAnchor="middle" transform={`rotate(-90 ${x - unit * 0.5} ${cy})`}>{fmt(d.value)}</text>
      </g>
    );
  };

  return (
    <figure className="preview">
      <svg
        viewBox={`${-margin.left} ${-margin.top} ${vbW} ${vbH}`}
        role="img"
        aria-label={`${title} : ${fmt(W)} × ${fmt(H)} mm`}
        className="preview__svg"
      >
        <title>{title}</title>
        <rect x={0} y={0} width={W} height={H} className="preview-frame" strokeWidth={frame} />
        {layout.panels.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x + frame}
              y={p.y + frame}
              width={Math.max(p.w - 2 * frame, 0)}
              height={Math.max(p.h - (p.kind === 'vantail' ? frame : 2 * frame), 0)}
              className={p.kind === 'vantail' ? 'preview-leaf' : 'preview-glass'}
              strokeWidth={frame * 0.5}
            />
            {p.kind === 'vantail' && p.hinge && (
              <g className="preview-hinges">
                {[0.12, 0.5, 0.88].map((t) => (
                  <rect key={t} x={p.hinge === 'gauche' ? p.x - frame * 0.2 : p.x + p.w - frame * 0.8} y={p.y + p.h * t - unit * 0.9} width={frame} height={unit * 1.8} />
                ))}
              </g>
            )}
            {p.kind === 'vantail' && p.hinge && (
              <polyline
                className="preview-swing"
                strokeWidth={unit * 0.18}
                points={
                  // Base of the triangle on the hinge side, apex on the opening (lock) side.
                  p.hinge === 'gauche'
                    ? `${p.x + frame},${p.y + frame} ${p.x + p.w - frame},${p.y + p.h / 2} ${p.x + frame},${p.y + p.h}`
                    : `${p.x + p.w - frame},${p.y + frame} ${p.x + frame},${p.y + p.h / 2} ${p.x + p.w - frame},${p.y + p.h}`
                }
              />
            )}
            <text x={p.x + p.w / 2} y={p.y + p.h / 2} fontSize={font * 0.85} textAnchor="middle" className="preview-label">
              {p.label}
            </text>
          </g>
        ))}
        {layout.dividers.map((d, i) => (
          <line key={`d${i}`} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} className="preview-divider" strokeWidth={frame} />
        ))}
        {layout.dimensions.map(renderDim)}
      </svg>
      <figcaption>Vue extérieure — base des triangles côté paumelles. Proportions respectées, schéma non coté pour la fabrication.</figcaption>
    </figure>
  );
}
