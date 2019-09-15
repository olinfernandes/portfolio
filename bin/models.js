const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function handleOps(err, data, callback) {
  if (err) return callback(err);
  else if (!data) return callback(null, { message: "Data not found!", data: null });
  else if (data) return callback(null, { message: "Data Found", data });
}

const dbUrl = '172.19.0.4/Portfolio';

mongoose
  .connect(`mongodb://${dbUrl}`, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log("Connected to mongodb2"))
  .catch(error => console.log(error));

const User = mongoose.model(
  "User",
  new Schema({
    Name: { type: String, default: null, index: true },
    Email: { type: String, default: null, index: true },
    Password: { type: String }
  })
);

module.exports.Modles = {
  User: class extends User {
    constructor(props){
      super(props);
    }
    find (params){
      return new Promise((resolve, reject) => {
        if (!params) {
          User.find()
            .then(response => {
              console.log(response);
              resolve(response);
            })
            .catch(error => {
              console.error(error);
              reject(error);
            })
        } else {
          const { id } = params;
          User.findById(id)
            .then(user =>
              !user
                ? reject({message: "No user found!", user})
                : resolve(user)
            )
            .catch(error => {
              console.log(error);
              reject(error);
            })
        }
      });
    }
  }
}

const models = {
  User,
  Ops: {
    find: (callback, params) => {
      if (!params) {
        User.find().then((response, err) => handleOps(err, response, callback))
      } else {
        console.log("TODO set param responses");
        return callback(null, {
          message: "TODO set param responses in bin/model.js"
        });
      }
	},
	add: (callback, params) => {
		const user = new User({
			Name: params.name,
			Email: params.email,
			Password: params.password
		});
		user.save().then((response, err) => handleOps(err, response, callback))
	}
  }
};

module.exports = models;
