const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function handleOps(err, data, callback) {
  if (err) return callback(err);
  else if (!data) return callback(null, { message: "Data not found!", data: null });
  else if (data) return callback(null, { message: "Data Found", data });
}

mongoose
  .connect("mongodb://172.19.0.4/Portfolio", {
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
		user.save({}, callback(err, response))
	}
  }
};

module.exports = models;
