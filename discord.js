function postContentMessageToDiscord(message) {
    if (!message) return;
    let payload = JSON.stringify({ content: message });
    postPayloadToDiscord(payload);
}

function postPayloadToDiscord(payload) {
    let params = {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        payload: payload,
        muteHttpExceptions: true
    };

    let url = (DEBUG) ? PRIVATE_WEBHOOK_URL : PUBLIC_WEBHOOK_URL;

    let response = UrlFetchApp.fetch(url, params);
    Logger.log(response.getContentText());
}
