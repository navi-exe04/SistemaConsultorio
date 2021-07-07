const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
const divMenu = document.getElementById("menu-nav");

//Al iniciar la pagina
window.onload = () => {
    botonesInformacion();
    sliderAutomatico();
    cambiaLoginARegistro();
}


/******** FUNCIONES *********/ 

//Funcion encargada del slider de imagenes
function sliderAutomatico() {

    //Timer para el Slider de imagenes
    var counter = 1;
    setInterval(function(){
        document.getElementById('radio' + counter).checked = true;
        counter++;
        if(counter > 6) {
            counter = 1;    
        }
    }, 4500);


}
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

    //Eventos para el apartado de informacion profesional
    const botonProfesional = document.getElementById("info-profesional");
    const botonCerrarProfesional = document.getElementById("boton-cerrarProfesional");
    const idProfesional = "popup-profesional";
    botonProfesional.addEventListener('click', abreInfo(idProfesional));
    botonCerrarProfesional.addEventListener('click', abreInfo(idProfesional));

    //Eventos para el apartado de mision y vision
    const botonMision = document.getElementById("info-mision");
    const botonCerrarMision = document.getElementById("boton-cerrarMision");
    const idMision = "popup-mision";
    botonMision.addEventListener('click', abreInfo(idMision));
    botonCerrarMision.addEventListener('click', abreInfo(idMision));

    //Eventos para el apartado de valores
    const botonValores = document.getElementById("info-valores");
    const botonCerrarValores = document.getElementById("boton-cerrarValores");
    const idValores = "popup-valores";
    botonValores.addEventListener('click', abreInfo(idValores));
    botonCerrarValores.addEventListener('click', abreInfo(idValores));

    //Eventos para el apartado de servicios
    const botonServicios = document.getElementById("info-servicios");
    const botonCerrarServicios = document.getElementById("boton-cerrarServicios");
    const idServicios = "popup-servicios";
    botonServicios.addEventListener('click', abreInfo(idServicios));
    botonCerrarServicios.addEventListener('click', abreInfo(idServicios));

    //Eventos para el apartado de covid-19
    const botonCovid = document.getElementById("info-covid");
    const botonCerrarCovid = document.getElementById("boton-cerrarCovid");
    const idCovid = "popup-covid";
    botonCovid.addEventListener('click', abreInfo(idCovid));
    botonCerrarCovid.addEventListener('click', abreInfo(idCovid));

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