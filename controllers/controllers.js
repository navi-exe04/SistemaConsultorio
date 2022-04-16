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
        connection.query(`SELECT * FROM citas WHERE name = '${name}' 
                            AND date = '${date}' 
                            AND hour = '${hour}' 
                            AND reason = '${reason}'`, async (_error13, results13) => {

            //Si la consulta NO encontro campos duplicados
            if (results13.length == 0) {

                //Comprueba que la fecha y hora ingresadas no esten ocupadas
                connection.query(`SELECT * FROM citas WHERE date = '${date}' 
                                    AND hour = '${hour}'`, async (_error14, results14) => {

                    //Si la consulta no encontro horas y fechas ocupadas    
                    if (results14.length == 0) {

                        //Se insertar los datos a la BD
                        connection.query('INSERT INTO citas SET ?', {
                            name: name,
                            date: date,
                            hour: hour,
                            reason: reason
                        }, async (error, _results) => {

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

    //Se obtiene la informacion del paciente
    const nombre_paciente = req.body.nombre_paciente;
    const apellido_paterno_paciente = req.body.apellido_paterno_paciente;
    const apellido_materno_paciente = req.body.apellido_materno_paciente;
    const sexo_paciente = req.body.sexo_paciente;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    const derechohabiente_paciente = req.body.derechohabiente_paciente;

    //Se obtiene la informacion de la madre del paciente
    const nombre_madre = req.body.nombre_madre;
    const apellido_paterno_madre = req.body.apellido_paterno_madre;
    const apellido_materno_madre = req.body.apellido_materno_madre;
    const edad_madre = req.body.edad_madre;
    const grupo_sanguineo_madre = req.body.grupo_sanguineo_madre;
    const ocupacion_madre = req.body.ocupacion_madre;
    const enfermedad_madre = req.body.enfermedad_madre;
    const antecedentes_madre = req.body.antecedentes_madre;
    const embarazos_madre = req.body.embarazos_madre;
    const partos_madre = req.body.partos_madre;
    const cesareas_madre = req.body.cesareas_madre;
    const abortos_madre = req.body.abortos_madre;

    //Se obtiene la informacion del padre del paciente
    const nombre_padre = req.body.nombre_padre;
    const apellido_paterno_padre = req.body.apellido_paterno_padre;
    const apellido_materno_padre = req.body.apellido_materno_padre;
    const edad_padre = req.body.edad_padre;
    const grupo_sanguineo_padre = req.body.grupo_sanguineo_padre;
    const ocupacion_padre = req.body.ocupacion_padre;
    const enfermedad_padre = req.body.enfermedad_padre;
    const antecedentes_padre = req.body.antecedentes_padre;

    //Se obtiene la informacion de contacto
    const domicilio_paciente = req.body.domicilio_paciente;
    const municipio_paciente = req.body.municipio_paciente;
    const estado_paciente = req.body.estado_paciente;
    const telefono_paciente = req.body.telefono_paciente;
    const correo_paciente = req.body.correo_paciente;
    const familiar_paciente = req.body.familiar_paciente;

    //Se obtiene la información de antecedentes perinatales
    const num_hijo = req.body.num_hijo;
    const control_medico = req.body.control_medico;
    const sem_gestacion = req.body.sem_gestacion;
    const tipo_procedimiento =  req.body.tipo_procedimiento;
    const razon_procedimiento = req.body.razon_procedimiento;
    const lugar_nacimiento = req.body.lugar_nacimiento;
    const nombre_medico = req.body.nombre_medico;
    const peso_paciente = req.body.peso_paciente;
    const talla_paciente = req.body.talla_paciente;
    const reaccion_paciente = req.body.reaccion_paciente;
    const requerimientos_paciente = req.body.requerimientos_paciente;
    const tiempo_requerimientos = req.body.tiempo_requerimientos;
    const sangre_derivados = req.body.sangre_derivados;
    const asfixia_paciente = req.body.asfixia_paciente;
    const razon_asfixia = req.body.razon_asfixia;
    const apgar_paciente = req.body.apgar_paciente;
    const diagnostico_alta = req.body.diagnostico_alta;
    
    //Se obtiene la información de alimentación
    const seno_materno = req.body.seno_materno;
    const formulas = req.body.formulas;
    const ablactacion = req.body.ablactacion;
    const destete = req.body.destete;
    const dieta_actual = req.body.dieta_actual;

    //Se obtiene la información de imnunizaciones 
        // --Tamiz neonatal
    const tn_met = req.body.tn_met;
    const tn_aud = req.body.tn_aud;
        //-- BCG
    const bcg_tub = req.body.bcg_tub;
    const bcg_aHep = req.body.bcg_aHep;
        //--Poliomelitis
    const polio2 = req.body.polio2;
    const polio4 = req.body.polio4;
    const polio6 = req.body.polio6;
        //--Pentavalente
    const penta2 = req.body.penta2;
    const penta4 = req.body.penta4;
    const penta6 = req.body.penta6;
    const triple_viral = req.body.triple_viral;
        //--Revacunaciones
    const revac2 = req.body.revac2;
    const revac4 = req.body.revac4;
    const revac6 = req.body.revac6;
    const influenza = req.body.influenza;
    const neumococo = req.body.neumococo;
    const hepatitis = req.body.hepatitis;
    const varicela = req.body.varicela;
    const otras_inmunizaciones = req.body.otras_inmunizaciones;

    //Se obtiene la información de antecedentes personales
     const reflujo = req.body.reflujo;
     const ictericia = req.body.ictericia;
     const onfalitis = req.body.onfalitis;
        //--Exantematicas
     const exa1 = req.body.exa1;
     const exa2 = req.body.exa2;
     const exa3 = req.body.exa3;
     const exa4 = req.body.exa4;
     const anemia = req.body.anemia;
     const bajo_peso = req.body.bajo_peso;
     const desnutricion = req.body.desnutricion;
     const diarreas = req.body.diarreas;
     const deshidratacion = req.body.deshidratacion;
     const conjuntivitis = req.body.conjuntivitis;
     const otitis_supurada = req.body.otitis_supurada;
         //--Infecciones respiratorias
     const ir1 = req.body.ir1;
     const ir2 = req.body.ir2;
     const ir3 = req.body.ir3;
     const ir4 = req.body.ir4;
     const ir5 = req.body.ir5;
     const ir6 = req.body.ir6;
     const ir7 = req.body.ir7;
     const ir8 = req.body.ir8;
     const ir9 = req.body.ir9;
     const ir10 = req.body.ir10;
     const ir11 = req.body.ir11;
     const ir12 = req.body.ir12;
     const paperas = req.body.paperas;
     const hepatiti = req.body.hepatiti;
     const infecciones_urinarias = req.body.infecciones_urinarias;
     const tifoidea = req.body.tifoidea;
     const alergias_medicamentos = req.body.alergias_medicamentos;
     const alergias_alimentos = req.body.alergias_alimentos;
     const alergias_otros = req.body.alergias_otros;
     const hospitalizaciones = req.body.hospitalizaciones;
     const operaciones =  req.body.operaciones;
    
     //Inserta la informacion de la madre a la BD
    //Primero se comprueba que la informacion no exista en la BD
    connection.query(`SELECT * FROM madres WHERE nombre = '${nombre_madre}' 
                        AND apellido_paterno = '${apellido_paterno_madre}' 
                        AND apellido_materno = '${apellido_materno_madre}'`,
        async (_error, results) => {

            //No existe la madre registrada en la BD
            if (results.length == 0) {

                //Insertamos los datos a la tabla de madres
                connection.query('INSERT INTO madres SET ?', {
                    nombre: nombre_madre,
                    apellido_paterno: apellido_paterno_madre,
                    apellido_materno: apellido_materno_madre,
                    edad: edad_madre,
                    grupo_sanguineo: grupo_sanguineo_madre,
                    ocupacion: ocupacion_madre,
                    enfermedad: enfermedad_madre,
                    antecedentes: antecedentes_madre,
                    embarazos: embarazos_madre,
                    partos: partos_madre,
                    cesareas: cesareas_madre,
                    abortos: abortos_madre
                });

            }

        });

    //Inserta la informacion del padre a la BD
    //Primero se comprueba que la informacion no exista en la BD
    connection.query(`SELECT * FROM padres WHERE nombre = '${nombre_padre}' 
                        AND apellido_paterno = '${apellido_paterno_padre}' 
                        AND apellido_materno = '${apellido_materno_padre}'`,
        async (_error, results) => {

            //No existe el padre registrado en la BD
            if (results.length == 0) {

                //Insertamos los datos a la tabla de padres
                connection.query('INSERT INTO padres SET ?', {
                    nombre: nombre_padre,
                    apellido_paterno: apellido_paterno_padre,
                    apellido_materno: apellido_materno_padre,
                    edad: edad_padre,
                    grupo_sanguineo: grupo_sanguineo_padre,
                    ocupacion: ocupacion_padre,
                    enfermedad: enfermedad_padre,
                    antecedentes: antecedentes_padre
                });

            }

        });

    //Inserta la informacion del contacto a la BD
    //Primero se comprueba que la informacion no exista en la BD
    connection.query(`SELECT * FROM contacto WHERE domicilio = '${domicilio_paciente}' 
                        AND municipio = '${municipio_paciente}' 
                        AND estado = '${estado_paciente}' 
                        AND telefono = '${telefono_paciente}' 
                        AND correo = '${correo_paciente}' 
                        AND familiar = '${familiar_paciente}'`,
        async (_error, results) => {

            //No existe la informacion de contacto registrada en la BD
            if (results.length == 0) {

                //Insertamos los datos a la tabla de padres
                connection.query('INSERT INTO contacto SET ?', {
                    domicilio: domicilio_paciente,
                    municipio: municipio_paciente,
                    estado: estado_paciente,
                    telefono: telefono_paciente,
                    correo: correo_paciente,
                    familiar: familiar_paciente
                });

            }

        });

    //Inserta la informacion del paciente en la BD
    //Comprueba que los datos del usuario no existan en la BD
    connection.query(`SELECT * FROM pacientes WHERE nombre = '${nombre_paciente}' 
                        AND apellido_paterno = '${apellido_paterno_paciente}' 
                        AND apellido_materno = '${apellido_materno_paciente}' 
                        AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async (_error1, results1) => {

            //No hay coincidencias
            if (results1.length == 0) {

                //Obtenemos el id de la madre
                connection.query(`SELECT * FROM madres WHERE nombre = '${nombre_madre}' 
                                    AND apellido_paterno = '${apellido_paterno_madre}' 
                                    AND apellido_materno = '${apellido_materno_madre}'`,
                    async (_error2, results2) => {

                        const idMadre = results2[0].id;

                        //Obtenemos el id del padre
                        connection.query(`SELECT * FROM padres WHERE nombre = '${nombre_padre}' 
                                            AND apellido_paterno = '${apellido_paterno_padre}' 
                                            AND apellido_materno = '${apellido_materno_padre}'`,
                            async (_error3, results3) => {

                                const idPadre = results3[0].id;

                                //Obtenemos el id de informacion de contacto
                                connection.query(`SELECT * FROM contacto WHERE domicilio = '${domicilio_paciente}' 
                                                    AND municipio = '${municipio_paciente}' 
                                                    AND estado = '${estado_paciente}' 
                                                    AND telefono = '${telefono_paciente}' 
                                                    AND correo = '${correo_paciente}' 
                                                    AND familiar = '${familiar_paciente}'`,
                                    async (_error4, results4) => {

                                        const idContacto = results4[0].id;

                                        //Insertamos los datos a la tabla de pacientes
                                        connection.query('INSERT INTO pacientes SET ?', {

                                            nombre: nombre_paciente,
                                            apellido_paterno: apellido_paterno_paciente,
                                            apellido_materno: apellido_materno_paciente,
                                            sexo: sexo_paciente,
                                            fecha_nacimiento: fecha_nacimiento,
                                            derechohabiente: derechohabiente_paciente,
                                            id_padre: idPadre,
                                            id_madre: idMadre,
                                            id_contacto: idContacto

                                        }, async (error5, _results5) => {

                                            //Si hay un error se presenta un mensaje
                                            if (error5) {

                                                console.log(error5);
                                                let pacientes;
                                                connection.query('SELECT * FROM pacientes', (_error6, results6) => {
                                                    pacientes = results6;
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
                                                connection.query('SELECT * FROM pacientes', (_error8, results8) => {
                                                    pacientes = results8;
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

                                    });

                            });

                    });

            } else {

                let pacientes;
                connection.query('SELECT * FROM pacientes', (_error9, results9) => {
                    pacientes = results9;
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

    //Inserta la informacion de antecedentes perinatales a la BD
    connection.query(`SELECT * FROM pacientes WHERE '${nombre_paciente},
                        AND apellido_paterno = '${apellido_paterno_paciente}' 
                        AND apellido_materno = '${apellido_materno_paciente}' 
                        AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async(_error10, results10) => {
            //Obtenemos el id del paciente al cual se va asociar la informacion
            const idPaciente = results10[0].id;
            //Insertamos la informacion en la BD
            connection.query('INSERT INTO antecedentes_perinatales SET ?', {
                id_paciente: idPaciente,
                numero_hijo: num_hijo,
                control_medico: control_medico,
                semanas_gestacion: sem_gestacion,
                tipo: tipo_procedimiento,
                razon: razon_procedimiento,
                lugar_nacimiento: lugar_nacimiento,
                nombre_medico: nombre_medico,
                peso: peso_paciente,
                talla: talla_paciente,
                reaccion: reaccion_paciente,
                requerimientos: requerimientos_paciente,
                tiempo: tiempo_requerimientos,
                sangre_derivados: sangre_derivados,
                asfixia: asfixia_paciente,
                razon_asfixia: razon_asfixia,
                apgar: apgar_paciente,
                diagnostico_alta: diagnostico_alta
            })
        });
    
    //Inserta la informacion de alimentacion a la BD
    connection.query(`SELECT * FROM pacientes WHERE '${nombre_paciente},
                        AND apellido_paterno = '${apellido_paterno_paciente}' 
                        AND apellido_materno = '${apellido_materno_paciente}' 
                        AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async(_error11, results11) => {
            //Obtenemos el id del paciente al cual se va asociar la informacion
            const idPaciente = results11[0].id;
            //Insertamos la informacion en la BD
            connection.query('INSERT INTO alimentacion SET ?', {
                id_paciente: idPaciente,
                seno_materno: seno_materno,
                formulas: formulas,
                ablactacion: ablactacion,
                destete: destete,
                dieta_actual: dieta_actual
            })
        });

    //Inserta la informacion de inmunizaciones a la BD
    connection.query(`SELECT * FROM pacientes WHERE '${nombre_paciente},
                        AND apellido_paterno = '${apellido_paterno_paciente}' 
                        AND apellido_materno = '${apellido_materno_paciente}' 
                        AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async(_error12, results12) => {
            
            //Obtenemos el id del paciente al cual se va asociar la informacion
            const idPaciente = results12[0].id;

            const tamiz_neonatal = [tn_met, tn_aud];
            const bcg = [bcg_tub, bcg_aHep];
            const poliomelitis = [polio2, polio4, polio6];
            const pentavalente = [penta2, penta4, penta6];
            const revacunaciones = [revac2, revac4, revac6];

            //Insertamos la informacion en la BD
            connection.query('INSERT INTO inmunizaciones SET ?', {
                id_paciente: idPaciente,
                tamiz_neonatal: tamiz_neonatal,
                bcg: bcg,
                poliomelitis: poliomelitis,
                pentavalente: pentavalente,
                triple_viral: triple_viral,
                revacunaciones: revacunaciones,
                influenza: influenza,
                neumococo: neumococo,
                hepatitis: hepatitis,
                varicela: varicela,
                otras: otras_inmunizaciones
            })

        });


    //Inserta la informacion de antecedentes personales a la BD
    connection.query(`SELECT * FROM pacientes WHERE '${nombre_paciente},
                        AND apellido_paterno = '${apellido_paterno_paciente}' 
                        AND apellido_materno = '${apellido_materno_paciente}' 
                        AND fecha_nacimiento = '${fecha_nacimiento}'`,
        async(_error13, results13) => {
            
            //Obtenemos el id del paciente al cual se va asociar la informacion
            const idPaciente = results13[0].id;

            const exantematicas = [exa1, exa2, exa3, exa4];
            const infecciones_respiratorias = [ir1, ir2, ir3, ir4, ir5, ir6, ir7, ir8, ir9, ir10, ir11, ir12];


            //Insertamos la informacion en la BD
            connection.query('INSERT INTO inmunizaciones SET ?', {
                id_paciente: idPaciente,
                reflujo: reflujo,
                ictericia: ictericia,
                onfalitis: onfalitis,
                exantematicas: exantematicas,
                anemia: anemia,
                baso_peso: bajo_peso,
                desnutricion: desnutricion,
                diarreas: diarreas,
                deshidratacion: deshidratacion,
                conjuntivitis: conjuntivitis,
                otitis: otitis_supurada,
                infecciones_respiratorias: infecciones_respiratorias,
                paperas: paperas,
                hepatitis: hepatiti,
                infecciones_urinarias: infecciones_urinarias,
                tifoidea: tifoidea,
                alergias_medicamentos: alergias_medicamentos,
                alergias_alimentos: alergias_alimentos,
                alergias_otros: alergias_otros,
                hospitalizaciones: hospitalizaciones,
                operaciones: operaciones
            })

        });


}