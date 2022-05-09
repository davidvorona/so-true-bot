import Storage from "./storage";

export default class TrutherManager {
    private truthers: string[];

    private storage?: Storage;

    constructor(truthers: string[], storage: Storage) {
        this.truthers = truthers;
        if (storage) {
            this.storage = storage;
        }
    }

    add(userId: string) {
        this.truthers.push(userId);
        if (this.storage) {
            this.storage.add(userId);
        }
    }

    has(userId: string): boolean {
        return this.truthers.includes(userId);
    }

    get(userId: string): string | undefined {
        return this.truthers.find(t => t === userId);
    }

    getAll() {
        return this.truthers;
    }
}
