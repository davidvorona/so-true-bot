import { Client, Intents, Interaction, GuildMember } from "discord.js";
import { AuthJson, ConfigJson } from "./types";
import Storage from "./storage";
import { readFile, parseJson, rand } from "./util";
import { DEFAULT_EMOJI_NAME, SO_TRUE_CMD, SO_TRUE_MAX_INT } from "./constants";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commands = require("../config/commands");

const { TOKEN } = parseJson(readFile("../config/auth.json")) as AuthJson;
const { DATA_DIR, CLIENT_ID, EMOJI_NAME, OWNER_ID } = parseJson(readFile("../config/config.json")) as ConfigJson;

// Note: All developers must add an empty data/ directory at root
Storage.validateDataDir(DATA_DIR);

const rest = new REST({ version: "9" }).setToken(TOKEN);

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

const SO_TRUE_EMOJI = EMOJI_NAME || DEFAULT_EMOJI_NAME;

const SO_TRUE_MAGIC_INT = rand(SO_TRUE_MAX_INT);


/* Handle bot events */

client.on("ready", () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log("------");
    }
    // For now, make sure global commands are cleared if any found
    if (client.application) {
        console.warn("Clearing any existing global application (/) commands.");
        client.application.commands.set([]);
    }
});

client.on("guildCreate", async (guild) => {
    try {
        console.log(`Started refreshing application (/) commands for guild: ${guild.id}.`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guild.id),
            { body: commands }
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (err) {
        console.error(err);
    }
});

client.on("guildDelete", (guild) => {
    console.log(`Bot removed from guild: ${guild.id}.`);
});

// On new guild member, send bot welcome message to system channel 
client.on("messageCreate", async (message) => {
    // If message created by self, ignore
    if (message.author === client.user) {
        return;
    }
    // If message includes the legacy !sotrue command, send out a "so true"
    if (message.content.includes(SO_TRUE_CMD)) {
        await message.channel.send("so true");
        return;
    }
    // Otherwise, if it hits the magic number, respond with a "so true"!
    const randomInt = rand(SO_TRUE_MAX_INT);
    if (randomInt === SO_TRUE_MAGIC_INT) {
        const numActions = 4;
        const action = rand(numActions - 1);
        const soTrueEmoji = message.guild?.emojis.cache.get(SO_TRUE_EMOJI);
        const soTrueEmojis = ["🇸", "🇴", "🇹", "🇷", "🇺", "🇪"];
        if (action === 0) {
            await message.reply("so true");
        } else if (action === 1 && soTrueEmoji) {
            await message.react(soTrueEmoji);
        } else if (action === 2) {
            soTrueEmojis.forEach(async (letter) => {
                await message.react(letter);
            });
        } else if (action === 3) {
            const soTrueEmojiText = soTrueEmojis.join(" ");
            await message.reply(soTrueEmojiText);
        } else {
            await message.reply("so true");
        }
    }
});

/* Handle slash commands */

// Handle command interactions
client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "ping") {
        await interaction.reply("pong!");
    }

    if (interaction.commandName === "sotrue" || interaction.commandName === "st") {
        const truthsayer = interaction.options.getMentionable("truthsayer") as GuildMember | undefined;
        if (!truthsayer) {
            await interaction.reply("so true");
            return;
        }
        await interaction.reply(`${truthsayer.user} so true`);
    }
});

client.login(TOKEN);