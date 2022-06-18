const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express(); 
const server = http.createServer(app);  
const io = socketio(server);
const botname = 'HeyO bot'
// Set static folder
app.use(express.static(path.join(__dirname,'public')));
 
//RUN WHEN CLIENT CONNECTS
io.on('connection',socket => {
     
    socket.on('joinRoom',({username,room})=>{
        //socket.id = Each new connection is assigned a random 20-characters identifier.
        const user = userJoin(socket.id,username,room);
        
        socket.join(user.room);
         
        //welcome current user //message is a buit in event
        socket.emit('message',formatMessage(botname,'Welcome to HeyO!'));

        //BROADCAST WHEN A USER CONNECT
        socket.broadcast.to(user.room).emit('message', formatMessage( botname,`${user.username} joined the chat`));
    
         //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    
        });  

        console.log('New Websocket connection.');

        // LISTENING FOR CHAT MESSAGE
        socket.on('chatMessage',(msg)=>{
            const user = getCurrentUser(socket.id);

            io.to(user.room).emit('message', formatMessage(user.username,msg));
        });

        // RUNS WHEN CLIENT disconnect
        socket.on('disconnect',()=>{
             
            const user = userLeave(socket.id);
            if(user){
                io.to(user.room).emit('message',formatMessage( botname,`${user.username} has left the chat`) );
            }
            //Send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT,()=> console.log(`Running on port ${PORT}`)); 