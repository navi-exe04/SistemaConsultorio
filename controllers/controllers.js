/*Son todas las funciones correspondientes a los metodos POST*/

//Invocamos a la BD
const connection = require('../database/db');

//Invocamos a bcryptjs para las password
const bcryptjs = require('bcryptjs');

//Metodo recolectar los datos de una cita y apartarla
exports.generarCita = async (req, res) => {
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

}