/* Structure of JSON file with bot token */
export interface AuthJson {
    TOKEN: string;
    PG: {
        connectionString: string;
    }
}

/* Structure of JSON file with bot config */
export interface ConfigJson {
    CLIENT_ID: string;
    GUILD_ID: string;
    DATA_DIR: string;
    EMOJI_NAME?: string;
    OWNER_ID?: string;
}
