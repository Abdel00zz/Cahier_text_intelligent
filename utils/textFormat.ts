import React from 'react';

// Split into math vs normal segments, then apply **bold** on normal parts only.
export function renderDescriptionWithBold(text: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  // Match $$...$$ (multiline) or $...$ (single line)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [seg] = match;
    const start = match.index;
    const end = start + seg.length;

    // Non-math segment before
    if (start > lastIndex) {
      nodes.push(...applyBold(text.slice(lastIndex, start)));
    }
    // Math segment as-is
    nodes.push(seg);
    lastIndex = end;
  }

  // Trailing non-math
  if (lastIndex < text.length) {
    nodes.push(...applyBold(text.slice(lastIndex)));
  }

  return nodes;
}

function applyBold(segment: string): React.ReactNode[] {
  if (!segment) return [];
  const out: React.ReactNode[] = [];
  const regexBold = /\*\*([^*]+)\*\*/g; // simple non-greedy bold
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regexBold.exec(segment)) !== null) {
    const start = m.index;
    if (start > last) out.push(segment.slice(last, start));
    out.push(React.createElement('strong', { key: `b-${start}-${regexBold.lastIndex}` }, m[1]));
    last = regexBold.lastIndex;
  }
  if (last < segment.length) out.push(segment.slice(last));
  return out;
}
