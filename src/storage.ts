import fs from "fs";
import { ConfigJson } from "./types";
import { readFile, parseJson } from "./util";

const { DATA_DIR } = parseJson(readFile("../config/config.json")) as ConfigJson;

class Storage {
    static validateDataDir(path: string) {
        const exists = fs.existsSync(path);
        if (!exists) {
            console.error("Cannot start bot without data directory, aborting");
            throw new Error("No data directory");
        }
    }

    dataDir: string = DATA_DIR;

    filePath: string;

    constructor(fileName: string, overridePath?: boolean) {
        this.filePath = overridePath ? fileName : `${this.dataDir}/${fileName}`;
        const fileExists = fs.existsSync(this.filePath);
        if (!fileExists) {
            fs.openSync(this.filePath, "a");
            console.log(`File ${this.filePath} created`);
        }
    }

    read(): string[] {
        let data;
        try {
            const dataStr = fs.readFileSync(this.filePath, "utf-8");
            data = parseJson(dataStr);
            console.log(`${this.filePath} loaded`);
        } catch (err) {
            console.error(err);
            data = [];
        }
        return data;
    }

    write(data: string[]) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data));
            console.log(`${this.filePath} written`);
        } catch(err) {
            console.error(err);
        }
    }

    add(string: string) {
        const data = this.read();
        data.push(string);
        this.write(data);
    }
}

export default Storage;
