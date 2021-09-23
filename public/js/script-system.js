import { allHTML, divMenu } from "./script.js";

window.onload = () => {
    botonConfiguracion();
}

function botonConfiguracion() {
    
    const botonConfig = document.getElementById('boton-config');
    const botonCerrarConfig = document.getElementById('boton-cerrarConfig');
    const idConfig = "popup-config";
    botonConfig.addEventListener('click', abreConfig(idConfig));
    botonCerrarConfig.addEventListener('click', abreConfig(idConfig));

    const botonAgregar_Config = document.getElementById('botonAgregar-Config');
    const botonRegresar_Config = document.getElementById('botonRegresar-Config');
    const divListaUsuarios = document.getElementById('lista-user');
    const divAgregarUsuario = document.getElementById('agregar-user');
    botonAgregar_Config.addEventListener('click', () => {
        divListaUsuarios.classList.toggle('active');
        divAgregarUsuario.classList.toggle('active');
    });
    botonRegresar_Config.addEventListener('click', () => {
        divListaUsuarios.classList.toggle('active');
        divAgregarUsuario.classList.toggle('active');
    });

}

function abreConfig(idPopup) {
    return function(e) {
        e.preventDefault();
        if(divMenu.classList.contains('show')) {
            divMenu.classList.remove('show');
            allHTML.body.classList.remove('noScroll');
        }
        blurMain();
        const popup = document.getElementById(idPopup);
        popup.classList.toggle('active');
        allHTML.body.classList.toggle('noScroll');
    }
}

function blurMain() {
    const blurBody = document.querySelector('main');
    const blurHeader = document.querySelector('header');
    const blurFooter = document.querySelector('footer');
    blurBody.classList.toggle('active');
    blurHeader.classList.toggle('active');
    blurFooter.classList.toggle('active');
}