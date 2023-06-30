const { MongoClient } = require('mongodb');
const{ ObjectId } = require('mongodb').ObjectId;
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
var parseUrl = require('body-parser');

async function main() {
    /**
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

	const uri = "mongodb://127.0.0.1:27017/eventsList";
	const client = new MongoClient(uri, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	});
	try {
		// Connect to the MongoDB cluster
		await client.connect();
		// Make the appropriate DB calls
		await init(client);

	} catch (e) {
		console.error(e);
	}
}
main().catch(console.err);


async function init(client) {
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	const db = client.db('eventList')
	const events = db.collection('events')

	app.get('/init', function (req, res) {
		events.insertOne({
			text: "Some Helpful event",
			start_date: new Date(2018, 8, 1),
			end_date: new Date(2018, 8, 5)
		})
		events.insertOne({
			text: "Another Cool Event",
			start_date: new Date(2018, 8, 11),
			end_date: new Date(2018, 8, 11)
		})
		events.insertOne({
			text: "Super Activity",
			start_date: new Date(2018, 8, 9),
			end_date: new Date(2018, 8, 10)
		})
		res.send("Test events were added to the database")
	});

	app.get('/data', function (req, res) {
		events.find().toArray(function (err, data) {
			//set the id property for all client records to the database records, which are stored in ._id field
			for (var i = 0; i < data.length; i++){
				data[i].id = data[i]._id;
				delete data[i]["!nativeeditor_status"];
			}
			//output response
			res.send(data);
		});
	});


	// Routes HTTP POST requests to the specified path with the specified callback functions.

	app.post('/data', function (req, res) {
		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted"){
				tid = data._id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}

		if (mode == "updated") {
			events.updateOne({"_id": ObjectId(tid)}, {$set: data}, update_response);
		} else if (mode == "inserted") {
			events.insertOne(data, update_response);
		} else if (mode == "deleted") {
			events.deleteOne({"_id": ObjectId(tid)}, update_response)
		} else
			res.send("Not supported operation");
	});
};



var mysql = require('mysql');

let encodeUrl = parseUrl.urlencoded({ extended: false });

//session middleware
app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

app.use(cookieParser());

var con = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "123456789", // my password
    database: "userbase"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/sign_up.html');
})

app.post('/register', encodeUrl, (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.Password;
	var physics = req.body.Physics;
	var chemistry = req.body.Chemistry;
	var mathemathics = req.body.Mathemathics;
	var biology = req.body.Biology;
	var computerscience = req.body.ComputerScience;
	var humanities = req.body.Humanities;
	var commerce = req.body.Commerce;
	var socialscience = req.body.SocialScience;
	var age = req.body.age;
	var agreement = req.body.Agreement;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM users WHERE email = '${email}' AND password  = '${password}'`, function(err, result){
            if(err){
                console.log(err);
            };
			// if user already registered, also add a fail page in the future
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/sign_in.html');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    name: name,
                    email: email,
                    password: password,
					physics: physics,
					chemistry: chemistry,
					mathemathics: mathemathics,
					biology: biology,
					computerscience: computerscience,
					humanities: humanities,
					commerce: commerce,
					socialscience: socialscience,
					age: age,
					agreement: agreement 
                };

                res.sendFile(__dirname + '/home.html');
            }
                // inserting new user data
                var sql = `INSERT INTO users (name, email, password, physics, chemistry, mathemathics, biology, computerscience, humanities, commerce, socialscience, age, agreement) VALUES ('${name}', '${email}', '${password}', '${physics}', '${chemistry}', '${mathemathics}', '${biology}', '${computerscience}', '${humanities}', '${commerce}', '${socialscience}', '${age}', '${agreement}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });
        }
        });
    });
});


app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/sign_in.html");
});

// get user data to /dashboard page
app.post("/dashboard", encodeUrl, (req, res)=>{
    var email = req.body.email;
    var password = req.body.password;

    con.connect(function(err) {
        if(err){
            console.log(err);
        };
//get user data from MySQL database
        con.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, function (err, result) {
          if(err){
            console.log(err);
          };
// creating userPage function to create user page
          function userPage(){
            // We create a session for the dashboard (user page) page and save the user data to this session:
            req.session.user = {
                name: result[0].name, // get MySQL row data
                email: email,
                password: password 
            };

            res.sendFile(__dirname + '/home.html');
        }

        if(Object.keys(result).length > 0){
            userPage();
        }else{
            res.sendFile(__dirname + '/sign_in.html');
        }

        });
    });
});

// Binds listens for connections on the specified host and port. This method is identical to Node’s http.Server.listen().
app.listen(port, () => {
	console.log("Server is running on port " + port + "...");
});
 