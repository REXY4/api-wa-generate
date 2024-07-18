require("dotenv").config();
const {runWhatsappGeneralClient, waClientGeneral} = require("risk_chat_bot");
const cors = require("cors");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.APP_PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hallo world");
  });

io.on("connection",(client)=>{
    console.log("active")
    client.on("active",async (val)=>{
        console.log("jalan ", val)
         await runWhatsappGeneralClient(io);
    })
    client.on('disconnect', () => { console.log("disconect") });
})


app.post("/send/otp", async (req, res, next)=>{
    const header = req.headers["x-api-key"];
    const secret = process.env.SECRET_KEY;
    if(!header || header !== secret){
       return res.status(400).send({
            status : 400,
            message  :"no authentication"
        })
    }
    next()
} ,async (req, res)=>{
    try {
        const valNum = `${req.body.number.replace("+62", "62").replace("08", "628")}@c.us`;
        const otp = req.body.otp;
        const response = await waClientGeneral.sendMessage(valNum, otp);
        res.send({
            statusCode : 200,
            message : "send otp success!",
            data : response
        })
    } catch (error) {
        res.status(500).send({
            statusCode : 500,
            message : error.message,
            data : 0
        })
    } 
})




server.listen(port, '0.0.0.0', ()=>console.log(`Running on port : ${port}`))

