const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  googleId: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },image: {
    type: String,
    default: 'https://yt3.ggpht.com/ytc/AKedOLS8Yppzg6X9l2tnQOVvKtpLsxYopCDlWgEnwIOmlA=s900-c-k-c0x00ffffff-no-rj'
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("users", userSchema);
