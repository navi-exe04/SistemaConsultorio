//Invocamos al modulo de mysql
const mysql = require('mysql');

//Asignamos los valores de conexion
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

//Conectamos a la BD
connection.connect((error) => {
    if (error) {
        console.log('Hubo un error al conectar a la BD');
        return;
    }
    console.log('Conexion existosa a la BD!');
});

//Exportamos el modulo
module.exports = connection;