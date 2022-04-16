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
router.get('/', (_req, res) => {
    res.render('index');
});

//Ruta para el apartado de citas
router.get('/citas', (_req, res) => {
    res.render('citas');
});

//Ruta para el apartado de contacto
router.get('/contacto', (_req, res) => {
    res.render('contacto');
});

/*Rutas y metodos para el usuario (medico y secretaria)*/
//Ruta del login
router.get('/login', (_req, res) => {
    res.render('login');
});

//Comprobamos que el usuario esta autenticado para acceder al sistema
router.get('/system', (req, res) => {

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        let users;
        if (req.session.rol == "admin") {
            connection.query('SELECT * FROM users', (_error, results) => {
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

        connection.query('SELECT * FROM citas', (_error, results) => {

            const citas = results;
            citas.forEach(cita => {
                cita.date = moment(cita.date).format('LL');
            });

            if (req.session.rol == "admin") {

                connection.query('SELECT * FROM users', (_error, results) => {
                    users = results;
                    res.render('system-citas', {
                        citas: citas,
                        users: users,
                        rol: req.session.rol
                    })
                });

            } else {

                res.render('system-citas', {
                    citas: citas,
                    rol: req.session.rol
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

    connection.query('DELETE FROM citas WHERE id = ?', [id], (error, _results) => {

        if (error) {

            console.error(error);

        } else {
            res.redirect('/citas_system');

        }

    });

});

//Ruta para la vista de expedientes del consultorio
router.get('/exp_system', (req, res) => {

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        connection.query('SELECT * FROM pacientes', (_error, results) => {

            const pacientes = results;
            pacientes.forEach(paciente => {
                paciente.fecha_nacimiento = moment(paciente.fecha_nacimiento).format('LL');
            });

            res.render('system_exp', {
                pacientes: pacientes //Mandamos la lista de pacientes
            });

        });


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

//Ruta para ver un expediente en especifico
router.get('/expediente/:id', (req, res) => {

    const id = req.params.id;

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        let paciente, madre, padre, contacto, antc_perinatales, alimentacion, inmunizaciones, antc_personales;

        //Se recupera la informacion del paciente
        connection.query('SELECT * FROM pacientes WHERE id = ?', [id], async(_error1, results1) => {
            paciente = results1;
            paciente[0].fecha_nacimiento = moment(paciente[0].fecha_nacimiento).format('LL');
             //Se recupera la información de la madre del paciente
            connection.query('SELECT * FROM madres WHERE id = ?', [paciente[0].id_madre], async(_error2, results2) => {
                madre = results2;
                //Se recupera la información del padre
                connection.query('SELECT * FROM padres WHERE id = ?', [paciente[0].id_padre], async(_error3, results3) => {
                    padre = results3;
                    //Se recupera la información de contacto del paciente
                    connection.query('SELECT * FROM contacto WHERE id = ?', [paciente[0].id_contacto], async(_error4, results4) => {
                        contacto = results4;
                        //Se recupera la información de antecedentes perinatales
                        connection.query('SELECT * FROM antecedentes_perinatales WHERE id_paciente = ?', [paciente[0].id], async(_error5, results5) => {
                            antc_perinatales = results5;
                            //Se recupera la información de alimentación
                            connection.query('SELECT * FROM alimentacion WHERE id_paciente = ?', [paciente[0].id], async(_error6, results6) => {
                                alimentacion = results6;
                                //Se recupera la información de inmunizaciones
                                connection.query('SELECT * FROM inmunizaciones WHERE id_paciente = ?', [paciente[0].id], async(_error7, results7) => {
                                    inmunizaciones = results7;
                                    //Se recupera la información de antecedentes personales
                                    connection.query('SELECT * FROM antecedentes_personales WHERE id_paciente = ?', [paciente[0].id], async(_error8, results8) => {
                                        antc_personales = results8;
                                        //Se envia la información a la pagina
                                        res.render('expediente_paciente', {
                                            paciente: paciente,
                                            madre: madre,
                                            padre: padre,
                                            contacto: contacto,
                                            antc_perinatales: antc_perinatales,
                                            alimentacion: alimentacion,
                                            inmunizaciones: inmunizaciones,
                                            antc_personales: antc_personales,
                                        });
                                    })
                                })
                            })

                        })
                    });
                });
            });
        });

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

//Ruta para borrar un expediente
router.get('/borrarExpediente/:id', (req, res) => {

    const id = req.params.id;

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        connection.query('DELETE FROM pacientes WHERE id = ?', [id], (error, _results) => {

            if (error) {
                console.log(error);
            } else {
                res.redirect('/exp_system');
            }

        });

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

//Funcion para eliminar usuarios
router.get('/borrarUser/:id', (req, res) => {

    const id = req.params.id;

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        connection.query('DELETE FROM users WHERE id = ?', [id], (error, _results) => {

            if (error) {
                console.error(error);
            } else {
                res.redirect('/system');
            }

        });

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
router.post('/crearExpediente', controllers.crearExpediente);

module.exports = router; //Exportamos las rutas