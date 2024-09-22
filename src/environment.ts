import * as dotenv from "dotenv";
import { join } from "node:path";

const envFilePath = join(process.cwd(), ".env");
dotenv.config({ path: envFilePath });

function processEnvironment() {
    const rawVars = {
        JWTOKEN: process.env.JWTOKEN,
        NUMBER_ID: process.env.NUMBER_ID,
        VERIFY_TOKEN: process.env.VERIFY_TOKEN,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        OPENAI_USER_TOKEN_LIMIT: process.env.OPENAI_USER_TOKEN_LIMIT,
        OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID,
        PORT: process.env.PORT,
        ACC_SID: process.env.ACC_SID,
        ACC_TOKEN: process.env.ACC_TOKEN,
        ACC_VENDOR: process.env.ACC_VENDOR
    };
    
    for (let key in rawVars) {
        if (rawVars[key] == undefined)
            throw new Error(`[.env] ${key} is not defined`);
    }

    return rawVars;
}

const env = processEnvironment();

export default env;