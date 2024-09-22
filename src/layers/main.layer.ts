import { BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"
import { flowGuide } from "../flows/guide.flow"

const PROMPT_DISCRIMINATOR = `### Historial de Conversación (Vendedor/Cliente) ###
{HISTORY}

### Intenciones del Usuario ###

**HABLAR**: Selecciona esta acción si el cliente todavia no ha dado toda la informacion sobre las tareas que quiere automatizar.
**PROGRAMAR**: Selecciona esta acción unicamente cuando el cliente determine la hora y fecha para programar una cita.

IMPORTANTE, SOLO SELECCIONAR **PROGRAMAR** CUANDO SE DETERMINE LA HORA Y FECHA.

### Instrucciones ###

Por favor, analiza la siguiente conversación y determina la intención del usuario.`

export default async (ctx: BotContext, { state, gotoFlow, extensions}: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const prompt = PROMPT_DISCRIMINATOR.replace('{HISTORY}', history)

    const currentMessage = ctx.body; // Este es el mensaje actual enviado por el usuario

    if (currentMessage.toLowerCase().includes('guia')) { // Proveedor de mensajería
        return gotoFlow(flowGuide);
    }
    
    const { prediction } = await ai.determineChatFn([
        {
            role: 'system',
            content: prompt
        }
    ])

    if (prediction.includes('HABLAR')) return gotoFlow(flowSeller)
    if (prediction.includes('PROGRAMAR')) return gotoFlow(flowSchedule)
}