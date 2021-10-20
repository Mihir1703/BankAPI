const config = require('./app-config.json')
const express = require('express')
const cors = require('cors')
const DBconnect = require('./database/Connection')

const app = express()
app.use(express.json())
app.use(cors())
DBconnect.connect((err)=>{
    if(err) throw err;
    else{
        console.log("Database connection successfull")        
    }
})

app.use('/api/user',require('./routes/User_info'))
app.use('/api/transaction',require('./routes/Transaction'))

app.listen(config.port,()=>{
    console.log(`The server is running on http://localhost:${config.port}`);
})