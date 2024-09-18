var admin = require("firebase-admin");

let firebase = null;

module.exports = {
  send: async (entry) => {
    console.log("firebase.send", JSON.stringify(entry, null, 2));
    let payload = {
      notification: {
        title: entry.title.replace(/(<([^>]+)>)/gi, ""),
      },
    };
    if (entry.body) {
      payload.notification.body = entry.body.replace(/(<([^>]+)>)/gi, "");
    }
    if (entry.image) {
      payload.notification.image = entry.image;
    }

    if (entry.payload) {
      payload = { ...payload, ...entry.payload };
    }

    // console.log('payload', payload, 'target is ', entry.target);
    let res = null;

    const tokens = entry.target.split(",");
    if (tokens.length > 1) {
      res = await admin.messaging().sendToDevice(tokens, payload);
    } else {
      res = await admin.messaging().sendToDevice(entry.target, payload);
    }

    res.payload = payload

    return res;
  },
  init: async (strapi) => {
    const { serviceAccount } = await strapi.db
      .query("plugin::fcm.fcm-plugin-configuration")
      .findOne({
        select: ["serviceAccount"],
      });

    firebase = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  },
};

// module.exports = (init) => {
//   if (!firebase) {
//     firebase = admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//   }
//   return firebase
// };
