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

let createQuery = `CREATE TABLE IF NOT EXISTS messages (
			uuid uuid,
                        time timestamp,
                        date text,
                        message text,
			PRIMARY KEY (date, uuid, time)
		   );`;


let dropTable = `DROP TABLE IF EXISTS messages;`;


let insertQuery = `INSERT INTO messages (uuid, time, date, message) VALUES (?, ?, ?, ?);`;


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
		console.log('inserting...');
		let date = event.data.split(',')[0];
		let msg = event.data.split(',')[1];
		let params = [Uuid.random(), new Date().toISOString(), date, msg];
		client.execute(insertQuery, params, {prepare: true}, (err) => {
			if (err) throw err;
			console.log('inserted message!');
			return 'inserted message';
		});
	}

}



