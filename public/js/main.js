const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const key = document.querySelector(".key");

const serverKey = 'lPu8JSE98ax3offyD3jMxGZ8YiukMBzt';

function encrypt(msg, secretKey = serverKey){
	console.log("encrypting: " + msg);
	return CryptoJS.AES.encrypt(msg, secretKey ).toString();
}

function decrypt(msg, secretKey = serverKey){
	console.log("decrypting: " + msg);
	return CryptoJS.AES.decrypt(msg, secretKey ).toString(CryptoJS.enc.Utf8);
}

function decryptUsername(username){
	let serv = CryptoJS.AES.decrypt(username, serverKey);
	console.log("decrypted using server key: " + serv);
	console.log("comapred with: " + "41646d696e");
	if(serv == "41646d696e"){
		return "Admin";
	}
	else return CryptoJS.AES.decrypt(username, roomKey).toString(CryptoJS.enc.Utf8);;
}

console.log("ROOM", roomName, key);

//Get username and room from the url
const { username, room, sk } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!sk) {
  window.location = "index.html";
}

if (sk.length != 24) {
  window.location = "index.html";
}

const roomKey = sessionStorage.getItem("passKey");
console.log(roomKey);

const socket = io();

socket.emit("joinRoom", { username, room });

//Get room users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", (message) => {
  console.log(message);
  
  let decryptedUsername = decryptUsername(message.username);
  
  let decryptedMessage = decrypt(message.text);

  outputMessage({
	username: decryptedUsername,
	text: decryptedMessage,
	time: message.time,
    });
    

  //Put scroll function
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//On message Submission - Submit button press karne ke baad

chatForm.addEventListener("submit", (x) => {
  x.preventDefault();
  const msg = x.target.elements.msg.value; //Get what is written by user in msg

  let encryptedMessage = encrypt(msg);
  let encryptedUsername = encrypt(username, roomKey);
  
  socket.emit("chatMessage", room, encryptedUsername, encryptedMessage);

  //Every time you submit a message, it will clear your input field but
  //keep the cursor their itself(focus)
  x.target.elements.msg.value = "";
  x.target.elements.msg.focus();
});
//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} </p>
    <p></p>
    <p class="text">
        ${message.text}
    </p>
    <p class="meta" style="
    padding-left: 650px;
    margin-bottom: 0px;"> <span>${message.time}</span></p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM

function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users name to DOM

function outputUsers(users) {
  userList.innerHTML = `
        ${users.map((user) => `<li> ${user.username} </li>`).join("")}

    `;
}
