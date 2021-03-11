
var admin = require("firebase-admin");
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

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
    var { user,opp, categ, stat } = event.queryStringParameters;
    //var { sourceIp, userAgent } = event.requestContext.identity;

    var fcm_token = (await db.ref(`users/${opp}/fcm_token`).once("value")).val()

    if (fcm_token) {
        admin.messaging().sendToDevice(fcm_token,
        {
            "data": {
                "notification": JSON.stringify({
                    "user": user,
                    "categ":categ,
                    "stat":stat
                })
            }
        })
    }


    return ({
        statusCode: 200,
        body: fcm_token?"DONE":"notif-disabled",
    });
};