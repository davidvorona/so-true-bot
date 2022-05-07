// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    // {
    //     name: "sofuckintrue",
    //     description: "So fuckin' true.",
    //     options: [{
    //         type: ApplicationCommandOptionType.Mentionable,
    //         name: "truthsayer",
    //         description: "Who is being so fuckin' true right now?",
    //         required: false
    //     }]
    // }
];
