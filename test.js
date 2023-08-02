//this allows you to redirect to home.hbs
const express = require('express')
const app = express()
const port = 3000;

app.set('views', 'views')
app.set('view engine', 'hbs')
app.use(express.static('public'))

app.get ('/', function(request, response){
    response.render('home');
})


app.listen(port)
console.log("Heyyy Node server started on port 3000")