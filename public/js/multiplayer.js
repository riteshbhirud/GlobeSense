const socket = io("http://127.0.0.1:5550");

const urlParams = new URL(window.location.href);
let inviteCode = urlParams.pathname.split('/').pop()
console.log("Invite Code", inviteCode)
socket.emit("joinRoom", { inviteCode: inviteCode });

async function getUsername() {
  return new Promise((resolve) => {
    socket.on("get-username", (username) => {
      socket.username = username;
      console.log("USERNAME FROM ON", username);
      console.log("USERNAME FROM ON", socket.username);
      resolve(username); // Resolve the promise with the username
    });
  });
}

(async () => {
  const username = await getUsername(); // Wait for the username to be resolved
  console.log("OUTSIDE", username);

  // Ensure the alert is executed after username is fetched
  alert(`${socket.username} has joined room ${inviteCode}`);
})();

const playerListDiv = document.getElementById("playerList");
const disconnectForm = document.getElementById("disconnectForm")




/*fetch(`/join/${inviteCode}`)
    .then((response) => response.json())
    .then((data) => {
        console.log('Username:', data.username);
        window.location.href = data.redirect; // Redirect to the file
    });


async function fetchUsername(){
  try{
      const response = await fetch(`/join/${inviteCode}`);
      const data = await response.json();
      username = data.username;
      
  }catch(error){
      console.error("Cannot get username")
  }
}*/


/*async function fetchInviteCode(){
    try{
        const response = await fetch(`/join/${gameId}`);
        const data = await response.json();
        inviteCode = data.gameId;
        
    }catch(error){
        console.error("Cannot get gameId")
    }
}*/


socket.on("updatePlayerList", (players) => {

  console.log( players)
  
  playerListDiv.innerHTML = Array.from(Object.keys(players)).map((player) => `<p>${player}</p>`).join("");
});

socket.on("errorMessage", (message) => {
  alert(message);
});

/*disconnectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("manualDisconnect");

  socket.on("updatePlayerList", (players) => {
    playerListDiv.innerHTML = players.map((player) => `<p>${player}</p>`).join("");
  });
  
  socket.on("errorMessage", (message) => {
    alert(message);
  });
})*/
