const socket=io();
import {details} from './detail.js';
import {myHeap} from './heap.js';
import {payments} from './payments.js';

const name=document.getElementById('input_name');
const inputBtn2=document.getElementById('input_btn2');
const createRoom=document.getElementById('createroom');
const joinRoom=document.getElementById('joinroom');
const inputBtn1=document.getElementById('input_btn1');
const nameBar=document.getElementById('name_bar');
const addName=document.getElementById('add_names');
const dropdownnames=document.querySelector('#inlineFormSelectPref1');
const addbtn=document.getElementById('get_details_button2');
const detDescription=document.getElementById('detail_description');
const addedamountDetails=document.getElementById('added_amount');
const payer_Name=document.getElementById('payer__name');
const description_=document.getElementById('description');
const amount_=document.getElementById('amount__detail');
const MainBlock=document.getElementById('name_people');
const TransactionBlock=document.getElementById('who_pay');
const SfDbtn=document.getElementById('simply_details_button');
const simpyfyBlock=document.getElementById('simplified_details');
const chatBox=document.getElementById('chat_box');
const simplyPayer=document.getElementById('simply_payer');
const simplyPayee=document.getElementById('simply_payee');
const simplyAmount=document.getElementById('simply_amount_detail');
const sendbtn=document.getElementById('sendbtn');
const messageInput=document.getElementById('messageInput');
const sendCont=document.getElementById('send-container');



inputBtn1.addEventListener('click',(e)=>{//for creating room
    let nam=name.value;
    name.value="";
    var crRoom=createRoom.value;
    createRoom.value="";
    socket.emit('new-user-joined',nam,crRoom);
    nameBar.style.display='none';
    MainBlock.style.display='block';
    TransactionBlock.style.display='block';
    chatBox.style.display='block';
   
})
inputBtn2.addEventListener('click',(e)=>{//for joining room
    const nam=name.value;
    name.value="";
    var joinR=joinRoom.value;
    joinRoom.value="";
    socket.emit('add-user',nam,joinR);
    nameBar.style.display='none';
    MainBlock.style.display='block';
    TransactionBlock.style.display='block';
    chatBox.style.display='block';
});

addbtn.addEventListener('click',(e)=>{//for adding the details in ui
    let x=dropdownnames.options[dropdownnames.selectedIndex].textContent;
    let des=detDescription.value;
    let amount=addedamountDetails.value;
    if(x=='Payer'){
        alert("Please add a valid name.");
        return;
    }
    if(des==""){
        alert('Please add a valid description.');
        return;
    }
  
    if(amount==""){
        alert('Please add a valid amount.');
        return ;
    }
     amount=parseInt(amount);
    append(x,payer_Name);
    append(des,description_);
    append(amount,amount_);  
    socket.emit('user-detail',new details(x,des,amount));
    clearFields(detDescription,addedamountDetails);
})

SfDbtn.addEventListener('click',(e)=>{
    console.log('clicked sfdbtn');
    socket.emit('fetch-transactions');
    simpyfyBlock.style.display='block';
})



const append=(name,here)=>{//appends the child with p tag
    let ele=document.createElement('p');
    ele.innerText=name;
    here.appendChild(ele);
   
}

const erase=(Name)=>{// whenever a new user joins remove the name of already joined user
                     // if not name would be repeated
    
  while (Name.firstChild) {
  Name.removeChild(Name.firstChild);
   }
}

const eraseAndAppend=(Name,users)=>{ // when a new use joins add new names in ui in dropdowns
    let s=Name.childElementCount-1;
    while (s--) {
    Name.removeChild(Name.lastElementChild);
     }
     
     for(let i=0;i<users.length;i++){
        var payerhtml='<option value="%val%" id="payerr_%ID%">%Payername%</option>';
        var newpayer=payerhtml.replace('%ID%',i+1);
        newpayer=newpayer.replace('%val%',i+1);
        newpayer=newpayer.replace('%Payername%',users[i]);
        dropdownnames.insertAdjacentHTML('beforeend',newpayer);
     }
     
  }

const eraseName=(name,list)=>{  //when user leaves remove the name of the user that leaved
    let i;
    for(i=0;i<list.childElementCount;i++){
        if(name===list.children[i].textContent)break;
    }
    list.removeChild(list.children[i]);
    
}
const clearFields=(a,b)=>{
     a.value="";
     b.value="";
     
}

socket.on('user-joined',(nam,users,Info)=>{
    erase(addName);//handling group names
    for(let name of users){
        append(name,addName);
    }
    eraseAndAppend(dropdownnames,users); //handling dropdown names
    
    if(Info.length>0){
        erase(payer_Name);
        erase(description_);
        erase(amount_);
        for(let i=0;i<Info.length;i++){
            append(Info[i].payer,payer_Name);
            append(Info[i].desc,description_);
            append(Info[i].amount,amount_); 
        }
    }
    
    appends(`${nam}:joined the chat`,'left');
})

socket.on('someone-paid',det=>{//someone had paid money-sever is saying
    append(det.payer,payer_Name);
    append(det.desc,description_);
    append(det.amount,amount_); 
})
socket.on('leave',(name)=>{
    console.log(name+" leaved the server");
     eraseName(name,addName);
     eraseName(name,dropdownnames);

     appends(`${name}:left the chat`,'left');//appends name in chat box
})
socket.on('get-transactions',(trans,allnames)=>{
    for(let i=0;i<trans.length;i++){//maybe someone paid money but he leaves the room
        let temp=trans[i];
        if(allnames.indexOf(temp.payer)==-1){
            allnames.push(temp.payer);
        }
        
    }
    console.log(trans);
    console.log(allnames);

    var balance={};//who have paid 
    var total=0;
    for(let i=0;i<trans.length;i++){
        let temp=trans[i];
        if(temp.payer in balance){
            balance[temp.payer]+=temp.amount;
            total+=temp.amount;
        }
        else{
            balance[temp.payer]=temp.amount;
            total+=temp.amount;
        }
        
    }
    let n=allnames.length;
    let eop=(total/n);
    console.log(eop);

    var net_balance={};
    for(let i=0;i<allnames.length;i++){
        let payer=allnames[i];
        if(payer in balance){
            net_balance[payer]=balance[payer]-eop;
        }
        else net_balance[payer]=(-1)*eop;

        console.log(typeof(net_balance[payer]));
    }

    var positive=[];//for who have paid more than needed
    var negative=[];//for who have paid less then needed
    
    for(const p in net_balance){
        if(net_balance[p]>0){
            myHeap.push_heap(positive,net_balance[p],p);
        }
        else{
            myHeap.push_heap(negative,-1*net_balance[p],p);
        }
   }
   
    var result = [];//array of expense objects
    console.log(positive);
    console.log(negative);
    while (positive.length > 0&&negative.length>0) {
        var p1 = myHeap.heap_top(positive);
        var p2 = myHeap.heap_top(negative);
        console.log(p1);
        console.log(p2);
        myHeap.pop_heap(positive);
        myHeap.pop_heap(negative);
        let exp = new payments(p2.second, p1.second, Math.min(p1.first, p2.first));

        result.push(exp);
        if (p1.first > p2.first) {
            myHeap.push_heap(positive, p1.first - p2.first, p1.second);
        } else if (p1.first < p2.first) {
            myHeap.push_heap(negative, p2.first - p1.first, p2.second);
        }
    }
            
    console.log(result);
    if(result.length>0){
        erase(simplyPayer);
        erase(simplyPayee);
        erase(simplyAmount);
        for(let i=0;i<result.length;i++){
            append(result[i].payer,simplyPayer);
            append(result[i].payee,simplyPayee);
            append(result[i].amount,simplyAmount); 
        }
    }

   
})


//play sound when a user write the message
function play() {
    var audio = new Audio('https://pl3dxz-a.akamaihd.net/downloads/ringtones/files/mp3/twitter-bird-dceb51f6-7561-3a2e-89a2-aad53695e412-53702.mp3');
    audio.play();
  }

//The message written is shown in container
const appends = (message,position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText=message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    sendCont.append(messageElement);

}


//when we click on send button we send the msg to server so that he send the msg to 
//everone who is connected with server
sendbtn.addEventListener('click',(e)=>{
    e.preventDefault();//page does not reload
    const message=messageInput.value;
    appends(`You:${message}`,'left');
    socket.emit('send',message);
    messageInput.value='';
   
})

socket.on('recieve',data=>{
    appends(`${data.name}:${data.message}`,'left');
    play();
})