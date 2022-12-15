import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(loginRoute);

// Set session expire after 1 day
Date.prototype.addDate= function(h){
  this.setDate(this.getDate()+h);
  this.setHours(0)
  this.setMinutes(0)
  this.setSeconds(0)
  return this;
}

async function loginRoute(req, res) {
  
  // get new date for next session
  var getDate = new Date().addDate(1);

  // delete previous session
  await req.session.destroy();

  req.session.user = {
    id: 200,
    role: req.body.role,
    nik: req.body.nik,
    name: req.body.name,
    email: req.body.email,
    token: req.body.token,
    uid_user: req.body.uid_user,
    isLogin: true,
    expire: getDate,
    verify: true,
  };
  await req.session.save();
  res.send("Logged in");
  return res.session
}