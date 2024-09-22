import { EVENTS, addKeyword } from "@builderbot/bot";

const flowGuide = addKeyword('guia')
    .addAnswer("Enhorabuena, eres uno de los pocos afortunados que tiene esta guia.")
    .addAnswer("Disfrutala!!!", {
        media: './src/pdf/GUIA.pdf'
    })

export { flowGuide }