const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const collection = require('./mongodb');

const tempelatePath = path.join(__dirname, '../template');

app.use(express.json());
app.set('view engine', 'hbs');
app.set('views', tempelatePath);
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
});

app.post('/signup', async(req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password,
    }

    await collection.insertMany(data)

    res.render('login')
})

app.listen(3000, () => console.log('Server running on port 3000'));