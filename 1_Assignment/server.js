const express = require('express')
const app = express()

const port = process.env.PORT || 8081
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname+'/public/'))

//I listen for socket connection
io.on('connect', (socket) => {
  //Once a user is connected I wait for him to send me figure on the event 'send_figure' or line with the event 'send_line'
  console.log('New connection')
  socket.on('send_figure', (figure_specs) => {
    //Here I received the figure specs, all I do is send back the specs to all other client with the event share figure
    socket.broadcast.emit('share_figure', figure_specs)
  })

  socket.on('send_line', (line_specs) => {
    //Here I received the line specs, all I do is send back the specs to all other client with the event share line
    socket.broadcast.emit('share_line', line_specs)
  })
})

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})