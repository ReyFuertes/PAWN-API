var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: 'localhost',
    user: 'root', 
    password: '', //  fc338db8c85d0ca9e2e887d812a3fc7ddb10bb18b8f7b5a9
    database: '',
    debug: false
});

module.exports = pool;