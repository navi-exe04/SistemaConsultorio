const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
const divMenu = document.getElementById("menu-nav");

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