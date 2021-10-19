const mysql = require('mysql')
const config = require('../app-config.json')

const DBconnect = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database:config.database.database
});

module.exports =  DBconnect;