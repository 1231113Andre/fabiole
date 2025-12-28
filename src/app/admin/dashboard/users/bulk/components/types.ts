import { UserData } from "../../[id]/types";

export interface BulkRow {
    id: string;
    date?: string;
    [key: string]: any;
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

