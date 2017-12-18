const express = require('express');
const consolidate = require('consolidate');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('pg');

const app = express();

const pool = new pg.Pool({
	host: 'localhost',
	port: 5432,
	database: 'anothertwitterdb',
	user: 'anothertwitteruser',
	password: 'anotherpassword'
});

pool.query(`
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(15) NOT NULL UNIQUE,
		password VARCHAR NOT NULL
	);
`);

app.set('views', './templates');
app.engine('html', consolidate.nunjucks);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/static', express.static('./static'));

app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/profile/:id', function(req, res) {
	const id = req.params.id;

	pool.query(`SELECT * FROM users WHERE id = ${id}`)
	.then(function(results) {
		const user = results.rows[0];
		
		if (user) {
			res.render('profile.html', {
				username: '@' + user.username,
				tweets: [
					'hi',
					'hello',
					'third tweet',
					'fourth tweet'
				]
			});
		} else {
			res.render('error.html');
		}
	});
});

app.post('/signup', function(req, res) {
	pool.query(`
		INSERT INTO users (username, password)
		VALUES ('${req.body.username}', '${req.body.password}');
	`).then(function() {
		pool.query(`
			SELECT * FROM users WHERE username = '${req.body.username}';`
		).then(function(results) {
			const user = results.rows[0];
			res.redirect('/profile/' + user.id);
		});
	});
});

app.listen(4000, function() {
	console.log('Server is now running at localhost:4000');
});