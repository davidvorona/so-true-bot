import { Client, AnyChannel, Guild, GuildMember } from "discord.js";
import * as fs from "fs";
import path from "path";
import { SO_TRUE_MAX_INT } from "./constants";

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

const topicsOfInherentSoTruthiness = [
    "sotrue",
    "flatearth",
];

export const determineSoTruthiness = (userId: string, content: string, isTruther: boolean): boolean => {
    // In dev mode, so true statements are very common (because I am the dev)
    if (process.env.DEV_MODE) {
        return rand(2) === rand(2);
    }
    let soTrueMaxInt = SO_TRUE_MAX_INT;
    // If sayer is a truther, double the odds
    if (isTruther) {
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
};
