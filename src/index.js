const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {createMessage} = require('./gen-message')
const app = express()
const socketServer = http.createServer(app)
const io = socketio(socketServer)
const {add,remove,get,listLobby} = require('./users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


// Listen for connection 

io.on('connection', (socket) => {
    console.log('WebSocket connected')
    // Listen for joining room
    socket.on('join', ({username, lobby}, cb) => {
      
      const {error, user} = add({id : socket.id, username, lobby})
      if (error) {
        return cb(error)
      }

      socket.join(user.lobby)
      // Send Welcome
      socket.emit('message', createMessage(`Welcome ${username}`))
      // Send to everyone in room user joining but user connected
      socket.broadcast.to(user.lobby).emit('message', createMessage(`${username} has joined lobby`))
      // Send Users in room currently
      io.to(user.lobby).emit('listRoom', {
        lobby : user.lobby,
        users : listLobby(user.lobby)
      })
      
      
      cb()
    })


  
 
    // Listen for messages sent
    socket.on('sendM', (message, cb) => {

        const user = get(socket.id)
        io.to(user.lobby).emit('message', createMessage(user.username,message))
        cb()
    })
    // Listen for Location sent
    socket.on('locationSend', (coords, cb) => {
        const user = get(socket.id)
        io.to(user.lobby).emit('locationM', createMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        cb()
    })
    // Listen for disconnects
    socket.on('disconnect', () => {
        const user = remove(socket.id)
        if (user) {
          io.to(user.lobby).emit('message', createMessage(user.username,`${user.username} has left the lobby`))
          io.to(user.lobby).emit('listRoom', {
            lobby : user.lobby,
            users : listLobby(user.lobby)
          })
        }
    })
})

socketServer.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})