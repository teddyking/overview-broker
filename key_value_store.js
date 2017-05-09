var request = require('request');

class KeyValueStore {

    constructor() {
        /* Using the same key for every deployed broker is very nasty, but
         * we have no other way of holding on to the token, and you can't use
         * the same token for different keys. Fun fun fun. */
        this.baseUrl = 'https://api.keyvalue.xyz/94f6bbb1/overview_broker';
    }

    loadData(key, callback) {
        if (!this.baseUrl) {
            console.error('Missing key value store URL');
            return;
        }
        request({
            url: this.baseUrl,
            method: 'GET'
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                if (response.body == '\n') {
                    callback({});
                    return;
                }
                var data = JSON.parse(response.body);
                if (key) {
                    callback(data[key]);
                    return;
                }
                callback(data);
            }
            else {
                console.error(error);
                callback(null);
            }
        });
    }

    saveData(key, value, callback) {
        var self = this;
        if (!this.baseUrl) {
            console.error('Missing key value store URL');
            return;
        }
        // Load data first in case it has been changed by another broker
        this.loadData(null, function(data) {
            if (!data) {
                return;
            }
            data[key] = value;
            request({
                url: self.baseUrl,
                method: 'POST',
                json: true,
                body: data
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(true);
                }
                else {
                    console.error(error);
                    callback(false);
                }
            });
        });
    }

}

module.exports = KeyValueStore;
