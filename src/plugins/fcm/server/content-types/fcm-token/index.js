"use strict";
module.exports = {
  kind: "collectionType",
  collectionName: "fcm_tokens",
  info: {
    singularName: "fcm-token",
    pluralName: "fcm-tokens",
    displayName: "FCM Token",
  },
  options: {
    draftAndPublish: false,
    comment: "",
  },
  attributes: {
    user: {
      type: "relation",
      relation: "manyToOne",
      target: "plugin::users-permissions.user",
      inversedBy: "fcmTokens",
    },
    fcmToken: {
      type: "string",
    },
    platform: {
      type: "string",
    },
  },
};
