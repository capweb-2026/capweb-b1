export function renderMessages(messages, container){
    const lignes = [];
    for(const i in messages){
        const message = messages[i];
        const li = document.createElement('li');
        if (message.role === 'user') {
            li.textContent = 'Vous: ' + message.text;
        } else {
            li.textContent = message.text;
        }
        lignes.push(li);
    }
    container.replaceChildren(...lignes);
}