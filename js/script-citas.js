//Variables y constantes
const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
const divMenu = document.getElementById("menu-nav");
const dateCitas = document.getElementById('fecha-citas');
const formCitas = document.getElementById('form-citas');
const submitCitas = document.getElementById('submit-citas');
const selectHoras = document.getElementById('hora-citas');

//Al iniciar la pagina
window.onload = () => {
    botonesInformacion();
    cambiaLoginARegistro();
}


/******** FUNCIONES *********/

//Funcion encargada de los eventos de los botones de informacion
function botonesInformacion() {

    //Eventos para el apartado del Login
    const botonLogin = document.getElementById("btn-login");
    const botonCerrarLogin = document.getElementById("boton-cerrarLogin");
    const idLogin = "popup-login";
    botonLogin.addEventListener('click', abreInfo(idLogin));
    botonCerrarLogin.addEventListener('click', abreInfo(idLogin));

    //Eventos para el menu desplegable
    botonMenu.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.toggle('show');
        allHTML.body.classList.toggle('noScroll');
    });

}

//Funcion que se encarga de abrir un recuadro de informacion dependiendo la eleccion del usuario
function abreInfo(idPopup) {
    return function (e) {
        e.preventDefault();
        if (divMenu.classList.contains('show')) {
            divMenu.classList.remove('show');
            allHTML.body.classList.remove('noScroll');
        }
        blurMain();
        const popup = document.getElementById(idPopup);
        popup.classList.toggle('active');
        allHTML.body.classList.toggle('noScroll');
    };
}

//Funcion que se encarga de poner el fondo con filtro blur
function blurMain() {
    const blurBody = document.querySelector('main');
    const blurHeader = document.querySelector('header');
    const blurFooter = document.querySelector('footer');
    blurBody.classList.toggle('active');
    blurHeader.classList.toggle('active');
    blurFooter.classList.toggle('active');
}

//Funcion para ver ventana de login o registro
function cambiaLoginARegistro() {

    const divLogin = document.getElementById('inicio-sesion');
    const divRegistro = document.getElementById('registro-usuario');
    const botonARegistro = document.getElementById('aRegistro');
    const botonALogin = document.getElementById('aLogin');

    botonARegistro.addEventListener('click', (e) => {
        e.preventDefault();
        divLogin.classList.add('hide');
        divRegistro.classList.remove('hide');
    });

    botonALogin.addEventListener('click', (e) => {
        e.preventDefault();
        divRegistro.classList.add('hide');
        divLogin.classList.remove('hide');
    });

}

//Permite elegir cualquier dia de la semana excepto el domingo
function calendarioConsultorio() {
    var dia = new Date(dateCitas.value).getUTCDay();
    limpiarHTML(selectHoras);
    dateCitas.setCustomValidity('');
    if (dia == 0) {
        dateCitas.setCustomValidity('Domingos no disponibles. Selecciona otro día.');
    } else {
        dateCitas.setCustomValidity('');
        horarioDisponible(dia);
    }
    if (!formCitas.checkValidity()) {
        submitCitas.click();
    }
}

//Muestra el horario disponible dependiendo el dia que haya seleccionado el usuario
function horarioDisponible(dia) {
    var diaActual = new Date().getDay();
    if (dia >= 1 || dia <= 5) {
        if (diaActual == dia) {
            var horaActual = new Date().getHours();
            muestraHoras(horaActual, 20);
        } else {
            muestraHoras(0, 20);
        }
    } else if (dia == 6) {
        muestraHoras(0, 14);
    }
}

//Anexa las horas disponibles al HTML
function muestraHoras(hora, horaCierre) {
    for (var i = hora+1; i <= horaCierre; i++) {
        const opcion1 = document.createElement('option');
        const opcion2 = document.createElement('option');
        if (i >= 10 && i < 12) {
            opcion1.value = `${i}am`;
            opcion1.textContent = `${i}:00 am`;
            opcion2.value = `${i}.5am`;
            opcion2.textContent = `${i}:30 am`;
        } else if (i == 12) {
            opcion1.value = `${i}pm`;
            opcion1.textContent = `${i}:00 pm`;
            opcion2.value = `${i}.5pm`;
            opcion2.textContent = `${i}:30 pm`;
        } else if ((i > 12 && i <= 13) || (i >= 16 && i <= 19)) {
            opcion1.value = `${i - 12}pm`;
            opcion1.textContent = `${i - 12}:00 pm`;
            opcion2.value = `${i - 12}.5pm`;
            opcion2.textContent = `${i - 12}:30 pm`;
        }
        if (opcion1.textContent !== "" || opcion2.textContent !== "") {
            selectHoras.appendChild(opcion1);
            selectHoras.appendChild(opcion2);
        }
    }
}

//Limpiar cualquier listado que se haya creado en el HTML
function limpiarHTML(elementToClean) {
    while (elementToClean.firstChild) {
        elementToClean.removeChild(elementToClean.firstChild);
    }
}