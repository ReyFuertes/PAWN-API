var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: '198.57.247.137',
    user: 'bcss_p_u',
    password: 'p@55w0rd',
    database: 'bcss_pawnapp',
    port: '3306',
    debug: false
});

// var pool = mysql.createPool({
//   connectionLimit: 100, //important
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'pawnapp',
//   port: '3306',
//   debug: false
// });

function query(sql, arg, callbackFn) {
    pool.getConnection(function (err, connection) {
      console.log(err);
        //if (err) throw err('Could not connect to database..')

        connection.query(sql, arg, function (err, rows) {
            if (err) {
                callbackFn(err, null);
            } else {
                callbackFn(null, rows);
            }
        })
        connection.release();
    });
}

module.exports = {
    query
}