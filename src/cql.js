const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

//const client = new cassandra.Client({contactPoints:['cassandra-0.cassandra.cassandra.svc.cluster.local'], keyspace: 'demo'});
//client.connect((err, results) => {
//        if (err) throw err;
//        });

/*
let createQuery = `CREATE TABLE IF NOT EXISTS messages (
    			uuid uuid,
    			time timestamp,
    			message text,
    			PRIMARY KEY (uuid, time, message)
    		   );`;

*/

let createQuery = `CREATE TABLE headlines (
		    uuid uuid,
		    time timestamp,
		    message text,
		    score decimal,
		    sentiment int,
		    PRIMARY KEY (uuid, time, message)
		)`;

let dropTable = `DROP TABLE IF EXISTS headlines;`;


let insertQuery = `INSERT INTO headlines (uuid, time, message, score, sentiment) VALUES (?, ?, ?, ?, ?);`;


let client = null;


function init(){
	if (client == null){
		client = new cassandra.Client({contactPoints:['cassandra-0.cassandra.cassandra.svc.cluster.local'], keyspace: 'demo'});
		client.connect((err, results) => {
			if (err) throw err;
			});

	}
}


module.exports = {

	create: (events, context) => {
		init();
		console.log('creating...');
		client.execute(createQuery, (err, result) => {
			if (err) throw err;
			console.log('created table');
			return 'created table'; 
		});
	
	},

	drop : (event, context) => {
		init();
		console.log('dropping...');
		client.execute(dropTable, (err, result) => {
			if (err) throw err; 
			console.log('dropped table');
			return 'dropeed table';
		});
	},

	insert: (event, context) => {
		init();
		console.log('event data: ', event.data);	
		let data = event.data;
		console.log("headline: ", data.headline );
		console.log('inserting...');
		
	
		let msg = data.headline;
		let score = data.score;
		
		let params = [Uuid.random(), new Date().toISOString(), msg, score, Math.ceil( score - 0.5)];
		client.execute(insertQuery, params, {prepare: true}, (err) => {
			if (err) throw err;
			console.log('inserted message!');
			return 'inserted message';
		});
	}

}



