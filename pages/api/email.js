export default async function (req, res) {
    let nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      port: 25,
      host: `${process.env.NEXT_PUBLIC_SMTP_URL}`,
      secure: false,
    })
    // console.log("CHeck Body")
    // console.log(req.body)
    // console.log("CHeck Body")
    const mailData = await {
      from: 'finance@sakafarma.com (no reply)',
      to: req.body.email,
      subject: `Your Request No:${req.body.claim_id} has been Paid`,
      text: `Your Request No:${req.body.claim_id} has been Paid to your bank account.` +" | Automatic Sent from: finance@sakafarma.com",
      html: `<div>Your claim has been Paid to your bank account.</div><p>Automatic Sent from: finance@sakafarma.com</p>`
    }
    await transporter.sendMail(mailData, function (err, info) {
      if(err){
        console.log(err)
        res.status(400)
        res.end("Failed")
      }
      else{
        console.log(info)
        res.status(200)
        res.end("Success")
      }
    })
    res.status(200)
    res.end("Success")
  }