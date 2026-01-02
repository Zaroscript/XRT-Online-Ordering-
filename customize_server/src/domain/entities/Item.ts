export interface ItemSize {
    name: string;
    price: number;
    is_default: boolean;
}

export interface Item {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    base_price: number;
    category_id: string;
    category?: {
        id: string;
        name: string;
    };
    image?: string;
    image_public_id?: string;
    is_available: boolean;
    is_signature: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    sizes?: ItemSize[];
    created_at: Date;
    updated_at: Date;
}

export interface CreateItemDTO {
    business_id: string;
    name: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    base_price: number;
    category_id: string;
    image?: string;
    image_public_id?: string;
    is_available?: boolean;
    is_signature?: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    sizes?: ItemSize[];
}

export interface UpdateItemDTO {
    name?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    base_price?: number;
    category_id?: string;
    image?: string;
    image_public_id?: string;
    is_available?: boolean;
    is_signature?: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    sizes?: ItemSize[];
}

export interface ItemFilters {
    business_id?: string;
    category_id?: string;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    sortedBy?: 'asc' | 'desc';
    name?: string;
}
