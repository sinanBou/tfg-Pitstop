/**
 * Toast – Re-exporta el sistema de toast centralizado desde hooks/useToast.
 * El componente visual y el provider viven en useToast.tsx para simplificar el árbol de dependencias.
 */
export { ToastProvider, useToast } from '@/hooks/useToast';
export type { ToastVariant, ToastItem } from '@/hooks/useToast';
