'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.REMOVE_ALL_NOTIFICATIONS = exports.REMOVE_NOTIFICATION = exports.ADD_NOTIFICATION = exports.NOTIFICATIONS_POS_TOP_LEFT = exports.NOTIFICATIONS_POS_BOT_LEFT = exports.NOTIFICATIONS_POS_BOT_RIGHT = exports.NOTIFICATIONS_POS_TOP_RIGHT = exports.NOTIFICATION_TYPE_ERROR = exports.NOTIFICATION_TYPE_INFO = exports.NOTIFICATION_TYPE_WARNING = exports.NOTIFICATION_TYPE_SUCCESS = exports.removeAllNotifications = exports.removeNotification = exports.createNotification = exports.Notify = exports.reducer = undefined;

var _Notify = require('./components/Notify');

var _Notify2 = _interopRequireDefault(_Notify);

var _Notifications = require('./modules/Notifications');

var _Notifications2 = _interopRequireDefault(_Notifications);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.reducer = _Notifications2.default;
exports.Notify = _Notify2.default;
exports.createNotification = _Notifications.createNotification;
exports.removeNotification = _Notifications.removeNotification;
exports.removeAllNotifications = _Notifications.removeAllNotifications;
exports.NOTIFICATION_TYPE_SUCCESS = _Notifications.NOTIFICATION_TYPE_SUCCESS;
exports.NOTIFICATION_TYPE_WARNING = _Notifications.NOTIFICATION_TYPE_WARNING;
exports.NOTIFICATION_TYPE_INFO = _Notifications.NOTIFICATION_TYPE_INFO;
exports.NOTIFICATION_TYPE_ERROR = _Notifications.NOTIFICATION_TYPE_ERROR;
exports.NOTIFICATIONS_POS_TOP_RIGHT = _Notifications.NOTIFICATIONS_POS_TOP_RIGHT;
exports.NOTIFICATIONS_POS_BOT_RIGHT = _Notifications.NOTIFICATIONS_POS_BOT_RIGHT;
exports.NOTIFICATIONS_POS_BOT_LEFT = _Notifications.NOTIFICATIONS_POS_BOT_LEFT;
exports.NOTIFICATIONS_POS_TOP_LEFT = _Notifications.NOTIFICATIONS_POS_TOP_LEFT;
exports.ADD_NOTIFICATION = _Notifications.ADD_NOTIFICATION;
exports.REMOVE_NOTIFICATION = _Notifications.REMOVE_NOTIFICATION;
exports.REMOVE_ALL_NOTIFICATIONS = _Notifications.REMOVE_ALL_NOTIFICATIONS;
exports.default = _Notifications2.default;