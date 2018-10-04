const http = require('http');
const kafka = require('kafka-node'),
    //dns to connect to zookeeper
    //since cluster ip can change if svc goes down we use dns
    //dns is found using <svc-name>.<namespace>.svc.cluster.local
    client = new kafka.Client("zookeeper.kubeless.svc.cluster.local:2181");
    producer = new kafka.Producer(client);
    console.log("readying producer...");
    producer.on('ready', () => {
        console.log('kafka conn is ready to push to');
    })


producer.on('error', (err) => {
    console.log(err);
//    throw err;
})

console.log('Client connected');



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


function pushToKafka(payload){

return new Promise((resolve, reject) => {
        producer.on('error', (err)=> {
            reject(err);
        });


        producer.send(payload, (err, data) => {
            if(err) reject(err);
            // client.close(() => {
            //console.log('sent msg');
            resolve('sent msgi\t', payload.messages);
            //});
        });
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
		let text = await http_post(postData);i
		postData = JSON.stringify({"headline": headline, "publish_date": publishDate, "score": text[0]});
		let payload = [{topic: "insert-topic", messages: postData, partition: 0}];
	
	//	console.log(headline, text);

		text = await pushToKafka(payload);
		return text;
	}
}
