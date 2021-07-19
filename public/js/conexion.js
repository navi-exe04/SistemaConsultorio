//Establecemos conexion a la base de datos local
//La base de datos ya debe de estar creada, no se crea en automatico
//Falta obtener los datos a esta clase y subirlo a la base de datos
//O
//Usar esta clase en el script cita y subir los datos en esa clase
var mysql = require('mysql');
var conexion = mysql.createConnection({
host: 'localhost',
database: 'registros_citas',
user: 'root',
password: ''
});

conexion.connect(function(error){
if(error){
    throw error;
}else{
    console.log('Conexion a la base de datos exitosa');
}
});
conexion.end();

