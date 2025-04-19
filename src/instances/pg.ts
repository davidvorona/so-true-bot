import { parseJson, readFile } from "../util";
import PGStorageClient from "../pg";
import { AuthJson } from "../types";

const { PG } = parseJson(readFile("../config/auth.json")) as AuthJson;

export default new PGStorageClient(PG);
