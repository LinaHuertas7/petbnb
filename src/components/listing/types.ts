export interface ListingDraft {
    title: string;
    description: string;
    capacity: number;
    services: string[];
    basePrice: number;
    currency: string;
    availabilityRange?: { start: string; end: string };
    photos: File[];
}

export const SERVICES = [
    "Alimentación",
    "Baño",
    "Paseo",
    "Cepillado",
    "Medicamentos",
    "Entrenamiento básico",
];

// Simulación post
export async function createListing(
    draft: ListingDraft
): Promise<{ id: string }> {
    // Aquí harías fetch('/api/listings', { method:'POST', body: formData })
    await new Promise((r) => setTimeout(r, 500));
    return { id: crypto.randomUUID() };
}
