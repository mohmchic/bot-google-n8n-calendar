import 'dotenv/config'
import { createBot, MemoryDB } from '@builderbot/bot';
import AIClass from './services/ai';
import flow from './flows';
import { provider } from './provider';

const PORT = process.env.PORT ?? 3001
const ai = new AIClass(process.env.OPENAI_API_KEY, 'gpt-4o')

const main = async () => {
    const { httpServer, handleCtx } = await createBot({
        database: new MemoryDB(),
        provider,
        flow,
    }, { extensions: { ai } })

    provider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    provider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )


    provider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    // Iniciar una conversación con nuevo lead
    provider.server.post(
        '/start-conversation',
        handleCtx(async (bot, req, res) => {
            const { name, telefono, industria, producto } = req.body;
            
            const firstName = name.split(' ')[0];
            const numeroSinMas = telefono.toString().replace(/^\+/, '');
            
            const message = `Buenas ${firstName} 👋, gracias por probar nuestro asistente de ventas.\n\nMe presento, soy la secretarIA de Mohamed. Actúa como si fueses un potencial cliente de tu servicio/producto.\n IMPORTANTE: Responde 1 mensaje por pregunta. \n\nPara comenzar responde la palabra "empezar".`;

            try {
                await bot.sendMessage(numeroSinMas, message, { media: null });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ status: 'message sent', telefono, message }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ status: 'error', message: error.message }));
            }
        })
    );

    httpServer(+PORT)
}
main()
