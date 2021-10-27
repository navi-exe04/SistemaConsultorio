/*Son todas las funciones correspondientes a los metodos POST*/

//Invocamos a la BD
const connection = require('../database/db');

//Invocamos a bcryptjs para las password
const bcryptjs = require('bcryptjs');

//Invocamos a moment
const moment = require('moment');
moment.locale('es');

//Metodo recolectar los datos de una cita y apartarla
exports.generarCita = async (req, res) => {

    //Obtenemos los valores del formulario de citas
    const name = req.body.nombre_citas;
    const date = req.body.fecha_citas;
    const hour = req.body.hora_citas;
    const reason = req.body.razon_citas;

    //Se comprueba que no sea una fecha anterior a la actual
    if (moment(date).format('L') < moment().format('L')) {

        console.log(moment(date).format('L'));
        console.log(moment().format('L'));

        res.render('citas', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Fecha y horario invalido, por favor seleccione otro.",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'citas'
        });

    } else {

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
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: true,
                    ruta: 'citas'
                });

            }

        });

    }

}

//Metodo de autenticacion de usuario en login
exports.auth = async (req, res) => {

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
                req.session.rol = results[0].type; //Obtenemos el rol del usuario contectado

                //Mandamos variables para la configuracion de la alerta de sweet alert
                res.render('login', {
                    alert: true,
                    alertTitle: "!CONEXION EXITOSA!",
                    alertMessage: `Bienvenido ${results[0].name}.`,
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    ruta: 'system',
                    rol: results[0].type
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

}

//Metodo para crear un nuevo usuario para el sistema
exports.crearUsuario = async (req, res) => {

    const name = req.body.nombre_usuario;
    const email = req.body.email_usuario;
    const type = req.body.tipo_usuario;
    const pass = req.body.pass_usuario;

    //Comprueba que los datos del usuario no existan en la BD
    connection.query(`SELECT * FROM users WHERE email = '${email}'`, async (error, results) => {

        //No hay coincidencias
        if (results.length == 0) {

            let passHash = await bcryptjs.hashSync(pass, 10);

            connection.query('INSERT INTO users SET ?', {
                name: name,
                email: email,
                type: type,
                password: passHash
            }, async (error, results) => {

                res.redirect('/system')

            });

        }

    });

}

//Metodo para crear un nuevo expediente de paciente
exports.crearExpediente = async (req, res) => {

    const nombre_paciente = req.body.nombre_paciente;
    const apellido_paterno_paciente = req.body.apellido_paterno_paciente;
    const apellido_materno_paciente = req.body.apellido_materno_paciente;
    const sexo_paciente = req.body.sexo_paciente;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    const derechohabiente_paciente = req.body.derechohabiente_paciente;

    //Comprueba que los datos del usuario no existan en la BD
    connection.query(`SELECT * FROM pacientes WHERE nombre = '${nombre_paciente}' AND apellido_paterno = '${apellido_paterno_paciente}' AND apellido_materno = '${apellido_materno_paciente}' AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async (error, results) => {

            //No hay coincidencias
            if (results.length == 0) {

                //Insertamos los datos a la tabla de pacientes
                connection.query('INSERT INTO pacientes SET ?', {

                    nombre: nombre_paciente,
                    apellido_paterno: apellido_paterno_paciente,
                    apellido_materno: apellido_materno_paciente,
                    sexo: sexo_paciente,
                    fecha_nacimiento: fecha_nacimiento,
                    derechohabiente: derechohabiente_paciente

                }, async (error, results) => {

                    //Si hay un error se presenta un mensaje
                    if (error) {

                        console.log(error);
                        let pacientes;
                        connection.query('SELECT * FROM pacientes', (error, results) => {
                            pacientes = results;
                            //Mandamos variables para la configuracion de la alerta de sweet alert
                            res.render('system_exp', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "Hubo un error al crear el expediente, intentalo más tarde.",
                                alertIcon: 'error',
                                showConfirmButton: true,
                                timer: false,
                                ruta: 'exp_system',
                                pacientes: pacientes //Mandamos la lista de pacientes
                            });
                        });


                    } else { //Si no hay error

                        let pacientes;
                        connection.query('SELECT * FROM pacientes', (error, results) => {
                            pacientes = results;
                            //Mandamos variables para la configuracion de la alerta de sweet alert
                            res.render('system_exp', {
                                alert: true,
                                alertTitle: "¡Se ha creado un expediente nuevo!",
                                alertMessage: `El expediente de ${nombre_paciente} se ha creado.`,
                                alertIcon: 'success',
                                showConfirmButton: false,
                                timer: 2000,
                                ruta: 'exp_system',
                                pacientes: pacientes //Mandamos la lista de pacientes
                            });
                        });

                    }

                });

            } else {

                let pacientes;
                connection.query('SELECT * FROM pacientes', (error, results) => {
                    pacientes = results;
                    //Mandamos variables para la configuracion de la alerta de sweet alert
                    res.render('system_exp', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Este expediente ya existe.",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'exp_system',
                        pacientes: pacientes //Mandamos la lista de pacientes
                    });
                });

            }

        });

}