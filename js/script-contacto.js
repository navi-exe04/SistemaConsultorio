const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
const divMenu = document.getElementById("menu-nav");

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
        if(divMenu.classList.contains('show')) {
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