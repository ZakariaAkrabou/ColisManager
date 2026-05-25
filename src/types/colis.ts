export type ColisStatus = 'Livré' | 'En transit' | 'En attente';
export type ColisType = 'Standard' | 'Express' | 'Fragile';

export interface ColisItem {
    id: string;
    trackingNo: string;
    sender: string;
    receiver: string;
    city: string;
    type: ColisType;
    weight: number;
    totalPrice: number;
    status: ColisStatus;
    date: string;
}
