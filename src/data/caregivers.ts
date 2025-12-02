import { Caregiver } from "../components/map/MapView";

export const mockCaregivers: Caregiver[] = [
    {
        id: "1",
        name: "Casa de Luna",
        location: [4.711, -74.0059],
        price: 20000,
        petTypes: ["perro"],
        rating: 4.7,
        capacity: 3,
        services: ["Alimentación", "Paseo", "Baño"],
        photos: [
            "/images/casa_de_luna_1.jpg",
            "/images/refugio-canino-1.jpg",
            "/images/refugio-canino-2.jpg",
            "/images/hogar-max-1.jpg",
        ],
        description:
            "Ambiente cálido y seguro para perros pequeños y medianos.",
    },
    {
        id: "2",
        name: "Hogar de Max",
        location: [4.7169, -74.0121],
        price: 18000,
        petTypes: ["gato", "perro"],
        rating: 4.5,
        capacity: 2,
        services: ["Cepillado", "Alimentación"],
        photos: [
            "/images/casa_de_luna_1.jpg",
            "/images/refugio-canino-1.jpg",
            "/images/refugio-canino-2.jpg",
            "/images/hogar-max-1.jpg",
        ],
        description: "Trato personalizado y supervisión constante.",
    },
    {
        id: "3",
        name: "Refugio Canino Bogotá",
        location: [4.7056, -74.0094],
        price: 22000,
        petTypes: ["perro"],
        rating: 4.8,
        capacity: 5,
        services: ["Entrenamiento básico", "Paseo", "Baño"],
        photos: [
            "/images/casa_de_luna_1.jpg",
            "/images/refugio-canino-1.jpg",
            "/images/refugio-canino-2.jpg",
            "/images/hogar-max-1.jpg",
        ],
        description:
            "Amplias áreas de juego y atención veterinaria disponible.",
    },
    {
        id: "4",
        name: "Cuidado Felino",
        location: [4.709, -74.0007],
        price: 25000,
        petTypes: ["gato"],
        rating: 4.9,
        capacity: 4,
        services: ["Alimentación", "Cepillado", "Medicamentos"],
        photos: [
            "/images/casa_de_luna_1.jpg",
            "/images/refugio-canino-1.jpg",
            "/images/refugio-canino-2.jpg",
            "/images/hogar-max-1.jpg",
        ],
        description:
            "Especialistas en cuidado de gatos con ambiente enriquecido.",
    },
];

export function getCaregiver(id: string) {
    return mockCaregivers.find((c) => c.id === id) || null;
}
