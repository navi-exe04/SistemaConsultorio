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
        if (req.session.rol == "admin") {
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

            if (req.session.rol == "admin") {

                connection.query('SELECT * FROM users', (error, results) => {
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

    connection.query('DELETE FROM citas WHERE id = ?', [id], (error, results) => {

        if (error) {

            console.error(error);

        } else {

            /* Swal.fire({
                icon:'success',
                title: 'Cita eliminada',
                text: 'La cita se elimino con exito',
                showConfirmButton: false,
                timer: 1500
            }); */
            res.redirect('/citas_system');

        }

    });

});

//Ruta para la vista de expedientes del consultorio
router.get('/exp_system', (req, res) => {

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        connection.query('SELECT * FROM pacientes', (error, results) => {

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

        //Obtenemos la informacin del paciente registrada en la base de datos
        connection.query('SELECT * FROM pacientes WHERE id = ?', [id], (error, results) => {

            if (error) {

                console.error(error);

            } else {

                //Se guarda la información de una constate
                const paciente = results;
                paciente[0].fecha_nacimiento = moment(paciente[0].fecha_nacimiento).format('LL');

                //Se obtiene la informacion de la madre
                connection.query('SELECT * FROM madres WHERE id = ?', [paciente[0].id_madre], (error, results) => {

                    if (error) {

                        console.error(error);

                    } else {

                        //Se guarda la informacion de la madre en una constante
                        const madre = results;

                        //Se obtiene la informacion del padre
                        connection.query('SELECT * FROM padres WHERE id = ?', [paciente[0].id_padre], (error, results) => {

                            if (error) {

                                console.error(error);

                            } else {

                                //Se guarda la información del padre en una constante
                                const padre = results;

                                //Se obtiene la informacion de contacto
                                connection.query('SELECT * FROM contacto WHERE id = ?', [paciente[0].id_contacto], (error, results) => {

                                    if (error) {

                                        console.error(error);

                                    } else {

                                        //Se guarda la información de contacto en una constante
                                        const contacto = results;

                                        //Se obtiene la información de los antecedentes perinatales del paciente
                                        connection.query('SELECT * FROM antecedentes_perinatales WHERE id_paciente = ?', [paciente[0].id], (error, results) => {

                                            if (error) {

                                                console.error(error);

                                            } else {

                                                if (results == []) { //El expediente es de primera vez y no incluye la demás informacion del paciente

                                                    let aviso = 0;

                                                    //Se envia la información a la pagina
                                                    res.render('expediente_paciente', {
                                                        paciente: paciente,
                                                        madre: madre,
                                                        padre: padre,
                                                        contacto: contacto,
                                                        aviso: aviso
                                                    });

                                                } else { //El paciente ya tiene guardada TODA la información dentro del sistema

                                                    let aviso = 1;
                                                
                                                    //Se guarda la informacion de antecedentes perinatales en una constante
                                                    const antecedentes_perinatales = results;

                                                    //Se obtiene la información de la alimentación del paciente
                                                    connection.query('SELECT * FROM alimentacion WHERE id_paciente = ?', [paciente[0].id], (error, results) => {

                                                        if (error) {

                                                            console.error(error);

                                                        } else {

                                                            //Se guarda la información de alimentación en una constante
                                                            const alimentacion = results;

                                                            //Se obtiene la información de inmunizaciones del paciente
                                                            connection.query('SELECT * FROM inmunizaciones WHERE id_paciente = ?', [paciente[0].id], (error, results) => {

                                                                if (error) {

                                                                    console.error(error);

                                                                } else {

                                                                    //Se guarda la información de las inmunizaciones en una constante
                                                                    const inmunizaciones = results;

                                                                    //Se obtiene la información de antecedentes personales del paciente
                                                                    connection.query('SELECT * FROM antecedentes_personales WHERE id_paciente = ?', [paciente[0].id], (error, results) => {

                                                                        if (error) {

                                                                            console.error(error);

                                                                        } else {

                                                                            //Se guarda la información de antecedentes personales en una constante
                                                                            const antecedentes_personales = results;

                                                                            //Se envia la información a la pagina
                                                                            res.render('expediente_paciente', {
                                                                                paciente: paciente,
                                                                                madre: madre,
                                                                                padre: padre,
                                                                                contacto: contacto,
                                                                                antecedentes_perinatales: antecedentes_perinatales,
                                                                                alimentacion: alimentacion,
                                                                                inmunizaciones: inmunizaciones,
                                                                                antecedentes_personales: antecedentes_personales,
                                                                                aviso: aviso
                                                                            });

                                                                        }

                                                                    });

                                                                }

                                                            });

                                                        }

                                                    });

                                                }

                                            }

                                        });

                                    }

                                });

                            }

                        });

                    }

                });

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

//Ruta para borrar un expediente
router.get('/borrarExpediente/:id', (req, res) => {

    const id = req.params.id;

    //El usuario ha ingresado correctamente
    if (req.session.loggedin) {

        connection.query('DELETE FROM pacientes WHERE id = ?', [id], (error, results) => {

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

        connection.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {

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