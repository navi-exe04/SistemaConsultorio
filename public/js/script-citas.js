//Variables y constantes
const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
const divMenu = document.getElementById("menu-nav");
const dateCitas = document.getElementById('fecha_citas');
const formCitas = document.getElementById('form-citas');
const submitCitas = document.getElementById('submit-citas');
const selectHoras = document.getElementById('hora_citas');

//Al iniciar la pagina
window.onload = () => {
    botonesInformacion();
}


/******** FUNCIONES *********/

//Funcion encargada de los eventos de los botones de informacion
function botonesInformacion() {

    //Eventos para el menu desplegable
    botonMenu.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.toggle('show');
        allHTML.body.classList.toggle('noScroll');
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
            opcion1.value = `${i}:00 am`;
            opcion2.value = `${i}:30 am`;
            opcion1.textContent = `${i}:00 am`;
            opcion2.textContent = `${i}:30 am`;
        } else if (i == 12) {
            opcion1.value = `${i}:00 pm`;
            opcion2.value = `${i}:30 pm`;
            opcion1.textContent = `${i}:00 pm`;
            opcion2.textContent = `${i}:30 pm`;
        } else if ((i > 12 && i <= 13) || (i >= 16 && i <= 19)) {
            opcion1.textContent = `${i - 12}:00 pm`;
            opcion2.textContent = `${i - 12}:30 pm`;
        }
        if (opcion1.value !== "" || opcion2.value !== "") {
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