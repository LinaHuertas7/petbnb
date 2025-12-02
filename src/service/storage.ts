import { Preferences } from "@capacitor/preferences";

class StorageService {
    // Comprimir imagen a base64
    private async compressImage(
        file: File,
        maxWidth = 800,
        quality = 0.7
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar si es necesario
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir a base64 comprimido
                    const compressed = canvas.toDataURL("image/jpeg", quality);
                    resolve(compressed);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // LISTINGS
    async saveListing(draft: any, isDraft = false) {
        const key = isDraft ? "listing_draft" : `listing_${Date.now()}`;

        // Comprimir todas las fotos (máximo 3 para no exceder quota)
        let compressedPhotos: string[] = [];
        if (
            draft.photos &&
            Array.isArray(draft.photos) &&
            draft.photos.length > 0
        ) {
            try {
                // Tomar máximo 3 fotos para no llenar storage
                const photosToCompress = draft.photos.slice(0, 3);

                compressedPhotos = await Promise.all(
                    photosToCompress.map(async (photo: any) => {
                        // Si ya es base64, devolverlo tal cual
                        if (
                            typeof photo === "string" &&
                            photo.startsWith("data:")
                        ) {
                            return photo;
                        }
                        // Si es File, comprimir
                        if (photo instanceof File) {
                            return await this.compressImage(photo, 600, 0.6);
                        }
                        // Si es otra cosa, ignorar
                        return null;
                    })
                );

                // Filtrar nulls
                compressedPhotos = compressedPhotos.filter(
                    (p) => p !== null
                ) as string[];
            } catch (error) {
                console.error("Error comprimiendo imágenes:", error);
                compressedPhotos = [];
            }
        }

        const dataToSave = {
            title: draft.title,
            description: draft.description,
            capacity: draft.capacity,
            services: draft.services,
            basePrice: draft.basePrice,
            currency: draft.currency,
            availabilityRange: draft.availabilityRange,
            location: draft.location,
            photos: compressedPhotos,
            photoCount: draft.photos?.length || 0,
            isDraft,
            id: draft.id || crypto.randomUUID(),
            createdAt: draft.createdAt || new Date().toISOString(),
        };

        try {
            await Preferences.set({
                key,
                value: JSON.stringify(dataToSave),
            });
            return dataToSave.id;
        } catch (error) {
            console.error("Error guardando en storage:", error);
            // Si falla por quota, intentar sin fotos
            const dataWithoutPhotos = { ...dataToSave, photos: [] };
            await Preferences.set({
                key,
                value: JSON.stringify(dataWithoutPhotos),
            });
            return dataToSave.id;
        }
    }

    async getListingDraft() {
        const { value } = await Preferences.get({ key: "listing_draft" });
        if (!value) return null;
        return JSON.parse(value);
    }

    async deleteDraft() {
        await Preferences.remove({ key: "listing_draft" });
    }

    async getAllListings() {
        const { keys } = await Preferences.keys();
        const listingKeys = keys.filter(
            (k) => k.startsWith("listing_") && k !== "listing_draft"
        );

        const listings = await Promise.all(
            listingKeys.map(async (key) => {
                const { value } = await Preferences.get({ key });
                return value ? JSON.parse(value) : null;
            })
        );

        return listings.filter((l) => l && !l.isDraft);
    }

    // BOOKINGS
    async saveBooking(booking: any) {
        const bookings = await this.getBookings();
        const newBooking = {
            ...booking,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        bookings.push(newBooking);
        await Preferences.set({
            key: "bookings",
            value: JSON.stringify(bookings),
        });
        return newBooking.id;
    }

    async getBookings() {
        const { value } = await Preferences.get({ key: "bookings" });
        return value ? JSON.parse(value) : [];
    }

    // FILTERS
    async saveFilters(filters: any) {
        await Preferences.set({
            key: "search_filters",
            value: JSON.stringify(filters),
        });
    }

    async getFilters() {
        const { value } = await Preferences.get({ key: "search_filters" });
        return value ? JSON.parse(value) : null;
    }
}

export const storage = new StorageService();
