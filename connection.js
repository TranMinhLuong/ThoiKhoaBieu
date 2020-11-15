var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nhthokr4_student',
    charset: 'utf8_general_ci'
});


module.exports = connection;