const http = require('http');

let URI = 'sentiment-svc.sentiment.svc.cluster.local';
let PORT = 80;

function http_post(data) {
    const options = {
        hostname: URI,
        port: PORT,
        path: '/predict',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };


    return new Promise( (resolve, reject) => {
    	const req = http.request(options, (res) => {
            res.on('data', (d) => (resolve( d.toString('utf-8'))));
         });
        req.on('error', (e) => reject(e));
	    req.write(data);
        req.end();
    });
      
}



module.exports = {

	predict: async (event, context) => {
		console.log('executing....');
		let title = [];
		let msg = event.data.split(',');
		let headline = msg[1];
		let publishDate = msg[0];
		
		title.push(headline);
		let postData = JSON.stringify({"texts": title});
		let text = await http_post(postData);
		console.log(headline, text);
		return text;
	}
}
