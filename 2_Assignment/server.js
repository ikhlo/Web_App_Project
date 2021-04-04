require('dotenv').config(); 

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const DATABASE_NAME = 'DRAWS';
const DATABASE_COLLECTION = 'drawings';

const uri = "mongodb+srv://webapp:webapp11@cluster0.6yv33.mongodb.net/DRAWS?retryWrites=true&w=majority";


//const MONGO_URL = `mongodb://localhost:27017/${DATABASE_NAME}`;
//const MONGO_URL = `mongodb+srv://webapp:${process.env.password}@cluster0.6yv33.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`
//const uri = "mongodb+srv://webapp:webapp11@cluster0.6yv33.mongodb.net/DRAWS?retryWrites=true&w=majority";



const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const port = process.env.PORT || 8081;
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');


//const MONGO_URL = `mongodb://localhost:27017/${DATABASE_NAME}`;
//const MONGO_URL = `mongodb+srv://webapp:${process.env.password}@cluster0.6yv33.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`
//const uri = "mongodb+srv://webapp:webapp11@cluster0.6yv33.mongodb.net/DRAWS?retryWrites=true&w=majority";

app.use(express.static('public'));



let db;

async function main() {
  let client = await new mongodb.MongoClient(uri);

  await client.connect().then(client =>{
    db = client.db(DATABASE_NAME);
  }).catch(err=>{
    console.log(err);
  })
    collection = await db.collection(DATABASE_COLLECTION);
}

main();



//I listen for socket connection
io.on('connect', (socket) => {
  //Once a user is connected I wait for him to send me figure on the event 'send_figure' or line with the event 'send_line'
  console.log('New connection');
  socket.on('send_figure', (figure_specs) => {
    //Here I received the figure specs, all I do is send back the specs to all other client with the event share figure
    socket.broadcast.emit('share_figure', figure_specs);
  })

  socket.on('send_line', (line_specs) => {
    //Here I received the line specs, all I do is send back the specs to all other client with the event share line
    socket.broadcast.emit('share_line', line_specs);
  })
})

async function PostDraw(drawing) {
  await db.collection('drawings').insertOne({"draw" : drawing}).then( () =>{
    console.log(`${drawing.user}'s drawing has been stored in mongodb !`);
  });
  client.close();
  
}

async function QueryDraw() {
  let all_drawings = []

  let db_elms = await db.collection('drawings').find().toArray();

  for (let elm of db_elms){
    all_drawings.push(elm.draw);
  }

  return all_drawings;
}

app.post("/all_images", jsonParser, function (req, res) {
  const body = req.body;
  if (body) {
    PostDraw(body);

    let data = body.img_url.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');

    fs.writeFile(`./IMAGES/${body.user}_img${body.date}.png`, buf, function (err) {
      if (err) throw (err);
      else console.log(`The file named ${body.user}_img${body.date} is saved.`);
    });   
  }
  else { console.log('There is an error while posting your body!');}
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

app.get("/savedimg", async (req,res) =>{
  let all_drawings = await QueryDraw();
  let html_page = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="style.css">
      <title>Saved Drawings</title>
  </head>
  <body>
  <h1>All saved images</h1>
  <ul>`;

  for (let drawing of all_drawings){
    let date = new Date(drawing.date);
    date_str = date.toString().replace(/GMT.*/, "");
    html_page +=`<li> This <a href="${drawing.img_url}" target="_blank">image</a> has been drawn by <b>${drawing.user}</b> on 
    ${date_str}.</li><br><br><img style="border:1px solid black;" src='${drawing.img_url}'/><br><br>`
  }

  html_page += `</ul></body></html>`

  res.send(html_page);
});