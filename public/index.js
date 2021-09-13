const socket=io();
import {details} from './detail.js';

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

inputBtn1.addEventListener('click',(e)=>{//for creating room
    let nam=name.value;
    name.value="";
    var crRoom=createRoom.value;
    createRoom.value="";
    socket.emit('new-user-joined',nam,crRoom);
    nameBar.style.display='none';
   
})
inputBtn2.addEventListener('click',(e)=>{//for joining room
    const nam=name.value;
    name.value="";
    var joinR=joinRoom.value;
    joinRoom.value="";
    socket.emit('add-user',nam,joinR);
    nameBar.style.display='none';
 

});

addbtn.addEventListener('click',(e)=>{//for adding the details in ui
    let x=dropdownnames.options[dropdownnames.selectedIndex].textContent;
    let des=detDescription.value;
    let amount=parseInt(addedamountDetails.value);
    append(x,payer_Name);
    append(des,description_);
    append(amount,amount_);  
    socket.emit('user-detail',new details(x,des,amount));
    clearFields(detDescription,addedamountDetails);
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

socket.on('user-joined',(users,Info)=>{
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
})

socket.on('someone-paid',det=>{
    append(det.payer,payer_Name);
    append(det.desc,description_);
    append(det.amount,amount_); 
})
socket.on('leave',(name)=>{
    console.log(name+" leaved the server");
     eraseName(name,addName);
     eraseName(name,dropdownnames);
})
