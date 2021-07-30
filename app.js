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

//Establecemos la ruta predeterminada para los recursos
app.use(express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//Invocamos a bcryptjs para las password
const bcryptjs = require('bcryptjs');

//Invocamos a las variables de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret', //Establecemos una clave secreta
    resave: true, //Establecemos la forma en la que se guardan las sesiones
    saveUninitialized: true
}));

//Invocamos al modulo de conexion de BD
const connection = require('./database/db');



/*Rutas y metodos para el usuario (paciente)*/
//Ruta para la pagina principal
app.get('/', (req, res) => {
    res.render('index');
});

//Ruta para el apartado de citas
app.get('/citas', (req, res) => {
    res.render('citas');
});

//Ruta para el apartado de contacto
app.get('/contacto', (req, res) => {
    res.render('contacto');
});

//Metodo recolectar los datos de una cita y apartarla
app.post('/generarCita', async (req, res) => {

    //Obtenemos los valores del formulario de citas
    const name = req.body.nombre_citas;
    const date = req.body.fecha_citas;
    const hour = req.body.hora_citas;
    const reason = req.body.razon_citas;

    //Comprueba que la informacion ingresada no exista dentro de la BD
    connection.query(`SELECT * FROM citas WHERE name = '${name}' AND date = '${date}' AND hour = '${hour}' AND reason = '${reason}'`, async (error, results) => {

        //Si la consulta NO encontro campos duplicados
        if (results.length == 0) {

            //Comprueba que la fecha y hora ingresadas no esten ocupadas
            connection.query(`SELECT * FROM citas WHERE date = '${date}' AND hour = '${hour}'`, async (error, results) => {

                //Si la consulta no encontro horas y fechas ocupadas    
                if (results.length == 0) {

                    //Se insertar los datos a la BD
                    connection.query('INSERT INTO citas SET ?', {
                        name: name,
                        date: date,
                        hour: hour,
                        reason: reason
                    }, async (error, results) => {

                        //Si hubo un error al mandar los datos
                        if (error) {

                            //Mandamos variables para la configuracion de la alerta de sweet alert
                            res.render('citas', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "Hubo un error, por favor, intentalo mas tarde",
                                alertIcon: 'error',
                                showConfirmButton: true,
                                timer: false,
                                ruta: 'citas'
                            });

                        } else { //Si todo salio correctamente

                            //Mandamos variables para la configuracion de la alerta de sweet alert
                            res.render('citas', {
                                alert: true,
                                alertTitle: "¡Cita registrada!",
                                alertMessage: `Su cita ha sido registrada con exito. Lo esperamos el dia ${date}, a las ${hour} en el consultorio del Dr. Langle.`,
                                alertIcon: 'success',
                                showConfirmButton: true,
                                timer: false,
                                ruta: 'citas'
                            });

                        }

                    });

                } else { //Si ya hay horarios ocupados

                    //Mandamos variables para la configuracion de la alerta de sweet alert
                    res.render('citas', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Fecha y hora ocupadas. Selecciona otra por favor.",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'citas'
                    });

                }

            });

        } else { //Si hay informacion duplicada

            //Mandamos variables para la configuracion de la alerta de sweet alert
            res.render('citas', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Esta cita ya esta registrada.",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'citas'
            });

        }

    });

});



/*Rutas y metodos para el usuario (medico y secretaria)*/
//Ruta del login
app.get('/login', (req, res) => {
    res.render('login');
});

//autenticacion de usuario en login
app.post('/auth', async (req, res) => {

    //Obtenemos los valores que el usuario haya ingresado
    const email = req.body.email;
    const pass = req.body.password;

    //Comprobamos que el usuario exista en la BD
    if (email && pass) {

        connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            
            //Si la consulta no regresa nada o la contraseña es incorrecta
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].password))) {
                
                //Mandamos variables para la configuracion de la alerta de sweet alert
                res.render('login', {
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
                
                //Mandamos variables para la configuracion de la alerta de sweet alert
                res.render('login', { 
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

        //Mandamos variables para la configuracion de la alerta de sweet alert
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
app.get('/system', (req, res) => {

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        res.render('system', {
            login: true, //El usuario esta logeado
            name: req.session.name, //Se manda el nombre del usuario
            rol: req.session.rol //Se manda el rol del usuario
        });

    } else { //El usuario no ha ingresado

        res.render('system', {
            login: false, //El usuario no esta logeado
        });

    }

});

//Logout
app.get('/logout', (req, res) => {

    req.session.destroy(() => { //Se "destruye la sesion"
        res.redirect('/login')
    });
    
});

//Se inicializa el servidor
app.listen(3000, (req, res) => {
    console.log('SERVIDOR INICIADO EN PORT 3000');
});