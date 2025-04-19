import { Client, AnyChannel, Guild, GuildMember } from "discord.js";
import * as fs from "fs";
import path from "path";

/**
 * Reads the file at the provided file path and returns stringified data.
 * 
 * @param {string} filePath relative path to the file
 * @returns {string} stringified data from file
 */
export const readFile = (filePath: string): string =>
    fs.readFileSync(path.join(__dirname, filePath), "utf-8");

/**
 * Parses the stringified data to a JSON object and logs any exceptions.
 * 
 * @param {string} dataJson 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJson = (dataJson: string): any => {
    try {
        return JSON.parse(dataJson);
    } catch (err) {
        console.error("Failed to read JSON", dataJson);
        throw err;
    }
};

/**
 * Finds a random number between 0 and the provided max, exclusive.
 * Example: rand(3) => 0 or 1 or 2
 * 
 * @param {number} max 
 * @returns 
 */
export const rand = (max: number) => Math.floor(Math.random() * Math.floor(max));

/**
 * Gets a channel from a Discord container by its ID.
 * 
 * @param {Guild|Client|GuildMember} container 
 * @param {string} channelId 
 * @returns {AnyChannel}
 */
export const getChannel = (container: Guild | Client | GuildMember, channelId: string): AnyChannel | void => {
    if (container instanceof GuildMember) {
        return container.guild.channels.cache.get(channelId);
    }
    return container.channels.cache.get(channelId);
};
