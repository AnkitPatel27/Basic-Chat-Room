const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersinRoom} = require("./utils/user");
const { error } = require("console");

//starting the express server
const app = express();
const server = http.createServer(app);
const  io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));


io.on("connection",(socket)=> {

    socket.on("join",(userinfo,callback)=>{
        const {error,user} = addUser({id: socket.id,username:userinfo.username,room:userinfo.room});
        if(error)
        {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message",generateMessage(`Welcome! ${user.username}`,'Admin'));
        io.to(user.room).emit("roomData", user.room,getUsersinRoom(user.room))
        socket.broadcast.to(user.room).emit("message",generateMessage(`A ${user.username}has joined`));
    })

     
    socket.on("inputmessage",(message,callback)=> {
        const filter = new Filter();
        const user = getUser(socket.id);

        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit("message",generateMessage(message,user.username));
        callback();
    })

    socket.on("sendlocation",(coords,callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("sendlocationmessages",generateMessage(`https://google.com/maps?q${coords.latitude},${coords.longitude}`,user.username));
        callback();
    })

    socket.on("disconnect",()=>{
        const user = removeUser(socket.id);
        if(user)
        {
            io.to(user.room).emit("message",generateMessage(`A ${user.username} has Left!`));
            io.to(user.room).emit("roomData", user.room,getUsersinRoom(user.room))
        }
    })
})

server.listen(port,() => {
    console.log(`Starting the app at the port ${port}`)
})

