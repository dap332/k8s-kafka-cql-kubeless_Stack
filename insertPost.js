const fs = require('fs');
const readline = require('readline');
const http = require('http');

const newsStream = fs.createReadStream('newsdata.csv', {encoding: 'utf-8'});

const rl = readline.createInterface({
        input: newsStream,
        crlfDelay: Infinity,
        terminal: false
});
let count = 0;
rl.on('line', (line) => {
	post(line, count);
	count++;
}).on('close', () => {});


function post (message, count) {
	const options = {
		hostname: <YOUR HOSTNAME HERE>,
		port: 80,
		path: '/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const postData = JSON.stringify({
		'topic': 'test-topic',
		'data': message
	});

	const req = http.request(options, (res) => {
		console.log('Status: ', res.statusCode);
		res.on('data', (d) => (console.log(d.toString('utf-8'))));
	}); 
	req.on('error', (e) => {
		console.log(e);
	});
	console.log("--> " + count);
	req.write(postData);
	req.end();
}
