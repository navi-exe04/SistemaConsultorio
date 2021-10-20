/*Se definen todas las rutas de nuestro proyecto*/

//Invocamos a express
const express = require('express');
const router = express.Router();

//Invocamos a moment
const moment = require('moment');
moment.locale('es');

//Invocamos al modulo de conexion de BD
const connection = require('./database/db');

/*Rutas y metodos para el usuario (paciente)*/
//Ruta para la pagina principal
router.get('/', (req, res) => {
    res.render('index');
});

//Ruta para el apartado de citas
router.get('/citas', (req, res) => {
    res.render('citas');
});

//Ruta para el apartado de contacto
router.get('/contacto', (req, res) => {
    res.render('contacto');
});

/*Rutas y metodos para el usuario (medico y secretaria)*/
//Ruta del login
router.get('/login', (req, res) => {
    res.render('login');
});

//Comprobamos que el usuario esta autenticado para acceder al sistema
router.get('/system', (req, res) => {

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        let users;
        if(req.session.rol == "admin") {
            connection.query('SELECT * FROM users', (error, results) => {
                users = results;
                res.render('system', {
                    name: req.session.name, //Se manda el nombre del usuario
                    rol: req.session.rol, //Se manda el rol del usuario
                    users: users
                });
            });
        } else {
            res.render('system', {
                name: req.session.name, //Se manda el nombre del usuario
                rol: req.session.rol, //Se manda el rol del usuario
            });
        }


    } else { //El usuario no ha ingresado

        res.render('login', {
            alert: true,
            alertTitle: "¡Lo siento!",
            alertMessage: "Debe ingresar sesión.",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });

    }

});

//Obtenemos las citas para presentarlas al medico
router.get('/citas_system', (req, res) => {
    //El usuario esta logeado
    if (req.session.loggedin) {

        connection.query('SELECT * FROM citas', (error, results) => {

            const citas = results;
            citas.forEach(cita => {
                cita.date = moment(cita.date).format('LL');
            });

            if(req.session.rol == "admin") {

                connection.query('SELECT * FROM users', (error, results) => {
                    users = results;
                    res.render('system-citas', {
                        citas: citas,
                        users: users
                    })
                });

            } else {

                res.render('system-citas', {
                    citas: citas
                });
            
            }
            
        });

    } else { //El usuario no ha ingresado

        res.render('login', {
            alert: true,
            alertTitle: "¡UPS!",
            alertMessage: "Debe iniciar sesión para continuar",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });

    }
});

//Funcion para eliminar las citas
router.get('/borrar/:id', (req, res) => {

    const id = req.params.id;
    
    connection.query('DELETE FROM citas WHERE id = ?',[id], (error, results) => {
        
        if(error) {
            console.error(error);
        } else {
            res.redirect('/citas_system');
        }
    
    });

});

//Funcion para eliminar usuarios
router.get('/borrarUser/:id', (req, res) => {

    const id = req.params.id;
    
    connection.query('DELETE FROM users WHERE id = ?',[id], (error, results) => {
        
        if(error) {
            console.error(error);
        } else {
            res.redirect('/system');
        }
    
    });

})

//Logout
router.get('/logout', (req, res) => {

    req.session.destroy(() => { //Se "destruye la sesion"
        res.redirect('/login')
    });

});

//Solicitamos las funciones del controlador
const controllers = require('./controllers/controllers');
router.post('/generarCita', controllers.generarCita);
router.post('/auth', controllers.auth);
router.post('/crearUsuario', controllers.crearUsuario);

module.exports = router; //Exportamos las rutas