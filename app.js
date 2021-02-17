const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./config/db');   
const bodyParser = require('body-parser');

const User = require('./models/User');


dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT || 5000;

const app = express();

//Connection to mongo
connectDb();

//Parse incoming request body
app.use(bodyParser.urlencoded({ extended: false }));

//Routes

//GET request
app.get('/',(request, response) => {
    response.send(`Node API RESTful <br> Go to <a href="http://localhost:${PORT}/api">API</a>`); 
})

app.get('/api', (request, response) => {
    User.find({}, 'username name email')
        .then((result) => {
            response.json(result); 
        })
        .catch((error) => {
            console.error(error);
        });
});

app.get('/api/:user', (request, response) => {
    //Query the user
    const { user } = request.params;
    User.findOne({ username: user })
        .then((result) => {
            //Verify if any user was found
            if(!result) {
                response.send(`${user} was not found`);
            } else {
                response.json(result);
            }
        })
        .catch((error) => {
            console.error(error);
        });
});

//POST request
app.post('/api', (request, response) => {

    const { name, username, email, password } = request.body;

    //Query if username or email are already used
    User.find({ $or: [ { username }, { email } ] })
        .then((user) => {

            //If the object is empty the registration is efectuated
            if(Object.keys(user).length === 0) {
                
                User.create({
                    name,
                    username,
                    email,
                    password
                })
                .then((user) => {
                    response.send(`${name} has been added to the database`);
                })
                .catch((error) => {
                    console.log(error);
                });
            } else {
                //If two objects are founded that means the 
                //username and email are already registered
                if(user.length > 1) {
                    response.send(`username and email already registered!`);
                } else {
                    //Verify either if the username is already registered or the email
                    if(user[0].username === username) {
                        response.send(`username already registered.`);
                    } else {
                        response.send(`email already registered.`);
                    }
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });
});

//PUT request
app.put('/api', (request, response) => {
    const { name, username, email, password } = request.body;
    User.updateOne({ username }, {name, email, password})
        .then((user) => {
            response.send(`${username} has been updated`)
        })
        .catch((error) => {
            console.error(error);
        });
});

//DELETE request
app.delete('/', (request, response) => {
    const { username } = request.body;
    User.deleteOne({ username })
        .then((user) => {
            response.send(`${user} has been removed completely from the database`);
        })
        .catch((error) => {
            console.error(error);
        });
});

//404 handler
app.use((request, response, next) => {
    response.status(404).send("Sorry, request don't found 🤔");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})
