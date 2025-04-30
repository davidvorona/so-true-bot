const blacklist = [
    "vijuhas",
    "david",
    "vorona"
];

export default class DiscordSecurityAgency {
    blacklist: string[];

    ownerId: string;
 
    constructor(ownerId: string) {
        this.blacklist = blacklist;
        this.ownerId = ownerId;
        console.log("Discord Security Agency is online...");
    }

    check(message: string) {
        let flagged = false;
        this.blacklist.forEach((token) => {
            if (message.includes(token)) {
                flagged = true;
            }
        });
        return flagged;
    }

    prepareUserMessageData(messages: { channelId: string; attachmentCount: number; embedCount: number; content: string; createdAt: Date; }[]) {
        const userData = {
            attachmentCount: 0,
            embedCount: 0,
            messageCount: 0,
            earliestMessageDate: new Date(),
            mostUsedWord: ["", 0],
            mostMessagedChannel: ["", 0],
            ownerMentionCount: 0
        };
        const tokens: string[] = [];
        const channelCounts: Record<string, number> = {};
        messages.forEach((message, idx) => {
            const { content, attachmentCount, embedCount, createdAt, channelId } = message;
            if (idx === 0) {
                userData.earliestMessageDate = new Date(createdAt);
            }
            if (content) {
                tokens.push(...content.split(" "));
            }
            if (!channelCounts[channelId]) {
                channelCounts[channelId] = 0;
            }
            channelCounts[channelId] += 1;
            userData.attachmentCount += attachmentCount;
            userData.embedCount += embedCount;
            userData.messageCount += 1;
        });
        const sortedChannels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);
        userData.mostMessagedChannel = sortedChannels[0];
        const tokenBlacklist: string[] = ["a", "the", "and", "is", "to", "of", "in", "for", "on", "with", "as", "by", "at", "this", "that", "it", "an", "are"];
        const tokenCounts: Record<string, number> = {};
        tokens.forEach((token) => {
            if (tokenBlacklist.includes(token)) {
                return;
            }
            if (!tokenCounts[token]) {
                tokenCounts[token] = 0;
            }
            if (token === `<@${this.ownerId}>`) {
                userData.ownerMentionCount += 1;
            }
            tokenCounts[token] += 1;
        });
        const sortedTokens = Object.entries(tokenCounts).sort((a, b) => b[1] - a[1]);
        userData.mostUsedWord = sortedTokens[0];
        return userData;
    }
}
