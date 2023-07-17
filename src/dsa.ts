const blacklist = [
    "vijuhas",
    "david",
    "vorona"
];

export default class DiscordSecurityAgency {
    blacklist: string[];
 
    constructor() {
        this.blacklist = blacklist;
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
}
