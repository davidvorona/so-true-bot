import PGStorageClient from "./pg";
import State from "./state";
import { Snowflake } from "discord.js";

export default class DiscordHistoricalSociety {
    private _pgStorageClient;

    private _state;

    constructor(pgStorageClient: PGStorageClient, state: State) {
        this._pgStorageClient = pgStorageClient;
        this._state = state;
        console.log("Discord Historical Society is recording...");
    }

    async load() {
        // Hydrate state with existing users
        const users = await this._pgStorageClient.fetchUsers();
        this._state.setUsers(Object.keys(users));
    }

    async recordUserIfNew(userId: Snowflake, username: string) {
        if (this._state.hasUser(userId)) {
            return;
        }
        await this._pgStorageClient.writeUser(userId, username);
        this._state.addUser(userId);
    }

    async recordChannelIfNew(guildId: Snowflake, channelId: Snowflake, channelName: string) {
        if (this._state.hasChannel(guildId)) {
            return;
        }
        await this._pgStorageClient.writeChannel(guildId, channelId, channelName);
        this._state.addChannel(guildId);
    }

    async recordMessage(
        messageId: Snowflake,
        guildId: Snowflake,
        channelId: Snowflake,
        userId: Snowflake,
        content: string,
        attachmentCount: number,
        embedCount: number,
        createdAt: Date
    ) {
        await this._pgStorageClient.writeMessage(
            messageId,
            guildId,
            channelId,
            userId,
            content,
            attachmentCount,
            embedCount,
            createdAt
        );
        await this._pgStorageClient.incrementUserMessageCount(userId);
    }

    async fetchUserMessages(userId: Snowflake) {
        const userMessages = await this._pgStorageClient.fetchUserMessages(userId);
        return userMessages.map((message) => ({
            content: message.content,
            attachmentCount: message.attachment_count,
            embedCount: message.embed_count,
            createdAt: new Date(message.created_at),
            channelId: message.channel_id
        }));
    }
}
