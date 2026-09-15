export function renderMessages(messages, container){
    const lignes = [];
    for(const i in messages){
        const message = messages[i];
        const user = message.role === 'user'?'Vous: ':'Cuity: ';
        const li = document.createElement('li');
        li.textContent = user + message.text;
        lignes.push(li);
    }
    container.replaceChildren(...lignes);
}