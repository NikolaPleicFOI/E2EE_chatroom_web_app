const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { encrypt, decrypt } = require("./utils/cryptography.js");
const Room = require("./RoomSchema");
const bcrypt = require("bcrypt");
var bodyParser = require("body-parser");

mongoose.connect("mongodb://0.0.0.0/chat_db");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setting static folder
app.use(express.static(path.join(__dirname, "public")));
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded
const botName = "Admin";

//RUn when client connects

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit(
      "message",
      formatMessage(botName, encrypt("Welcome To Chatbox"))
    );

    //When user enters a chat room
    //Broadcast will show the prompt to all folks in chat room other than user itself
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(
          botName,
          encrypt(`${user.username} has entered the chat room`)
        )
      );

    //Send room and users info

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    //console.log(msg);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //When user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      //io.emit will show the prompt to all folks in chat room including the user itself
      io.to(user.room).emit(
        "message",
        formatMessage(
          botName,
          encrypt(`${user.username} has left the chat`)
        )
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// ROUTES

app.get("/decrypt", (req, res) => {
  message = req.query.message;
  console.log("LD: " + message.length);
  decrypted = decrypt(message);
  res.json(decrypted);
});

app.get("/encrypt", (req, res) => {
  message = req.query.message;
  encrypted = encrypt(message);
  console.log("LE: " + encrypted.length);
  res.json(encrypted);
});

app.post("/validate", async (req, res) => {
	const existingRooms = await Room.find({});
	if(existingRooms == []){
		var rooms = [new Room({name:"Cyber Security", secretKey:"$2b$10$SIKJI8DVz2tucjvxPHf4NuMSMrgJSAZJzgAzH9.nen/beVGtboRQG"}),
		new Room({name:"Algorithms", secretKey:"$2b$10$UvZQXuectzv12OZ7TjztteQ8p91iGu88ImUYzWSbIfnTla1GZchU6"}),
		new Room({name:"Data Science", secretKey:"$2b$10$PfDVRPfObXJ47.e6Id5AGO5rmaok4tV/IToBCGQszJFOUj4ju43JC"}),
		new Room({name:"Operating Systems", secretKey:"$2b$10$v4a6NO/TuFmBd8Fqh8W8yeiwsKxlAJlVcXCaqGmMDgNe0e7V9baqy"}),
		new Room({name:"Artificial Intelligence", secretKey:"$2b$10$LM6N5baK7tGe2UmaEB6dIeRi7A5MU0gHk14HF.aH/aiwVY6wkfgiK"}),
		new Room({name:"Software Engineering", secretKey:"$2b$10$vRU24JLQMkAR7cExhBIHVeIGijisoslSivG87cxE7Z4L9qHc0dtJu"})
			];
		for(let r of rooms){
			const res = await r.save();
			if(res !== r)console.log("soba " + r.name + "nije uspjesno dodana!!!!");
			else console.log("soba " + r.name + "je uspjesno dodana");
		}
	}
  username = req.body["username"];
  roomName = req.body["room"];
  key = req.body.key;
  await Room.findOne({ name: roomName }, (err, room) => {
    if (room === null) {
      res.redirect("wrong-password.html"); // User not Found
	  return;
    }

    try {
      if (bcrypt.compareSync(key, room.secretKey)) {
        rn = room.name;
        usern = username;
        url = "chat.html?room=" + rn + "&username=" + usern + "&sk=" + room._id;
        console.log(url);
        res.redirect(url); // User not Found
      } else res.redirect("wrong-password.html"); // Incorrect Password
    } catch(error) {
      console.log(error); // unknown error
    }
  }).exec();
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
