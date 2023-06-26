const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/login').then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.log(err);
})

const LogInSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true,
    }
})

const collection = new mongoose.model('LogIn', LogInSchema);  

module.exports = collection;