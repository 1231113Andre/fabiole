import { UserData } from "../../[id]/types";

export interface BulkRow {
    id: string;
    date?: string;
    [key: string]: any;
    overrides?: Record<string, boolean>;
}

export interface BulkAddClientProps {
    initialUser: UserData;
    type: 'pesagens' | 'perimetros' | 'avaliacoes';
}

export type BulkType = 'pesagens' | 'perimetros' | 'avaliacoes';

export const MAX_ROWS_PER_PAGE = 13;

export const TYPE_LABELS: Record<BulkType, string> = {
    pesagens: 'Pesagens',
    perimetros: 'Perímetros',
    avaliacoes: 'Avaliações'
};

export const TYPE_LABELS_PT: Record<BulkType, { singular: string; plural: string }> = {
    pesagens: { singular: 'pesagem', plural: 'pesagens' },
    perimetros: { singular: 'perímetro', plural: 'perímetros' },
    avaliacoes: { singular: 'avaliação', plural: 'avaliações' }
};

/**
 * Required fields for each bulk type
 * All these fields must have a value for a row to be valid
 */
export const REQUIRED_FIELDS: Record<BulkType, string[]> = {
    pesagens: ['date', 'peso', 'height', 'percentualMG'],
    perimetros: ['date', 'msRight', 'msLeft', 'chest', 'waist', 'abdomen', 'hips', 'thighR', 'thighL'],
    avaliacoes: ['date', 'pushUps', 'sitUps', 'mile']
};

/**
 * Field labels for displaying validation errors
 */
export const FIELD_LABELS: Record<string, string> = {
    date: 'Data',
    peso: 'Peso',
    height: 'Altura',
    percentualMG: '% MG',
    msRight: 'MS Direito',
    msLeft: 'MS Esquerdo',
    chest: 'Peito',
    waist: 'Cintura',
    abdomen: 'Abdómen',
    hips: 'Anca',
    thighR: 'Coxa Dir.',
    thighL: 'Coxa Esq.',
    pushUps: 'Flexões',
    sitUps: 'Abdominais',
    mile: 'Milha'
};


