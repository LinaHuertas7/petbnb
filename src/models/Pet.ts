export interface Pet {
    id: string;
    userId: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string;
    age: number;
    size: "small" | "medium" | "large";
    weight?: number;
    photo?: string;
    specialInstructions?: string;
    medicalConditions?: string;
    vaccinated: boolean;
    neutered: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePetData {
    name: string;
    species: "dog" | "cat" | "other";
    breed: string;
    age: number;
    size: "small" | "medium" | "large";
    weight?: number;
    photo?: string;
    specialInstructions?: string;
    medicalConditions?: string;
    vaccinated: boolean;
    neutered: boolean;
}
