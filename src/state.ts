import { Snowflake } from "discord.js";

export default class State {
    private _users: Set<Snowflake>;

    private _channels: Set<Snowflake>;

    private _truthers: Set<Snowflake>;

    constructor() {
        this._users = new Set();
        this._truthers = new Set();
        this._channels = new Set();
    }

    setUsers(users: Snowflake[]): void {
        this._users = new Set(users);
    }

    addUser(user: Snowflake): void {
        this._users.add(user);
    }

    hasUser(user: Snowflake): boolean {
        return this._users.has(user);
    }

    setTruthers(truthers: Snowflake[]): void {
        this._truthers = new Set(truthers);
    }

    addTruther(user: Snowflake): void {
        this._truthers.add(user);
    }

    removeTruther(user: Snowflake): void {
        this._truthers.delete(user);
    }

    isTruther(user: Snowflake): boolean {
        return this._truthers.has(user);
    }

    setChannels(channels: Snowflake[]): void {
        this._channels = new Set(channels);
    }

    addChannel(channel: Snowflake): void {
        this._channels.add(channel);
    }

    hasChannel(channel: Snowflake): boolean {
        return this._channels.has(channel);
    }
}
