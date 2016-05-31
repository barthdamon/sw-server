'use strict';

const config = require('./../lib/config');
const CronJob = require('cron').CronJob;
const _ = require('lodash');
const redis = require('redis').createClient(config.redis.uri); // eslint-disable-line
const Notification = require('./../models/NotificationSchema');
const todd = require('./../models/todd');
const rp = require('request-promise');
const Promise = require('bluebird');

Promise.promisifyAll(redis);

console.log(`Notification Service Syncing`);
sendOverdueNotifications();

function sendOverdueNotifications() {
	const publish = function publishNotification(notification) {
		sendPublishRequest(notification);
	}
	let sentNotifications = [];
	const report = configureReport();

	Notification.find({sent: false}).exec()
		.then(notifications => {
			const now = new Date().toUTCString();
			sentNotifications = notifications.filter(notification => {
				const scheduledDate = new Date(notification.scheduledDate);
				const scheduledMS = +new Date(scheduledDate);
				// Note, new dates from strings are always UTC, even if they say they are EDT....
				const nowMS = +new Date(now);
				const overdue = scheduledMS <= nowMS;
				console.log(`Scheduled: ${scheduledMS}, now: ${nowMS}`);
				console.log(`OVERDUE: ${scheduledDate.toUTCString()}, ${now}, ${overdue}`);
				return notification.sent == false && overdue;
			});
			console.log(`Notifications to send: ${JSON.stringify(sentNotifications)}`);
			if (sentNotifications.length > 0) {
				const action = sentNotifications.map(publish);
				return Promise.promisifyAll(action, {multiArgs: true})
			} else {
				return Promise.resolve()
			}
		})
		.then(result => {
			const notificationIds = sentNotifications.map(notification => { return _.get(notification, "_id") });
			console.log(`Updating notifications as sent: ${notificationIds}`);
			return Notification.update({_id: {$in: notificationIds}}, {sent: true}, {multi: true}).exec()
		})
		.then(result => {
			const alert = sentNotifications.length > 0;
			todd.alertTaskProgress(`Notification task ran with ${sentNotifications.length} notifications sent: ${sentNotifications}`, report, alert);
		})
		.catch(err => {
			const alert = sentNotifications.length > 0;
			todd.alertTaskProgress(`Error running notification task for ${sentNotifications.length} overdue notifications: ${sentNotifications}, Error: ${err}`, report, alert);
		})
	.done();
}

function sendPublishRequest(notification) {
	return new Promise(function(resolve, reject) {
		const options = {
			uri: notification.url,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"x-access-token": notification.organization.accessToken
			},
			body: {
				message: notification.message,
				platform: notification.platform
			},
			json: true
		};

		return rp(options)
			.then(response => {
				console.log(`response recieved successfully ${response}`);
				resolve(true);
			})
			.catch(err => {
				console.log(`error sending publish request: ${err}`);
				reject(err);
			})
		.done();
	});
}

function configureReport() {
	const report = {
		channels: [
			{
				webhook_url: config.slackbot.webhook_url_odd,
				name: '#client-scheduler',
				toddBot: null
			}
		]
	}

	report.channels.forEach(channel => {
		channel.toddBot = todd.initialize(channel.webhook_url);
	});
	return report;
}

