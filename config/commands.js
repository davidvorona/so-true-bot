/* eslint-disable @typescript-eslint/no-var-requires */
const { ApplicationCommandOptionType } = require("discord-api-types/v9");

module.exports = [
    {
        name: "ping",
        description: "Replies with pong!"
    },
    {
        name: "sotrue",
        description: "So true.",
        options: [{
            type: ApplicationCommandOptionType.Mentionable,
            name: "truthsayer",
            description: "Who is being so true right now?",
            required: false
        }]
    },
    {
        name: "st",
        description: "So true.",
        options: [{
            type: ApplicationCommandOptionType.Mentionable,
            name: "truthsayer",
            description: "Who is being so true right now?",
            required: false
        }]
    },
    {
        name: "sofuckintrue",
        description: "So fuckin' true.",
        options: [{
            type: ApplicationCommandOptionType.Mentionable,
            name: "truthsayer",
            description: "Who is being so fuckin' true right now?",
            required: false
        }]
    },
    {
        name: "sft",
        description: "So fuckin' true.",
        options: [{
            type: ApplicationCommandOptionType.Mentionable,
            name: "truthsayer",
            description: "Who is being so fuckin' true right now?",
            required: false
        }]
    },
    {
        name: "truther",
        description: "Appoint or impeach someone who is just so true.",
        options: [{
            type: ApplicationCommandOptionType.Mentionable,
            name: "truther",
            description: "Who is worthy of being a truther?",
        }]
    },
    {
        name: "truthers",
        description: "Get a list of currently appointed truthers.",
    }
];
