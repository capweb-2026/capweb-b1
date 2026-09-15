export function validateMessage(raw) {
    if (typeof raw === 'string') {
        const text = raw.trim();
        if (text.length > 0 && text.length <= 280) {
            return { ok: true, value: text };
        }
    }
    return { ok: false, error: 'Le message n\'est pas conforme.'};
}

export function replyTo(message) {
    const processedMessage = message.toLowerCase().trim();
    let reponse;
    switch (processedMessage) {
        case 'salut':
        case 'bonjour': reponse = 'Bonjour, je suis Cuity, votre bot cuisine anti-gaspi ! ';
            break;
        case 'aide': reponse = 'Vous pouvez utiliser les mots suivants : bonjour, salut, aide, test';
            break;
        case 'test': reponse = 'Ceci est un test';
            break;
        default:
            reponse = 'Je ne connais pas ce mot. Ecrivez aide si vous êtes perdu';
    }
    return reponse;
}