
document.getElementById("signin").addEventListener("submit", async(event)=>{
    event.preventDefault();
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    //console.log(JSON.stringify({"q", "q", "q"}))

    const response = await fetch('/api/users/login',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({username, password})
    });
    const data = await response.json();
    if(response.ok){
        
        window.location.href = "/"
        
    }else{
        alert(data.msg || "Error")
    }
    
    
})