import { Client, Intents, Interaction, GuildMember, MessageEmbed, User } from "discord.js";
import { AuthJson, ConfigJson } from "./types";
import Storage from "./storage";
import TrutherManager from "./truthers";
import { readFile, parseJson, rand, determineSoTruthiness } from "./util";
import { DEFAULT_EMOJI_NAME, SO_TRUE_CMD } from "./constants";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import DiscordSecurityAgency from "./dsa";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commands = require("../config/commands");

const { TOKEN } = parseJson(readFile("../config/auth.json")) as AuthJson;
const { DATA_DIR, CLIENT_ID, EMOJI_NAME, OWNER_ID } = parseJson(readFile("../config/config.json")) as ConfigJson;

// Note: All developers must add an empty data/ directory at root
Storage.validateDataDir(DATA_DIR);

const storage = new Storage("data.json");

const storedTruthers = storage.read();
const truthers = new TrutherManager(storedTruthers, storage);
const falsers = new TrutherManager();

const rest = new REST({ version: "9" }).setToken(TOKEN);

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

const SO_TRUE_EMOJI = EMOJI_NAME || DEFAULT_EMOJI_NAME;

const discordSecurityAgency = new DiscordSecurityAgency();
let ownerUser: User;

/* Handle bot events */

client.on("ready", async () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log("------");
    }
    // For now, make sure global commands are cleared if any found
    if (client.application) {
        console.warn("Clearing any existing global application (/) commands.");
        client.application.commands.set([]);
    }
    // In case new commands have been added, refresh for all existing guilds
    await Promise.all(client.guilds.cache.map(async (guild) => {
        console.log(`Refreshing commands for guild: ${guild.id}`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guild.id),
            { body: commands }
        );
    }));
    if (OWNER_ID) {
        ownerUser = await client.users.fetch(OWNER_ID);
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
    console.log(`Bot removed from guild: ${guild.id}`);
});

// On new guild member, send bot welcome message to system channel 
client.on("messageCreate", async (message) => {
    // If message created by self, ignore
    if (message.author.id === client.user?.id) {
        return;
    }
    // If message includes the legacy !sotrue command, send out a "so true"
    if (message.content.includes(SO_TRUE_CMD)) {
        await message.channel.send("so true");
        return;
    }
    // Otherwise, if it hits the magic number, respond with a "so true"!
    const isTruther = truthers.has(message.author.id);
    const isSoTrue = determineSoTruthiness(message.author.id, message.cleanContent, isTruther);
    if (isSoTrue) {
        const numActions = 4;
        const action = rand(numActions - 1);
        const soTrueEmoji = message.guild?.emojis.cache.find(e => e.name === SO_TRUE_EMOJI);
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
    if (ownerUser) {
        const flagged = discordSecurityAgency.check(message.content);
        const dmChannel = await ownerUser.createDM();
        let msg = `**${message.author.username}**: ${message.content}`;
        if (flagged) {
            msg = `${ownerUser}\n${msg}`;
        }
        await dmChannel.send({ content: msg });
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
        if (falsers.has(interaction.user.id)) {
            await interaction.reply({
                content: "Truth-abuser! You must earn the right to so true...",
                ephemeral: true
            });
            return;
        }
        const truthsayer = interaction.options.getMentionable("truthsayer") as GuildMember | undefined;
        if (!truthsayer) {
            await interaction.reply("so true");
            return;
        }
        await interaction.reply(`${truthsayer.user} so true`);
    }

    if (interaction.commandName === "sofuckintrue" || interaction.commandName === "sft") {
        if (interaction.user.id !== OWNER_ID && !truthers.has(interaction.user.id)) {
            await interaction.reply(":no_entry_sign: Access Denied :no_entry_sign:");
            return;
        }
        const truthsayer = interaction.options.getMentionable("truthsayer") as GuildMember | undefined;
        if (!truthsayer) {
            await interaction.reply("so fuckin' true");
            return;
        }
        await interaction.reply(`${truthsayer.user} so fuckin' true`);
    }

    if (interaction.commandName === "truther") {
        if (interaction.user.id !== OWNER_ID) {
            await interaction.reply(":no_entry_sign: Access Denied :no_entry_sign:");
            return;
        }
        const truther = interaction.options.getMentionable("truther") as GuildMember;
        if (truthers.has(truther.user.id)) {
            truthers.remove(truther.user.id);
            await interaction.reply(`${truther.user} impeached!`);
        } else {
            truthers.add(truther.user.id);
            await interaction.reply(`${truther.user} appointed!`);
        }
    }

    if (interaction.commandName === "truthers") {
        if (interaction.user.id !== OWNER_ID) {
            await interaction.reply(":no_entry_sign: Access Denied :no_entry_sign:");
            return;
        }
        const members = await interaction.guild?.members.fetch();
        const trutherMembers = members?.filter(m => truthers.has(m.user.id));
        if (!trutherMembers || !trutherMembers.size) {
            await interaction.reply({ content: "There are no appointed truthers.", ephemeral: true });
            return;
        }
        let num = 1;
        const list = trutherMembers.reduce((acc, curr) => `${acc}\n**${num++}.** ${curr.displayName}`, "");
        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Truthers")
            .setDescription(list);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.commandName === "falser") {
        if (interaction.user.id !== OWNER_ID) {
            await interaction.reply(":no_entry_sign: Access Denied :no_entry_sign:");
            return;
        }
        const falser = interaction.options.getMentionable("falser") as GuildMember;
        if (falsers.has(falser.user.id)) {
            falsers.remove(falser.user.id);
            await interaction.reply(`${falser.user} reinstated in truth!`);
        } else {
            falsers.add(falser.user.id);
            await interaction.reply(`${falser.user} divested of truth!`);
        }
    }

    if (interaction.commandName === "falsers") {
        if (interaction.user.id !== OWNER_ID) {
            await interaction.reply(":no_entry_sign: Access Denied :no_entry_sign:");
            return;
        }
        const members = await interaction.guild?.members.fetch();
        const falserMembers = members?.filter(m => falsers.has(m.user.id));
        if (!falserMembers || !falserMembers.size) {
            await interaction.reply({ content: "There are no appointed falsers.", ephemeral: true });
            return;
        }
        let num = 1;
        const list = falserMembers.reduce((acc, curr) => `${acc}\n**${num++}.** ${curr.displayName}`, "");
        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Falsers")
            .setDescription(list);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.login(TOKEN);
