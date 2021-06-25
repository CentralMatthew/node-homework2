const express = require('express');
const expressHbs = require('express-handlebars');
const fs = require('fs/promises');
const path = require('path');

const app = express();

const staticDir = path.join(__dirname, 'static');
const usersPath = path.join(__dirname, 'users.json');

app.use(express.static(staticDir));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', '.hbs');
app.engine('.hbs', expressHbs({
    defaultLayout: false
}));
app.set('views', staticDir);

//-------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/registration', (req, res) => {
    res.render('registration');
})

app.get('/users', async (req, res) => {
    const users = await getUsers();

    res.render('users', {users});

})
app.get('/users/:userId', async (req, res) => {
    const {userId} = req.params;
    const users = await getUsers();
    const user = users[userId];

    res.render('user', {user});

})

//----------------------------------------------------------------------------------------------------------

app.post('/login', async (req, res) => {
    const {login, password} = req.body;
    const users = await getUsers();
    const findedUser = users.find(value => value.login === login && value.password === password);
    const error = !findedUser;

    if (findedUser) {
        res.redirect(`/users/${users.indexOf(findedUser)}`);
        return;
    }


    res.render('error',{error});
})

app.post('/registration', async (req, res) => {
    const {login, password, firstName, lastName, age} = req.body;
    const users = await getUsers();
    const newUser = {login, password, firstName, lastName, age, id: users.length + 1};


    const userExist = users.find(value => value.login === login);
    if (userExist) {
        res.render('error',{userExist});
        return;
    }

    users.push(newUser);
    await fs.writeFile(usersPath, JSON.stringify(users));
    res.redirect('/login');

})


const getUsers = async () => {
    const users = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(users);
}


app.listen(3000, () => {
    console.log('App listen 3000');
})

