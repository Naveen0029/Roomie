
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
var details={};

//whena a new user joins
io.on('connection',socket=>{
    var findLen=(clients)=>{// find the no of users joined
        var res=0;
        if(clients==undefined)return res;
        for(let clientId of clients)res++;

        return res;
    }

    var getNames=(clients)=>{//all the user of this room
        
        let allNames=[];
        if(clients==undefined)return allNames;
        for(let clientId of clients){
            allNames.push(users[clientId]);
      }
      return allNames;
    }

    var getMyRoom=(leaves)=>{
        let myRoom;
        for(let i=0;i<rooms.length;i++){//for finding the room of the user
            const clients = io.sockets.adapter.rooms.get(rooms[i]);
            if(clients==undefined)continue;

            let result=findLen(clients);//how many socket.id we have in particular room
            var flag=false;
            for(let clientId of clients){
                if(clientId==socket.id){
                    myRoom=rooms[i];
                    flag=true;
                    if(result==1&&leaves)rooms.splice(i,1);//when only 1 person is available and he is also leaving
                                                   //it means the room is going to empty so we have to remove 
                                                   //that room from rooms array
                    break;
                }
            }
            if(flag)break;
        }
        return myRoom;
    }
    socket.on('new-user-joined',(name,room)=>{
       
        users[socket.id] = name;
        socket.join(room);
        rooms.push(room);
        const clients = io.sockets.adapter.rooms.get(room);//clients contain socket.id
        
     
        if(details[room]==undefined){
            details[room]=[];
        }
     
        var allnames=getNames(clients);
        io.in(room).emit('user-joined',name,allnames,details[room]);//send the msg to all connected to this room

    })

    socket.on('add-user',(name,room)=>{
       
        users[socket.id] = name;
        socket.join(room);
        const clients = io.sockets.adapter.rooms.get(room);//clients contain socket.id
        
     
        if(details[room]==undefined){
            details[room]=[];
        }
        
        var allnames=getNames(clients);//get all the names of user in the room
        
        io.in(room).emit('user-joined',name,allnames,details[room]);//send the msg to all connected to this room
        
        

    })
    
    //when a user leave let the other know
    socket.on('disconnecting',message=>{
        
        let myRoom=getMyRoom(true);
        const clients = io.sockets.adapter.rooms.get(myRoom);
        if(findLen(clients)<=1){
            delete details[myRoom];
        }
        io.in(myRoom).emit('leave',users[socket.id]);
        socket.leave(socket.room);   
        delete users[socket.id];  
          
    })
    //when a use buy some stuff then he wanted to add his detail at server
    socket.on('user-detail',Info=>{
        
        
        let myRoom=getMyRoom(false);
        if(details[myRoom]==undefined){
            details[myRoom]=[];
        }
        
        details[myRoom].push(Info);
        socket.to(myRoom).emit('someone-paid',Info);
    })
    
    //when a user want to see that he is not out of budget.
    socket.on('fetch-transactions',()=>{
       
        let myRoom=getMyRoom();
        const clients = io.sockets.adapter.rooms.get(myRoom);
        var allnames=getNames(clients);
        if(details[myRoom]==undefined){
            details[myRoom]=[];
        }
        io.to(socket.id).emit('get-transactions',details[myRoom],allnames);//sending allnames of the 
                                                                    //user joined the room because
                                                                    // may be someone not pays money
                                                                    //and details of who have paid
    })


        //when a user send the message let the other to know that someone sends the msg
        socket.on('send',message=>{
            let myRoom=getMyRoom();
            socket.to(myRoom).emit('recieve',{message:message,name:users[socket.id]});//send the msg to all connected
                                                                               // in chat-box   
        })

        socket.on('check',(room,name,CreorJoin,fn)=>{//before entring user checks if the room already exists or not
             
            if(CreorJoin&&rooms.indexOf(room)!=-1){// when user creating new Room
                 fn({result:true,msg:'Room is already created'});
             }
             else if(!CreorJoin&&rooms.indexOf(room)==-1){//when user joining Room
                 fn({result:true,msg:'Room not available'});
             }
             else{
                const clients = io.sockets.adapter.rooms.get(room);//clients contain socket.id
        
                var allnames=getNames(clients);
                 if(allnames.indexOf(name)!=-1){//check with same name user available or not
                     fn({result:true,msg:'Already a user available'});
                 }
                 else fn({result:false,msg:'Everything is Perfect'});
             }
        })
    
    
})
