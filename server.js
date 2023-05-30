const express = require('express');
const mysql = require('mysql');
const app = express();
const ejs = require('ejs');
const multer = require("multer");
const bodyParser = require('body-parser');
const axios = require('axios');
const indexRouter = require('./index');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter);

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'Eli2023',
    password: '1234',
    database: 'dbanuario'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error al conectarse a la base de datos: ' + error.stack);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

//INICIO DE SESIÓN
app.get('/', (req,res)=>{
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.render('sesion');
});

    //Validacion de usuario.
app.get('/validaruser', (req, res) =>{
    const us = req.query.user;
    const contra = req.query.pass;

    conexion.query(
        `SELECT * FROM tblalumnos WHERE user = ? AND pass = ?`,
        [us, contra],
        (error, resultsAlumnos) => {
          if (error) throw error;
          // Si el usuario está en la tabla de alumnos.
          if (resultsAlumnos.length > 0) {
            //Si está, redirige.
            res.redirect('/inicioalumnos');
          } else {
            // Si el usuario está en la tabla de profesores.
            conexion.query(
              `SELECT * FROM tblprofesores WHERE user = ? AND pass = ?`,
              [us, contra],
              (error, resultsProfesores) => {
                if (error) throw error;
                // Si está, redirige.
                if (resultsProfesores.length > 0) {
                  res.redirect('/inicioprofes');
                } else {
                  // Si el usuario no está en ninguna tabla.
                var nohayuser = "El usuario o contraseña son incorrectos.";
                res.send('<script>alert("' + nohayuser + '"); window.location.href="/";</script>');
                }
              }
            );
          }
        }
      );
})

//REGISTRO
app.get('/', (req,res)=>{
    res.render('registro');
});

    // Configuracion de multer
const upload = multer({
    dest: 'public/imagenes',
    fileFilter : function(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg)$/)){
            return cb(new Error('Solo se permiten archivos JPG'));
        }
        cb(null, true);
    }// fin del fileFilter
})// fin del multer


    //Insertar registro
app.post('/registrar', upload.single('file'), (req, res) => {
    var Nom = req.body.nombre;
    var Con = req.body.nocontrol;
    var Cor = req.body.correo;
    var Sem = req.body.semestre;
    var Usu = req.body.user;
    var Cont = req.body.pass;
    var Des = req.body.descripcion;
    var picture = req.file ? req.file.filename : '';
    console.log(req.file);
    console.log('¡Conectado');
    var sql = 'INSERT INTO tblalumnos (nombre, nocontrol, correo, semestre, user, pass, descripcion, foto) VALUES(?,?,?,?,?,?,?,?)';
    conexion.query(sql, [Nom, Con, Cor, Sem, Usu, Cont, Des, picture], function(err, result) {
        if (err) {
          var mensaje = "El nombre de usuario ya está en uso.";
          res.send('<script>alert("' + mensaje + '"); window.location.href="/registro";</script>');
        } else {
          if (result.affectedRows > 0) {
            var mensaje = "Registro exitoso";
            res.send('<script>alert("' + mensaje + '"); window.location.href="/";</script>');
          } else {
            var mensaje = "No se pudo insertar el registro";
            res.send('<script>alert("' + mensaje + '"); window.location.href="/registro";</script>');
          }
        }
      });
});

//Insertar registro
app.post('/registrarprofe', upload.single('file'), (req, res) => {
  var Nom = req.body.nombre;
  var Con = req.body.nocontrol;
  var Cor = req.body.correo;
  var Sem = req.body.semestre;
  var Usu = req.body.user;
  var Cont = req.body.pass;
  var Des = req.body.descripcion;
  var picture = req.file ? req.file.filename : '';
  //res.send('Registros cargados correctamente');
  console.log(req.file);
  console.log('¡Conectado');
  var sql = 'INSERT INTO tblalumnos (nombre, nocontrol, correo, semestre, user, pass, descripcion, foto) VALUES(?,?,?,?,?,?,?,?)';
  conexion.query(sql, [Nom, Con, Cor, Sem, Usu, Cont, Des, picture], function(err, result) {
      if (err) {
        var mensaje = "El nombre de usuario ya está en uso.";
        res.send('<script>alert("' + mensaje + '"); window.location.href="/usuarios";</script>');
      } else {
        if (result.affectedRows > 0) {
          var mensaje = "Registro exitoso";
          res.send('<script>alert("' + mensaje + '"); window.location.href="/usuarios";</script>');
        } else {
          var mensaje = "No se pudo insertar el registro";
          res.send('<script>alert("' + mensaje + '"); window.location.href="/usuarios";</script>');
        }
      }
    });
});

//PÁGINA PRINCIPAL ALUMNOS
app.get('/', (req,res)=>{
    res.render('inicioalumnos');
});

//SECCION PROYECTOS
app.get('/', (req,res)=>{
    res.render('proyectos');
});

app.get('/', (req,res)=>{
  res.render('proyectosprofes');
});

  //Agregar un proyecto
  app.post('/registroproy', (req, res) => {
    var Nom = req.body.nombre;
    var Des = req.body.descripcion;
    var url = req.body.enlace;
    var Prop = req.body.propietario;
    console.log(req.file);
    console.log('¡Conectado');
    var sql = 'INSERT INTO tblproyectos (nombre, descripcion, enlace, propietario) VALUES(?,?,?,?)';
    conexion.query(sql, [Nom, Des, url, Prop], function(err, result) {
        if (err) {
          var noproy = "Error al agregar nuevo proyecto.";
          res.send('<script>alert("' + noproy + '"); window.location.href="/agregarproyecto";</script>');
        } else {
          if (result.affectedRows > 0) {
            var siproy = "Registro exitoso";
            res.send('<script>alert("' + siproy + '"); window.location.href="/proyectos";</script>');
          } else {
            var noproy2 = "No se pudo insertar el registro";
            res.send('<script>alert("' + noproy2 + '"); window.location.href="/agregarproyecto";</script>');
          }
        }
      });
});

//BÚSQUEDA
//alumnos
app.get('/', (req,res)=>{
    res.render('resultados');
});


//PÁGINA PRINCIPAL PROFESORES
app.get('/', (req,res)=>{
    res.render('inicioprofes');
});

//ADMINISTRACIÓN DE ALUMNOS
app.get('/', (req,res)=>{
    res.render('usuarios');
});

  //modificar un usuarios
  app.post('/actualizaruser', (req, res) => {
    const noControl = req.body.nocontrol;
    const campo = req.body.campo;
    const nuevoValor = req.body.valor;
  
    // Actualización del campo en la tabla correspondiente
    const query = `UPDATE tblalumnos SET ?? = ? WHERE nocontrol = ?`;
    console.log(query);
    conexion.query(query, [campo, nuevoValor, noControl], (error, resultado) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error al actualizar el campo');
      } else {
        console.log('Campo actualizado correctamente');
        var mensajeActualizar = `El campo ${campo} se ha actualizado.`;
        res.send('<script>alert("' + mensajeActualizar + '"); window.location.href="/usuarios";</script>');
      }
    });
  });
  

  //Modificar imagen de usuario.
  app.post('/actualizarfoto', upload.single('file'), (req, res) => {
    const noControl = req.body.nocontrol;
    const nombreArchivo = req.file.filename; // Nombre del archivo subido
  
    // Actualización del campo en la tabla correspondiente
    const query = `UPDATE tblalumnos SET foto = ? WHERE nocontrol = ?`;
    console.log(query);
    conexion.query(query, [nombreArchivo, noControl], (error, resultado) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error al actualizar el campo');
      } else {
        console.log('Campo actualizado correctamente');
        var mensajeActualizar = 'La foto se ha actualizado.';
        res.send(`<script>alert("${mensajeActualizar}"); window.location.href="/usuarios";</script>`);
      }
    });
  });


    //Eliminar un usuario.
    app.post('/eliminaruser', (req, res) => {
        const id = req.body.nocontrol;
        console.log(id);
        
        // Eliminación del registro de la tabla correspondiente
        const query = `DELETE FROM tblalumnos WHERE nocontrol = ?`;
        conexion.query(query, [id], (error, resultado) => {
          if (error) {
            console.log(error);
            res.status(500).send('Error al eliminar el registro');
          } else {
            console.log('Registro eliminado correctamente');
            var mensajeeliminar = "Se ha eliminado al alumno.";
          res.send('<script>alert("' + mensajeeliminar + '"); window.location.href="/usuarios";</script>');
          }
        });
      });

      //Eliminar un proyecto.
    app.post('/eliminarproy', (req, res) => {
      const ID = req.body.id;
      console.log();
      
      // Eliminación del registro de la tabla correspondiente
      const query = `DELETE FROM tblproyectos WHERE id = ?`;
      conexion.query(query, [ID], (error, resultado) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error al eliminar el registro');
        } else {
          console.log('Registro eliminado correctamente');
          var eliminproy = "Se ha eliminado el proyecto.";
        res.send('<script>alert("' + eliminproy + '"); window.location.href="/proyectosprofes";</script>');
        }
      });
    });
      

module.exports = conexion;

app.use(express.static(__dirname + '/'));

app.listen(5000, function(){
    console.log('servidor en linea');
})
