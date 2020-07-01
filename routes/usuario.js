var express = require('express');
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//==============================
// Obtener todos los usuarios
//==============================
app.get('/', (req, res) => {

    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                usuarios: usuarios
            });

        });
});

//==============================
// Actualizar un nuevo usuario
//==============================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando al usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con id: ' + id + ' no existe',
                errors: { message: 'El usuario no existe' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//==============================
// Insertar un nuevo usuario
//==============================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    //Para realizar esto es necesario el Body Parser
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});

//==============================
// Eliminar un nuevo usuario
//==============================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    
    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con ese id no existe',
                errors: { message: 'El usuario con ese id no existe' }
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;