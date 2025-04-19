import PGStorageClient from "./pg";
import State from "./state";
import { rand } from "./util";
import { SO_TRUE_MAX_INT } from "./constants";
import { Snowflake } from "discord.js";

const topicsOfInherentSoTruthiness = [
    "sotrue",
    "flatearth",
];

export default class JudgeOfTruth {
    private _pgStorageClient: PGStorageClient;
    private _state: State;

    constructor(pgStorageClient: PGStorageClient, state: State) {
        this._pgStorageClient = pgStorageClient;
        this._state = state;
        console.log("Judge of Truth is at court...");
    }

    async load() {
        // Hydrate state with existing users
        const users = await this._pgStorageClient.fetchUsers();
        const truthers = Object.keys(users).filter((userId) => users[userId].truther);
        this._state.setTruthers(truthers);
    }

    decide(userId: Snowflake, content: string): boolean {
        // In dev mode, so true statements are very common (because I am the dev)
        if (process.env.DEV_MODE) {
            return rand(2) === rand(2);
        }
        let soTrueMaxInt = SO_TRUE_MAX_INT;
        // If sayer is a truther, double the odds
        if (this._state.isTruther(userId)) {
            soTrueMaxInt /= 2;
        }
        // Converts content to lower case and removes all spaces
        const contentString = content.toLowerCase().replace(/\s+/g, "");
        // If topics or concepts of inherent so-truthiness are discussed, double the odds
        const isContentSoTrue = topicsOfInherentSoTruthiness.some(topic => contentString.includes(topic));
        if (isContentSoTrue) {
            soTrueMaxInt /= 2;
        }
        // THE RESULT OF THE SO TRUTHINESS TEST 
        return rand(soTrueMaxInt) === rand(soTrueMaxInt);
    }

    isTruther(userId: Snowflake): boolean {
        return this._state.isTruther(userId);
    }

    async addTruther(userId: Snowflake): Promise<void> {
        await this._pgStorageClient.setUserTruther(userId);
        this._state.addTruther(userId);
    }

    async removeTruther(userId: Snowflake): Promise<void> {
        await this._pgStorageClient.unsetUserTruther(userId);
        this._state.removeTruther(userId);
    }
}
