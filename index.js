// Server.js
const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require("cors");
const EmployeeModel = require('./models/Employee');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/zahi");

// Ruta para el registro de usuarios
app.post('/RegisterForm', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new EmployeeModel({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword
        });
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (error) {
        console.error('Error al guardar empleado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por su correo electrónico
        const user = await EmployeeModel.findOne({ email });

        // Si no se encuentra el usuario, devuelve un error
        if (!user) {
            return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        // Comparar la contraseña proporcionada con la contraseña almacenada
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        // Si todo está bien, el inicio de sesión es exitoso
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
