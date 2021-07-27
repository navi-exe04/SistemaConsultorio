//Se llama al modulo de express para poder usarlo
const express = require('express');
const app = express();

//Se establece una vista con ejs
app.set('view engine', 'ejs');

//Establecemos la ruta predeterminada para los recursos
app.use(express.static('public'));
app.use('/resources', express.static(__dirname+'/public'));

//Se establece la ruta de cada vista del proyecto
app.get('/',(req,res) => {
    res.render('index');
});
app.get('/citas',(req,res) => {
    res.render('citas');
});
app.get('/contacto',(req,res) => {
    res.render('contacto');
});
app.get('/login',(req,res) => {
    res.render('login');
});
app.get('/system',(req,res) => {
    res.render('system');
});
//Se inicializa el servidor
app.listen(3000,(req,res) => {
    console.log('SERVIDOR INICIADO EN PORT 3000');
});