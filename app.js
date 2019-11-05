const mongoose = require('mongoose');
const express = require("express");
const app = express();
const flash = require('express-flash');
const session = require('express-session');
app.use(flash());

app.use(express.urlencoded({extended: true}));


app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(express.static(__dirname + "/static"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost/quoting_dojo', {useNewUrlParser: true});

const QuoteSchema = new mongoose.Schema({
    quote: { type: String, required: true, minlength: 6},
    date: {type: Date, default: Date.now}
})

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3},
    quotes: [QuoteSchema]
})


// const UserSchema = new mongoose.Schema({
//     name: String,
//     quotes: [{quote: String, date: {type: Date, default: Date.now}}]
// })



const User = mongoose.model('User', UserSchema);
const Quote = mongoose.model('Quote', QuoteSchema);

app.get('/', (request, response) => {
    response.render("index")
    
});

app.post('/quotes', (request, response) => {
    const user = new User();
    user.name = request.body.name;
    const quote = new Quote();
    quote.quote = request.body.quote;
    quote.save()
        .then(newQuote =>{
            user.quotes = [newQuote];
            user.save()
                .then(newUser => {
                    user.quotes.push(request.body.quote)
                    response.redirect('/quotes')
                })
                .catch(err => {
                    console.log("We have an error!", err);
                    for (var key in err.errors) {
                        request.flash('registration', err.errors[key].message);
                    }
                    response.redirect('/');
                });
        })
        .catch(err => {
                    console.log("We have an error!", err);
                    
                    for (var key in err.errors) {
                        
                        request.flash('registration', err.errors[key].message);
                    }
                    response.redirect('/');
                });
});


app.get('/quotes', (request, response) => {
    User.find({})
        .then(users => {
            response.render("quotes", {users:users})
            
        }).catch(err => response.json(err));
    
    
});

// app.post('/users', (req, res) {
//     const user = new User();
//     user.name = request.body.name;
//     user.save()
//     .then(newUserData => console.log('user created: ', newUserData))
//     .catch(err => console.log(err));

//     res.redirect('/');
// })





app.listen(8000, () => console.log("listening on port 8000"));

