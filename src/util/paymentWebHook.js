const axios = require("axios");

let charges = {};

function waitPaymentWebHook(charge, config = {}) {
  return new Promise((resolve, reject) => {
    if (typeof charges[charge.id] == "undefined") {
      charges[charge.id] = {
        createdAt: new Date(),
        status: "pending",
      };

      charges[charge.id].iv = setInterval(() => {
        console.log("Interval_check::" + charge.id);
        if (charges[charge.id].status != "pending") {
          clearInterval(charges[charge.id].iv);
          clearTimeout(charges[charge.id].to);
          if (charges[charge.id].status == "successful") {
            resolve(charges[charge.id]);
          } else {
            let error = new Error(charges[charge.id].failure_message);
            error.data = charges[charge.id].data;
            reject(error);
          }
        }
      }, 1000);

      charges[charge.id].to = setTimeout(async () => {
        console.log("Call_check::" + charge.id);

        if (charges[charge.id].status == "pending") {
          let result = await axios.get(
            `https://api.omise.co${charge.location}`,
            {
              auth: {
                username: config.secretKey,
                password: "",
              },
            }
          );
          receivePaymentWebHook(result);
        }

        clearTimeout(charges[charge.id].to);
      }, 5000);
    }
  });
}

function receivePaymentWebHook(body) {
  let chargeId = body.data.id;
  let status = body.data.status;
  let failure_code = body.data.failure_code;
  let failure_message = body.data.failure_message;
  let data = body.data;

  charges[chargeId].status = status
  charges[chargeId].failure_code = failure_code
  charges[chargeId].failure_message = failure_message
  charges[chargeId].data = data
}

module.exports = {
  waitPaymentWebHook,
  receivePaymentWebHook,
};
