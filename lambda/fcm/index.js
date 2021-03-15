
var admin = require("firebase-admin");
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const nodemailer = require("nodemailer");

var serviceAccount = {
    "type": "service_account",
    "project_id": "quizinato",
    "private_key_id": "41e9410224a43302d394012776b31ed4368f3678",
    //"private_key": "--STORED IN LAMBDA ENV VARIABLE--",
    "client_email": "firebase-adminsdk-ezxmk@quizinato.iam.gserviceaccount.com",
    "client_id": "115775733444854823989",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ezxmk%40quizinato.iam.gserviceaccount.com"
}


serviceAccount["private_key"] = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://quizinato-default-rtdb.firebaseio.com"
});

var db = admin.database();

/*
stat
    0: challenge sent
    1: challenge accepted
*/

exports.handler = async (event) => {
    var { user, opp, categ, stat } = event.queryStringParameters;
    //var { sourceIp, userAgent } = event.requestContext.identity;

    var fcm_token = (await db.ref(`users/${opp}/fcm_token`).once("value")).val();

    if (fcm_token) {
        await admin.messaging().sendToDevice(fcm_token,
            {
                "data": {
                    "notification": JSON.stringify({
                        "user": user,
                        "categ": categ,
                        "stat": stat
                    })
                }
            })
    }

    var mail = (await db.ref(`users/${opp}/mail`).once("value")).val();

    if (mail) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'quizzard.webapp@gmail.com',
                pass: 'aykdplktfrzdeaky'
            }
        });



        var mailOptions = {
            from: 'quizzard.webapp@gmail.com',
            to: mail,
            subject: 'QUIZINATO Notification',
            html: 
            `<center>
            <div style="font-size:larger; font-weight:bold; text-decoration:underline">QUIZINATO Notification</div><br><br>
            <div style="font-size:larger"><b>${user}</b><br> has ${stat==0?"Challenged you":"completed your challenge"} in<br><b>${categ}</b><br><br></div>
            <a 
            style="display: inline-block;font-weight: 400;line-height: 1.5;text-align: center;
            text-decoration: none;vertical-align: middle;border: 1px solid transparent;padding: .375rem .75rem;
            font-size: 1rem;border-radius: .25rem;color: #fff;background-color: #0d6efd;border-color: #0d6efd;"
            
            href="https://quizinato.web.app?notif=1" >View ${stat==0?"CHALLENGE":"RESULTS"}</a><br><br>
            <img src="https://quizinato.web.app/icons/logo-small.png">
            </center>`
        };
        await transporter.sendMail(mailOptions);
    } 

    return ({
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: 200,
        body: (fcm_token ? "FCM_DONE " : "notif-disabled") + (mail ? "Mail_SENT" : "mail-disabled"),
    });
};