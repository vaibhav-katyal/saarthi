const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const messages = input.value
    socket.emit('chat message', messages)

    if(input.value){
        socket.emit('user', input.value)

    }
    input.value = ''
    socket.on('user', (messages)=>{
        
    })

})