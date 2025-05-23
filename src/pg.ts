import { Snowflake } from "discord.js";
import { Client, ClientConfig } from "pg";

type TableName = "users" | "channels" | "messages" | "user_statistics";

export default class PGStorageClient {
    private static readonly TABLES: Record<TableName, string> = {
        "users": "CREATE TABLE users (id BIGINT PRIMARY KEY, username VARCHAR(32), truther BOOLEAN);",
        "channels": "CREATE TABLE channels (id BIGINT PRIMARY KEY, guild_id BIGINT, name VARCHAR(32));",
        "messages": "CREATE TABLE messages (id BIGINT PRIMARY KEY, guild_id BIGINT, channel_id BIGINT REFERENCES channels(id), user_id BIGINT REFERENCES users(id), content TEXT, attachment_count SMALLINT, embed_count SMALLINT, created_at TIMESTAMP);",
        "user_statistics": "CREATE TABLE user_statistics (user_id BIGINT PRIMARY KEY REFERENCES users(id), message_count INT DEFAULT 0);"
    };

    // List of tables that should be purged when a guild removes this bot
    private static readonly PURGEABLE_GUILD_TABLES: TableName[] = [];

    private readonly client: Client;

    constructor(clientConfig: ClientConfig) {
        this.client = new Client(clientConfig);
    }
    
    async connect() {
        await this.client.connect();
    }

    toString(): string {
        return `PGStorageClient@${this.client.host}:${this.client.port}`;
    }

    async initializeTables(): Promise<void> {
        const results: string[] = [];
        for (const [ tableName, tableSchema ] of Object.entries(PGStorageClient.TABLES)) {
            if (await this.doesTableExist(tableName)) {
                results.push(`✅ Table \`${tableName}\` exists`);
            } else {
                await this.client.query(tableSchema);
                results.push(`⚠️ Table \`${tableName}\` created`);
            }
        }
        console.log(results.join("\n"));
    }
    
    async doesTableExist(name: string): Promise<boolean> {
        return (await this.client.query<{ exists: boolean }>("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1);", [name])).rows[0].exists;
    }

    /**
     * Delete all rows from the given table.
     * THIS SHOULD ONLY BE USED FOR TESTING.
     *
     * @param table Name of the table to delete rows from
     */
    async clearTable(table: TableName): Promise<void> {
        await this.client.query(`DELETE FROM ${table};`);
    }

    getTableNames(): TableName[] {
        return Object.keys(PGStorageClient.TABLES) as TableName[];
    }

    async writeUser(id: Snowflake, username: string): Promise<void> {
        await this.client.query("INSERT INTO users VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;", [id, username]);
    }
    
    async fetchUsers(): Promise<Record<Snowflake, { username: string, truther: boolean }>> {
        const result: Record<Snowflake, { username: string, truther: boolean }> = {};
        const queryResult = await this.client.query<{ id: Snowflake, username: string, truther: boolean }>("SELECT * FROM users;");
        for (const row of queryResult.rows) {
            result[row.id] = {
                username: row.username,
                truther: row.truther
            };
        }
        return result;
    }

    async fetchUser(id: Snowflake): Promise<string | null> {
        const queryResult = await this.client.query<{ id: Snowflake, username: string }>("SELECT * FROM users WHERE id = $1;", [id]);
        if (queryResult.rowCount === 0) {
            return null;
        }
        return queryResult.rows[0].username;
    }

    async setUserTruther(id: Snowflake): Promise<void> {
        await this.client.query("UPDATE users SET truther = TRUE WHERE id = $1;", [id]);
    }

    async unsetUserTruther(id: Snowflake): Promise<void> {
        await this.client.query("UPDATE users SET truther = FALSE WHERE id = $1;", [id]);
    }

    async writeChannel(id: Snowflake, guildId: Snowflake, name: string): Promise<void> {
        await this.client.query("INSERT INTO channels VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET guild_id = EXCLUDED.guild_id, name = EXCLUDED.name;", [id, guildId, name]);
    }

    async writeMessage(id: Snowflake, guildId: Snowflake, channelId: Snowflake, userId: Snowflake, content: string, attachmentCount: number, embedCount: number, createdAt: Date): Promise<void> {
        await this.client.query("INSERT INTO messages VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET guild_id = EXCLUDED.guild_id, channel_id = EXCLUDED.channel_id, user_id = EXCLUDED.user_id, content = EXCLUDED.content, attachment_count = EXCLUDED.attachment_count, embed_count = EXCLUDED.embed_count, created_at = EXCLUDED.created_at;", [id, guildId, channelId, userId, content, attachmentCount, embedCount, createdAt]);
    }

    async incrementUserMessageCount(userId: Snowflake): Promise<void> {
        await this.client.query("INSERT INTO user_statistics (user_id, message_count) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET message_count = user_statistics.message_count + 1;", [userId]);
    }

    async fetchUserMessages(userId: Snowflake): Promise<{ channel_id: string, content: string, attachment_count: number, embed_count: number, created_at: Date }[]> {
        const result = await this.client.query<{ content: string, attachment_count: number, embed_count: number, created_at: Date, channel_id: string }>("SELECT content, attachment_count, embed_count, created_at, channel_id FROM messages WHERE user_id = $1;", [userId]);
        return result.rows;
    }

    async fetchChannelMessages(channelId: Snowflake, limit = 10): Promise<{ user_id: string, content: string, attachment_count: number, embed_count: number, created_at: Date }[]> {
        const result = await this.client.query<{ user_id: string, content: string, attachment_count: number, embed_count: number, created_at: Date }>("SELECT user_id, content, attachment_count, embed_count, created_at FROM messages WHERE channel_id = $1 ORDER BY created_at DESC LIMIT $2;", [channelId, limit]);
        return result.rows;
    }
}
