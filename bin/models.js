const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function handleOps (err, data, callback) {
	if(err) return callback(err);
	else if(!data) return callback(null, {msg: 'Data not found!', data: null});
	else if(data) return callback(null, {msg: 'Data Found', data});
	return;
}

mongoose.connect('mongodb://172.19.0.4/Portfolio', {useNewUrlParser: true, useCreateIndex: true})
	.then(() => console.log('Connected to mongodb2'))
	.catch(error => console.log(error));

const User = mongoose.model('User', (new Schema({
	Name: {type: String, default: null, index: true},
	Email: {type: String, default: null, index: true},
	Password: {type: String}
})))

const models = {
	User,
	Ops: {
		find: (callback, params) => {
			if(!params){
				User.find()
					.then((err, data) => (handleOps(err, data, callback)))
					.catch(error => callback(error));
			} else {
				console.log('TODO set param responses');
				return callback(null, {msg: 'TODO set param responses in bin/model.js'})
			}
		}
	}
}

module.exports = models;
