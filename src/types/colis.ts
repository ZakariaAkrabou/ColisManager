export type ColisStatus = 'Livré' | 'En transit' | 'En attente' | 'Annulé';
export type ColisType = 'Standard' | 'Express' | 'Fragile' | 'Domicile' | 'Agence';

export interface ColisItem {
    id: string;
    trackingNo: string;
    sender: string;
    receiver: string;
    city: string;
    type: ColisType;
    weight: number;
    quantity?: number;
    totalPrice: number;
    status: ColisStatus;
    paid: boolean;
    date: string;
}
