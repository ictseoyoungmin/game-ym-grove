import rawVariants from './variants.json';
import type { YmVariant } from '../types/game';

export const variants = rawVariants as readonly YmVariant[];

export const variantById = Object.fromEntries(
  variants.map((variant) => [variant.id, variant]),
) as Record<YmVariant['id'], YmVariant>;
