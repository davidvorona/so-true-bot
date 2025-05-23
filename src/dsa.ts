const blacklist = [
    "vijuhas",
    "david",
    "vorona"
];

const tokenBlacklist: string[] = ["a", "the", "and", "is", "to", "of", "in", "for", "on", "with", "as", "by", "at", "this", "that", "it", "an", "are", "i", "you", "he", "she", "we", "they", "them", "my", "your", "his", "her", "its", "our", "their", "there", "where", "when", "why", "how", "what", "who", "which", "up", "down", "left", "right", "here", "there", "now", "then", "so", "but", "or", "if", "not", "no", "yes", "maybe", "like", "just", "really", "very", "be", "have", "has", "had", "do", "does", "did", "doing", "go", "goes", "went", "going", "come", "comes", "came", "coming", "see", "sees", "saw", "seeing", "say", "says", "said", "tell", "tells", "told", "think", "thinks", "thought", "me", "im", "get", "out", "was", "need"];


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
                const messageTkns = content.split(" ");
                tokens.push(...messageTkns.filter(t => t.length > 0));
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
        const tokenCounts: Record<string, number> = {};
        tokens.forEach((token) => {
            const tkn = token.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
            if (!tkn || tokenBlacklist.includes(tkn)) {
                return;
            }
            if (!tokenCounts[tkn]) {
                tokenCounts[tkn] = 0;
            }
            if (token === `<@${this.ownerId}>`) {
                userData.ownerMentionCount += 1;
            }
            tokenCounts[tkn] += 1;
        });
        const sortedTokens = Object.entries(tokenCounts).sort((a, b) => b[1] - a[1]);
        userData.mostUsedWord = sortedTokens[0];
        return userData;
    }

    prepareChannelMessageData(messages: { userId: string; attachmentCount: number; embedCount: number; content: string; createdAt: Date; }[]) {
        const channelData = {
            attachmentCount: 0,
            embedCount: 0,
            messageCount: 0,
            earliestMessageDate: new Date(),
            mostUsedWord: ["", 0],
            mostMessagedUser: ["", 0],
            ownerMentionCount: 0
        };
        const tokens: string[] = [];
        const userCounts: Record<string, number> = {};
        messages.forEach((message, idx) => {
            const { content, attachmentCount, embedCount, createdAt, userId } = message;
            if (idx === 0) {
                channelData.earliestMessageDate = new Date(createdAt);
            }
            if (content) {
                const messageTkns = content.split(" ");
                tokens.push(...messageTkns.filter(t => t.length > 0));
            }
            if (!userCounts[userId]) {
                userCounts[userId] = 0;
            }
            userCounts[userId] += 1;
            channelData.attachmentCount += attachmentCount;
            channelData.embedCount += embedCount;
            channelData.messageCount += 1;
        });
        const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
        channelData.mostMessagedUser = sortedUsers[0];
        const tokenCounts: Record<string, number> = {};
        tokens.forEach((token) => {
            const tkn = token.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
            if (!tkn || tokenBlacklist.includes(tkn)) {
                return;
            }
            if (!tokenCounts[tkn]) {
                tokenCounts[tkn] = 0;
            }
            if (token === `<@${this.ownerId}>`) {
                channelData.ownerMentionCount += 1;
            }
            tokenCounts[tkn] += 1;
        });
        const sortedTokens = Object.entries(tokenCounts).sort((a, b) => b[1] - a[1]);
        channelData.mostUsedWord = sortedTokens[0];
        return channelData;
    }
}
