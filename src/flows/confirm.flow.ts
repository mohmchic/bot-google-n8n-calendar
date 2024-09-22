import { PUBLIC_URL } from 'src/config';
import { addKeyword, EVENTS } from "@builderbot/bot";
import { clearHistory, getHistoryParse } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { addMinutes, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { appToCalendar } from "src/services/calendar";

const DURATION_MEET = process.env.DURATION_MEET ?? 45
const TIME_ZONE = process.env.TZ
/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ahora te pedire unos datos para agendar la reunion')
    await flowDynamic('Para cancelar escribe *cancelar*')
    await flowDynamic('¿Cual es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {

    if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
        clearHistory(state)
        return endFlow(`¿Como puedo ayudarte?`)

    }
    await state.update({ name: ctx.body })
    
    await flowDynamic(`¿Cual es tu email?`)
})
    .addAction({ capture: true }, async (ctx, {extensions, state, flowDynamic, fallBack, blacklist }) => {
        const ai = extensions.ai as AIClass;

        if (!ctx.body.includes('@')) {
            return fallBack(`Debes ingresar un mail correcto`)
        }

        const dateObject = {
            name: state.get('name'),
            email: ctx.body,
            startDate: utcToZonedTime(state.get('desiredDate'), TIME_ZONE),
            endData: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from,
            description: getHistoryParse(state)
        }

        await appToCalendar(dateObject)

        clearHistory(state)
        blacklist.add(ctx.from)
        await flowDynamic('Listo! agendado, que tenga un buen dia.')
    })

export { flowConfirm }