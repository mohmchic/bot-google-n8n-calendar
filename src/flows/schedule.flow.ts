import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { flowConfirm } from "./confirm.flow";
import { addMinutes, isWithinInterval, format, parse } from "date-fns";

const DURATION_MEET = process.env.DURATION_MEET ?? 45

const HOURS_ALLOWED = [
    { start: "09:00", end: "20:00" }
];

const PROMPT_FILTER_DATE = `
### Contexto
Eres un asistente de inteligencia artificial. Tu propósito es determinar la fecha y hora que el cliente quiere, en el formato yyyy/MM/dd HH:mm:ss.

### Fecha y Hora Actual:
{CURRENT_DAY}

### Registro de Conversación:
{HISTORY}

Asistente: "{respuesta en formato (yyyy/MM/dd HH:mm:ss)}"
`;

const isInAllowedHours = (date) => {
    const hour = format(date, 'HH:mm');
    return HOURS_ALLOWED.some(({ start, end }) => hour >= start && hour <= end);
};

const generatePromptFilter = (history: string) => {
    const nowDate = getFullCurrentDate();
    const mainPrompt = PROMPT_FILTER_DATE
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate);

    return mainPrompt;
}

const flowSchedule = addKeyword(EVENTS.ACTION)
    .addAction(async ({ body }, { extensions, state, flowDynamic, endFlow }) => {
        await flowDynamic('Dame un momento para consultar la agenda...');
        const ai = extensions.ai as AIClass;
        const history = getHistoryParse(state);
        const list = await getCurrentCalendar()

        const listParse = list
            .map(({ start, end }) => ({ fromDate: new Date(start), toDate: new Date(end) }));

        // console.log({ listParse })

        const promptFilter = generatePromptFilter(history);

        const { date } = await ai.desiredDateFn([
            {
                role: 'system',
                content: promptFilter
            }
        ]);

        console.log(date);
        const desiredDate = parse(date, 'yyyy/MM/dd HH:mm:ss', new Date());

        // Verifica si la fecha deseada está dentro del horario permitido y no choca con otros eventos
        const isDateAvailable = listParse.every(({ fromDate, toDate }) =>
            !isWithinInterval(desiredDate, { start: fromDate, end: toDate })
        ) && isInAllowedHours(desiredDate);

        if (!isDateAvailable) {
            const m = 'Lo siento, esa hora ya está reservada o fuera del horario permitido . ¿Alguna otra fecha y hora?';
            await flowDynamic(m);
            await handleHistory({ content: m, role: 'assistant' }, state);
            return endFlow();
        }

        const formattedDateFrom = format(desiredDate, 'hh:mm a');
        const formattedDateTo = format(addMinutes(desiredDate, +DURATION_MEET), 'hh:mm a');
        const message = `¡Perfecto! Tenemos disponibilidad de ${formattedDateFrom} a ${formattedDateTo} el día ${format(desiredDate, 'dd/MM/yyyy')}. ¿Confirmo tu reserva?`;
        await handleHistory({ content: message, role: 'assistant' }, state);
        await state.update({ desiredDate })

        const chunks = message.split(/(?<!\d)\.\s+/g);
        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }
    }).addAction({ capture: true }, async ({ body }, { gotoFlow, flowDynamic, state }) => {

        const confirmationWords = ['si', 'sí', 'confirmar', 'confirmo', 'ok', 'vale'];

        if (confirmationWords.some(word => body.toLowerCase().includes(word))) {
            return gotoFlow(flowConfirm);
        }

        await flowDynamic('¿Alguna otra fecha y hora?')
        await state.update({ desiredDate: null })
    })

export { flowSchedule }