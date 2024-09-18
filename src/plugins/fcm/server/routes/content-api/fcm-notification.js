'use strict';

module.exports = [
    {
        method: 'POST',
        path: '/token',
        handler: 'fcm.token',
        config: {
            policies: [],
        },
    },
    // {
    //     method: 'GET',
    //     path: '/fcm-notifications/count',
    //     handler: 'fcm-notification.count',
    //     config: {
    //         policies: [],
    //     },
    // },
    // {
    //     method: 'GET',
    //     path: '/fcm-notifications',
    //     handler: 'fcm-notification.find',
    //     config: {
    //         policies: [],
    //     },
    // },
    // {
    //     method: 'GET',
    //     path: '/fcm-notifications/:id',
    //     handler: 'fcm-notification.findOne',
    //     config: {
    //         policies: [],
    //     },
    // },
    // {
    //     method: 'POST',
    //     path: '/fcm-notifications',
    //     handler: 'fcm-notification.create',
    //     config: {
    //         policies: [],
    //     },
    // },
    // {
    //     method: 'PUT',
    //     path: '/fcm-notifications/:id',
    //     handler: 'fcm-notification.update',
    //     config: {
    //         policies: [],
    //     },
    // },
    // {
    //     method: 'DELETE',
    //     path: '/fcm-notifications/:id',
    //     handler: 'fcm-notification.delete',
    //     config: {
    //         policies: [],
    //     },
    // },
];
