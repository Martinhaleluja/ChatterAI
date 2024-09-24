document.addEventListener("DOMContentLoaded", function () {
    const toggler = document.querySelector(".ChatterAI-toggler");
    const chatboxElement = document.querySelector(".ChatterAI");
    const closeBtn = document.querySelector(".ChatterAI header span");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const chatbox = document.querySelector(".chatbox");

    const createChatLi = (message, className, isLoader = false) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        
        if (isLoader) {
            chatLi.innerHTML = `<div class="loader"></div>`;
        } else {
            const chatContent = className === "outgoing"
                ? `<p>${message}</p>`
                : `<span class="material_symbol-outlined">AI</span><p>${message}</p>`;
            chatLi.innerHTML = chatContent;
        }

        return chatLi;
    };

    const generateResponse = (userMessage) => {
        const loaderChatLi = createChatLi("", "incoming", true);
        chatbox.appendChild(loaderChatLi);

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: userMessage })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            const aiMessage = data.response;
            const aiChatLi = createChatLi(aiMessage, "incoming");
            chatbox.replaceChild(aiChatLi, loaderChatLi);
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessage = "An error occurred while fetching the response: " + error.message;
            const errorChatLi = createChatLi(errorMessage, "incoming");
            chatbox.replaceChild(errorChatLi, loaderChatLi);
        });
    };

    toggler.addEventListener("click", function () {
        document.body.classList.toggle("show-ChatterAI");
        toggler.style.display = "none"; // Hide the toggler button
    });

    closeBtn.addEventListener("click", function () {
        document.body.classList.remove("show-ChatterAI");
        toggler.style.display = "flex"; // Show the toggler button
    });

    sendChatBtn.addEventListener("click", function () {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            const userChatLi = createChatLi(userMessage, "outgoing");
            chatbox.appendChild(userChatLi);
            chatInput.value = "";
            generateResponse(userMessage);
        }
    });

    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                const userChatLi = createChatLi(userMessage, "outgoing");
                chatbox.appendChild(userChatLi);
                chatInput.value = "";
                generateResponse(userMessage);
            }
        }
    });
});
