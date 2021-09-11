
const express=require('express');
var app=express();
const PORT = process.env.PORT || 3000;
const socketIO=require('socket.io');

var path=require('path');
var bodyParser = require('body-parser');
const { copyFileSync } = require('fs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
    res.sendfile(__dirname+'/index.html');
})

var server=app.listen(PORT,()=>{

    console.log(`Listening on ${PORT}`);
})




//Node server which will handle socket io connections
const io= socketIO(server);

const users = {};
var rooms=[];

//whena a new user joins
io.on('connection',socket=>{
    var findLen=(clients)=>{
        var res=0;
        if(clients==undefined)return res;
        for(let clientId of clients)res++;

        return res;
    }

    var getNames=(clients)=>{
        let allNames=[];
        for(let clientId of clients){
            allNames.push(users[clientId]);
      }
      return allNames;
    }
    socket.on('new-user-joined',(name,room)=>{
        console.log("hey there");
        users[socket.id] = name;
        socket.join(room);
        rooms.push(room);
        const clients = io.sockets.adapter.rooms.get(room);//clients contain socket.id
        
        var allnames=getNames(clients);
        io.in(room).emit('user-joined',allnames);//send the msg to all connected to this room

    })

    socket.on('add-user',(name,room)=>{
        users[socket.id] = name;
        socket.join(room);
        const clients = io.sockets.adapter.rooms.get(room);//clients contain socket.id

        var allnames=getNames(clients);//get all the names of user in the room
        
        io.in(room).emit('user-joined',allnames);//send the msg to all connected to this room

    })
    
    //when a user leave let the other know
    socket.on('disconnecting',message=>{
        
        var myRoom;
        for(let i=0;i<rooms.length;i++){//for finding the room of the user
            const clients = io.sockets.adapter.rooms.get(rooms[i]);
            if(clients==undefined)continue;

            let result=findLen(clients);//how many socket.id we have in particular room
            var flag=false;
            for(let clientId of clients){
                if(clientId==socket.id){
                    myRoom=rooms[i];
                    flag=true;
                    if(result==1)rooms.splice(i,1);//when only 1 person is available and he is also leaving
                                                   //it means the room is going to empty so we have to remove 
                                                   //that room from rooms array
                    break;
                }
            }
            if(flag)break;
        }
        io.in(myRoom).emit('leave',users[socket.id]);
        socket.leave(socket.room);   
        delete users[socket.id];  
          
    })

    
    
})