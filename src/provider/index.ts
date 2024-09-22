import pkg from '@bot-whatsapp/bot';
import { MetaProvider } from '@builderbot/provider-meta'
import { BaileysProvider } from '@builderbot/provider-baileys'
import env from "../environment";
const { createProvider } = pkg;

// export const provider = createProvider(MetaProvider, {
//     jwtToken: env.JWTOKEN, //EAARBW3ZBGU0UBAACDjtQIzI8JuEa.............
//     numberId: env.NUMBER_ID, //103975305758520
//     verifyToken: env.VERIFY_TOKEN, //LO_QUE_SEA,
//     version: "v19.0",
// });

export const provider = createProvider(BaileysProvider);

// export const twilioProvider = createProvider(MetaProvider, {
//     accountSid: env.ACC_SID, //EAARBW3ZBGU0UBAACDjtQIzI8JuEa.............
//     authToken: env.ACC_TOKEN, //103975305758520
//     vendorNumber: env.ACC_VENDOR
// });

