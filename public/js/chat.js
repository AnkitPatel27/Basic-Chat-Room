const socket = io();
const formMess = document.querySelector('#messageform')
const messageinput = formMess.querySelector('input')
const messagebutton = formMess.querySelector('button')
const messages = document.querySelector('#messages');
const sendlocation = document.querySelector("#sendlocation");


const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true}) 

const autoscroll = () => {
    //new message Element
    const newmessage = messages.lastElementChild

    //height of new message
    const newmessagestyles = getComputedStyle(newmessage);
    const newmessagemargin = parseInt(newmessagestyles.marginBottom)
    const newmessageheight = newmessagemargin + newmessage.offsetHeight;
    
    //visible Height
    const visibleHeight = messages.offsetHeight

    //Total Height with scroll
    const containerheight = messages.scrollHeight

    //scrolling done
    const scrollOffset = messages.scrollTop+visibleHeight;

    if(containerheight-newmessageheight > scrollOffset-10)
    {
        messages.scrollTop = messages.scrollHeight
    }
    console.log(containerheight-newmessageheight,scrollOffset)
}



socket.on("message",(mesage)=>{
    console.log(mesage);
    //messages template
    const message_html = `<div class="message">
    <p>
    <span class="message__name">${mesage.username}</span>
    <span class="message__meta">${moment(mesage.created_At).calendar()}</span>
    </p>
    <p>
        ${mesage.text}
    </p>
</div>`;
    messages.innerHTML+=message_html;
    autoscroll();
});
socket.on("sendlocationmessages",(mesage)=>{
    //location messages template
    const message_html = `<div class="message">
    <p>
    <span class="message__name">${mesage.username}</span>
    <span class="message__meta">${moment(mesage.created_At).calendar()}</span>
    </p>
    <p>
    <a href="${mesage.text}" target="_blank">My current Location</a>
    </p>
</div>`
    autoscroll()
    messages.innerHTML+=message_html;
});

formMess.addEventListener('submit',(e)=>{
    e.preventDefault();
    messagebutton.setAttribute('disabled','disabled');

    const message = e.target.elements.message.value;
    socket.emit("inputmessage",message,(error)=>{
        messagebutton.removeAttribute('disabled');
        messageinput.value='';
        messageinput.focus();
        if(error)
        {
            return console.log(error);
        }
        console.log('message Delivered!')
    })
})

sendlocation.addEventListener("click",()=>{
    if(!navigator.geolocation)
    {
        return alert("Your browser does not support the feature")
    }
    sendlocation.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit("sendlocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            sendlocation.removeAttribute('disabled');
            console.log("Location is Shared");
        })
    })
})

socket.emit("join",{username,room},(error)=>{
    if(error)
    {
        alert(error);
        location.href = "/";
    }
});


socket.on("roomData",(room,users)=>{
    console.log(users,room)
    message_html=``;
    users.forEach((user) => {
        message_html+=`<li>${user.username}</li>`
    });
    message_html_final = `<h2 class="room_title">${room}</h2>
    <h3 class="list-title">Users</h3>
    <ul class="users">
        ${message_html}
    </ul>`
    document.querySelector('#sidebar').innerHTML = message_html_final;
})