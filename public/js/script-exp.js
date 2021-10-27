import { allHTML, divMenu } from "./script.js";

window.onload = () => {
    botonConfiguracion();
}

function botonConfiguracion() {
    
    const botonCrearExp = document.getElementById('boton-crear-exp');
    const botonCerrarCrearExp = document.getElementById('boton-cerrarCrearExp');
    const idCrearExp = "popup-exp";
    botonCrearExp.addEventListener('click', abreConfig(idCrearExp));
    botonCerrarCrearExp.addEventListener('click', abreConfig(idCrearExp));

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