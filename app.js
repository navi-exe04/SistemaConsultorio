//Se llama al modulo de express para poder usarlo
const express = require('express');
const app = express();

//Establecemos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Invocamos a dotenv para las variables de entorno
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//Se establece una vista con ejs
app.set('view engine', 'ejs');

//Invocamos a las variables de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret', //Establecemos una clave secreta
    resave: true, //Establecemos la forma en la que se guardan las sesiones
    saveUninitialized: true
}));

//Establecemos la ruta predeterminada para los recursos
app.use(express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//Invocamos a las rutas de nuestro proyecto
app.use('/', require('./router'));

//Se inicializa el servidor
app.listen(3000, (req, res) => {
    console.log('SERVIDOR INICIADO EN PORT 3000');
});