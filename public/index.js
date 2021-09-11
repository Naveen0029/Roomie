const socket=io();

const name=document.getElementById('input_name');
const inputBtn2=document.getElementById('input_btn2');
const createRoom=document.getElementById('createroom');
const joinRoom=document.getElementById('joinroom');
const inputBtn1=document.getElementById('input_btn1');
const nameBar=document.getElementById('name_bar');
const addName=document.getElementById('add_names');

inputBtn1.addEventListener('click',(e)=>{
    let nam=name.value;
    name.value="";
    var crRoom=createRoom.value;
    createRoom.value="";
    socket.emit('new-user-joined',nam,crRoom);
    nameBar.style.display='none';
   
})
inputBtn2.addEventListener('click',(e)=>{
    const nam=name.value;
    name.value="";
    var joinR=joinRoom.value;
    joinRoom.value="";
    socket.emit('add-user',nam,joinR);
    nameBar.style.display='none';
 

});
const append=(name)=>{
    let ele=document.createElement('p');
    ele.innerText=name;
    addName.appendChild(ele);
   
}

const erase=()=>{
    
  while (addName.firstChild) {
  addName.removeChild(addName.firstChild);
   }
}

const eraseName=(name)=>{
    let i;
    for(i=0;i<addName.childElementCount;i++){
        if(name===addName.children[i].textContent)break;
    }
    addName.removeChild(addName.children[i]);
    
}
socket.on('user-joined',(users)=>{
    erase();
    for(let name of users){
        append(name);
    }
})

socket.on('leave',(name)=>{
    console.log(name+" leaved the server");
     eraseName(name);
})
