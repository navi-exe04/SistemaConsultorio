//Se llama al modulo de express para poder usarlo
const express = require('express');
const app = express();

//Establecemos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Invocamos a dotenv para las variables de entorno
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//Se establece una vista con ejs
app.set('view engine', 'ejs');

//Establecemos la ruta predeterminada para los recursos
app.use(express.static('public'));
app.use('/resources', express.static(__dirname+'/public'));

//Invocamos a bcryptjs para las password
const bcryptjs = require('bcryptjs');

//Invocamos a las variables de sesion
const session = require('express-session');
app.use(session({
    secret:'secret', //Establecemos una clave secreta
    resave: true, //Establecemos la forma en la que se guardan las sesiones
    saveUninitialized: true
}));

//Invocamos al modulo de conexion de BD
const connection = require('./database/db');



        /*Rutas para el usuario (paciente)*/
app.get('/',(req,res) => {
    res.render('index');
});

app.get('/citas',(req,res) => {
    res.render('citas');
});

app.get('/contacto',(req,res) => {
    res.render('contacto');
});



        /*Rutas y metodos para el usuario (medico y secretaria)*/
app.get('/login',(req,res) => {
    res.render('login');
});

app.post('/auth', async(req, res) => {
    //Obtenemos los valores que el usuario haya ingresado
    const email = req.body.email;
    const pass = req.body.password;
    //Comprobamos que el usuario exista en la BD
    if(email && pass) {
        connection.query('SELECT * FROM users WHERE email = ?', [email], 
        async (error, results) => {
            //Si la consulta no regresa nada o la contraseña es incorrecta
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].password))) {
                //Mostrara un mensaje con sweet alert
                res.render('login', { //Mandamos variables para la configuracion de la alerta de sweet alert
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o contraseña incorrectas",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else { //El usuario y contraseña son correctos
                //Creamos variables de sesion
                req.session.loggedin = true; //Esto nos permite saber si el usuario esta autenticado
                req.session.name = results[0].name; //Obtenemos el nombre del usuario que esta ingresando
                req.session.rol = results[0].rol; //Obtenemos el rol del usuario contectado
                res.render('login', { //Configuramos las variables que mandaremos al HTML para sweet alert
                    alert: true,
                    alertTitle: "!CONEXION EXITOSA!",
                    alertMessage: `Bienvenido ${results[0].name}.`,
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    ruta: 'system'
                });
            }
        });
    } else { //El usuario no ha ingresado usuario o contraseña
        res.render('login', {
            alert: true,
            alertTitle: "¡UPS!",
            alertMessage: "Ingrese un usuario y contraseña.",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
});

//Comprobamos que el usuario esta autenticado para acceder al sistema
app.get('/system',(req,res) => {
    if(req.session.loggedin) {
        res.render('system', {
           login: true, //El usuario esta logeado
           name: req.session.name, //Se manda el nombre del usuario
           rol: req.session.rol //Se manda el rol del usuario
        });
    } else {
        res.render('system', {
            login: false, //El usuario no esta logeado
        })
    }
});

//Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => { //Se "destruye la sesion"
        res.redirect('/login')
    });
});

//Se inicializa el servidor
app.listen(3000,(req,res) => {
    console.log('SERVIDOR INICIADO EN PORT 3000');
});