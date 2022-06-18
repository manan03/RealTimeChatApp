const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io(); 

//Get username and room from url 
const {username,room} = Qs.parse(location.search, {
    //ignoring unnecessary & in the username
    ignoreQueryPrefix: true
});
 
//ANOTHER WAY TO GET INFO FROM URL
// var currentUrl = window.location.href;
// let params = (new URL(currentUrl)).searchParams;
// var name = params.get('username') 
// var roomings = params.get('room')  

  console.log(username,room);


//JOIN CHATROOM
socket.emit('joinRoom',{username,room});

//Get room and users
socket.on('roomUsers',({room,users}) =>{
    outputRoomName(room);
    outputUsers(users);
});
//Message from server
socket.on('message',message=>{
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message Submit
chatForm.addEventListener('submit',(e)=>{
    //when you submit a form it automatically saves to a file.
    //we have to prevent this by using the default 
    e.preventDefault();

    //GETTING MESSAGE TEXT 
    const msg = e.target.elements.msg.value;
    // console.log(msg);
    //EMITING A MESSAGE TO THE SERVER
    socket.emit('chatMessage',msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output message to dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
         ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to dom 
function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
