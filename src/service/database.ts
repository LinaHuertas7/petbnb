import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from "@capacitor-community/sqlite";

class DatabaseService {
    private db: SQLiteDBConnection | null = null;
    private initialized = false;
    private sqlite: SQLiteConnection;

    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    async init() {
        if (this.initialized) return;

        // Crear conexión
        await this.sqlite.createConnection(
            "petbnb",
            false,
            "no-encryption",
            1,
            false
        );

        // Obtener la conexión
        this.db = await this.sqlite.retrieveConnection("petbnb", false);
        await this.db.open();

        // Crear tablas
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS listings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                capacity INTEGER,
                base_price REAL,
                currency TEXT,
                services TEXT,
                photos TEXT,
                availability_start TEXT,
                availability_end TEXT,
                created_at TEXT,
                is_draft INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS bookings (
                id TEXT PRIMARY KEY,
                caregiver_id TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                pets TEXT NOT NULL,
                notes TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS search_filters (
                id INTEGER PRIMARY KEY,
                query TEXT,
                pet_type TEXT,
                max_distance INTEGER,
                updated_at TEXT
            );
        `);

        this.initialized = true;
    }

    // LISTINGS
    async saveListing(draft: any, isDraft = false) {
        await this.init();
        const id = draft.id || crypto.randomUUID();
        await this.db?.run(
            `INSERT OR REPLACE INTO listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                draft.title,
                draft.description,
                draft.capacity,
                draft.basePrice,
                draft.currency,
                JSON.stringify(draft.services),
                JSON.stringify(draft.photos?.map((f: File) => f.name) || []),
                draft.availabilityRange?.start || null,
                draft.availabilityRange?.end || null,
                new Date().toISOString(),
                isDraft ? 1 : 0,
            ]
        );
        return id;
    }

    async getListingDraft() {
        await this.init();
        const result = await this.db?.query(
            "SELECT * FROM listings WHERE is_draft = 1 ORDER BY created_at DESC LIMIT 1"
        );
        if (!result?.values || result.values.length === 0) return null;
        const row = result.values[0];
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            capacity: row.capacity,
            basePrice: row.base_price,
            currency: row.currency,
            services: JSON.parse(row.services || "[]"),
            photos: [],
            availabilityRange: row.availability_start
                ? {
                      start: row.availability_start,
                      end: row.availability_end,
                  }
                : undefined,
        };
    }

    async deleteDraft() {
        await this.init();
        await this.db?.run("DELETE FROM listings WHERE is_draft = 1");
    }

    // BOOKINGS
    async saveBooking(booking: any) {
        await this.init();
        const id = crypto.randomUUID();
        await this.db?.run(
            `INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                booking.caregiverId,
                booking.startDate,
                booking.endDate,
                JSON.stringify(booking.pets),
                booking.notes,
                booking.status || "pending",
                new Date().toISOString(),
            ]
        );
        return id;
    }

    async getBookings() {
        await this.init();
        const result = await this.db?.query(
            "SELECT * FROM bookings ORDER BY created_at DESC"
        );
        return (
            result?.values?.map((row) => ({
                id: row.id,
                caregiverId: row.caregiver_id,
                startDate: row.start_date,
                endDate: row.end_date,
                pets: JSON.parse(row.pets),
                notes: row.notes,
                status: row.status,
                createdAt: row.created_at,
            })) || []
        );
    }

    // FILTERS
    async saveFilters(filters: any) {
        await this.init();
        await this.db?.run(
            `INSERT OR REPLACE INTO search_filters (id, query, pet_type, max_distance, updated_at) VALUES (1, ?, ?, ?, ?)`,
            [
                filters.query,
                filters.petType,
                filters.maxDistance,
                new Date().toISOString(),
            ]
        );
    }

    async getFilters() {
        await this.init();
        const result = await this.db?.query(
            "SELECT * FROM search_filters WHERE id = 1"
        );
        if (!result?.values || result.values.length === 0) return null;
        const row = result.values[0];
        return {
            query: row.query,
            petType: row.pet_type,
            maxDistance: row.max_distance,
        };
    }
}

export const db = new DatabaseService();
