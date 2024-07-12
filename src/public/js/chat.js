const socket = io(); 
let user; 
const chatBox = document.getElementById("chatBox");
const sendButton = document.getElementById("sendButton");

socket.on('connect', () => {
    console.log('Conectado al servidor de sockets');
});

Swal.fire({
    title: "Identificate", 
    input: "text",
    text: "Ingresa un usuario para identificarte en el chat", 
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre para continuar";
    }, 
    allowOutsideClick: false,
}).then(result => {
    user = result.value;
});

function sendMessage() {
    if(chatBox.value.trim().length > 0) {
        socket.emit("message", {user: user, message: chatBox.value.trim()}); 
        chatBox.value = "";
    }
}

chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        sendMessage();
    }
});

sendButton.addEventListener("click", () => {
    sendMessage();
});

socket.on("message", data => {
    let log = document.getElementById("messagesLogs");
    let messages = "";

    data.forEach(message => {
        messages += `${message.user} dice: ${message.message} <br>`;
    });

    log.innerHTML = messages;
});
log