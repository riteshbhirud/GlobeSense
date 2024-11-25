const createGameButton = document.getElementById("createSession");
const joinGameForm = document.getElementById("joinForm")
const inviteCodeInput = document.getElementById("inviteCodeInput");
const inviteCodeParagraph = document.getElementById('inviteCode')

if (createGameButton) {
    createGameButton.addEventListener("click", async (e) => {

        const response = await fetch("/api/sessions/create", { method: "POST" });
        const data = await response.json();
      
      
        
        if (data.success) {
            console.log(data);
            inviteCodeParagraph.innerText = `Invite Code: ${data.inviteCode}`;
            //window.location.href = `http://localhost:5550/join/${data.inviteCode}`
            window.location.href = `https://globesense.tech/join/${data.inviteCode}`

        } else {
            alert("Failed to create session");
        }
    })
}

if (joinGameForm) {
    joinGameForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inviteCode = inviteCodeInput.value.trim();
        //window.location.href = `http://localhost:5550/join/${inviteCode}`
        window.location.href = `https://globesense.tech/join/${inviteCode}`

    })
}

