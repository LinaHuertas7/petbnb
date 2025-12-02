import { Preferences } from "@capacitor/preferences";

const KEYS = {
    USER: "user",
    LISTINGS: "listings",
    FILTERS: "filters",
    PETS: "pets",
    BOOKINGS: "bookings",
};

interface Booking {
    id: string;
    userId: string;
    listingId: string;
    listingTitle: string;
    startDate: string;
    endDate: string;
    pets: Array<{
        id: string;
        name: string;
        species: string;
    }>;
    specialRequests?: string;
    totalAmount: number;
    currency: string;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: string;
    updatedAt?: string;
}

interface Pet {
    id: string;
    userId: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string;
    age: number;
    size: "small" | "medium" | "large";
    weight: number;
    photo?: string;
    specialInstructions?: string;
    medicalConditions?: string;
    vaccinated: boolean;
    neutered: boolean;
}

const preferences = Preferences;

export const storage = {
    // ==================== USER ====================
    async getUser() {
        const { value } = await preferences.get({ key: KEYS.USER });
        return value ? JSON.parse(value) : null;
    },

    async setUser(user: any) {
        await preferences.set({
            key: KEYS.USER,
            value: JSON.stringify(user),
        });
    },

    async removeUser() {
        await preferences.remove({ key: KEYS.USER });
    },

    // ==================== LISTINGS ====================
    async getAllListings() {
        const { value } = await preferences.get({ key: KEYS.LISTINGS });
        return value ? JSON.parse(value) : [];
    },

    async getListingDraft() {
        const listings = await this.getAllListings();
        return listings.filter((listing: any) => listing.isDraft);
    },

    async getListingById(id: string) {
        const listings = await this.getAllListings();
        return listings.find((listing: any) => listing.id === id);
    },

    async saveListings(listings: any[]) {
        await preferences.set({
            key: KEYS.LISTINGS,
            value: JSON.stringify(listings),
        });
    },

    async deleteDraft(id: any) {
        const listings = await this.getAllListings();
        const filteredListings = listings.filter(
            (listing: any) => listing.id !== id
        );
        await preferences.set({
            key: KEYS.LISTINGS,
            value: JSON.stringify(filteredListings),
        });
    },

    async saveListing(listing: any, isDraft: boolean = false) {
        const listings = await this.getAllListings();
        const existingIndex = listings.findIndex(
            (l: any) => l.id === listing.id
        );

        listing.isDraft = isDraft;

        if (existingIndex !== -1) {
            listings[existingIndex] = listing;
        } else {
            listings.push(listing);
        }

        await preferences.set({
            key: KEYS.LISTINGS,
            value: JSON.stringify(listings),
        });
    },

    // ==================== FILTERS ====================
    async getFilters() {
        const { value } = await preferences.get({ key: KEYS.FILTERS });
        return value ? JSON.parse(value) : null;
    },

    async saveFilters(filters: any) {
        await preferences.set({
            key: KEYS.FILTERS,
            value: JSON.stringify(filters),
        });
    },

    async removeFilters() {
        await preferences.remove({ key: KEYS.FILTERS });
    },

    // ==================== PETS ====================
    async getPets(): Promise<Pet[]> {
        const { value } = await preferences.get({ key: KEYS.PETS });
        return value ? JSON.parse(value) : [];
    },

    async getUserPets(userId: string): Promise<Pet[]> {
        const allPets = await this.getPets();
        return allPets.filter((pet: Pet) => pet.userId === userId);
    },

    async getPetById(petId: string): Promise<Pet | null> {
        const allPets = await this.getPets();
        return allPets.find((pet: Pet) => pet.id === petId) || null;
    },

    async savePet(pet: Pet): Promise<void> {
        const allPets = await this.getPets();
        const existingIndex = allPets.findIndex((p: Pet) => p.id === pet.id);

        if (existingIndex !== -1) {
            allPets[existingIndex] = pet;
        } else {
            allPets.push(pet);
        }

        await preferences.set({
            key: KEYS.PETS,
            value: JSON.stringify(allPets),
        });
    },

    async deletePet(petId: string): Promise<void> {
        const allPets = await this.getPets();
        const filteredPets = allPets.filter((pet: Pet) => pet.id !== petId);
        await preferences.set({
            key: KEYS.PETS,
            value: JSON.stringify(filteredPets),
        });
    },

    // ==================== BOOKINGS ====================
    async getBookings(): Promise<Booking[]> {
        const { value } = await preferences.get({ key: KEYS.BOOKINGS });
        return value ? JSON.parse(value) : [];
    },

    async getUserBookings(userId: string): Promise<Booking[]> {
        const allBookings = await this.getBookings();
        return allBookings.filter(
            (booking: Booking) => booking.userId === userId
        );
    },

    async getBookingById(bookingId: string): Promise<Booking | null> {
        const allBookings = await this.getBookings();
        return allBookings.find((b: Booking) => b.id === bookingId) || null;
    },

    async saveBooking(booking: Booking): Promise<void> {
        const allBookings = await this.getBookings();
        allBookings.push(booking);
        await preferences.set({
            key: KEYS.BOOKINGS,
            value: JSON.stringify(allBookings),
        });
    },

    async updateBookingStatus(
        bookingId: string,
        status: Booking["status"]
    ): Promise<void> {
        const allBookings = await this.getBookings();
        const index = allBookings.findIndex((b: Booking) => b.id === bookingId);
        if (index !== -1) {
            allBookings[index].status = status;
            allBookings[index].updatedAt = new Date().toISOString();
            await preferences.set({
                key: KEYS.BOOKINGS,
                value: JSON.stringify(allBookings),
            });
        }
    },

    async deleteBooking(bookingId: string): Promise<void> {
        const allBookings = await this.getBookings();
        const filteredBookings = allBookings.filter(
            (b: Booking) => b.id !== bookingId
        );
        await preferences.set({
            key: KEYS.BOOKINGS,
            value: JSON.stringify(filteredBookings),
        });
    },

    // ==================== CLEAR ALL ====================
    async clearAll() {
        await preferences.clear();
    },
};
