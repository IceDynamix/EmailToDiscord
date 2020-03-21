/**
 * Checks if the given email fulfills the whitelist conditions
 *
 * @param {string} email
 * @returns {boolean}
 */
function isWhitelisted(email) {
    if (!email)
        return false;
    else
        return EMAIL_WHITELIST.includes(email) || EMAIL_SUFFIX_WHITELIST.includes(email.split("@")[1]);
}

function getSenderEmailFromMessage(message) {
    let sender = message.getFrom();

    if (sender.includes("<"))
        return /<(.*)>/.exec(message.getFrom()).slice(-1)[0];
    else
        return sender;
}

function reduceContentWhitespace(content) {
    content = content.split("\n")
        .map(x => x.trim())
        .join("\n");

    while (content.includes("\n\n\n"))
        content = content.replace("\n\n\n", "\n\n");

    return content;
}

/**
 * Returns list of mail threads that come from a whitelisted email and has not been sent yet
 *
 * @returns {GoogleAppsScript.Gmail.GmailThread[]}
 */
function getValidThreads() {
    let threads = GmailApp.getInboxThreads(0, MAX_EMAIL_CHECK);
    let validThreads = [];

    for (const thread of threads) {
        if (!thread) continue;

        let emailMessage = thread.getMessages()[0];
        let senderEmail = getSenderEmailFromMessage(emailMessage);

        // The label is used to check if a message has been sent already
        let label = GmailApp.getUserLabelByName(EMAIL_LABEL);
        let previouslySent = thread.getLabels().includes(label);

        // False if the keyword is mandatory and not in the subject
        let fulfillsKeywordRequirements = !(CHECK_FOR_KEYWORD && !emailMessage.getSubject().includes(POST_KEYWORD));

        if (isWhitelisted(senderEmail) && !previouslySent && fulfillsKeywordRequirements)
            validThreads.push(thread);
    }

    return validThreads.reverse(); // oldest first for chronological order in discord
}

/**
 *
 * @param {GoogleAppsScript.Gmail.GmailThread} mailThread
 */
function postEmailToDiscord(mailThread) {
    let emailMessage = mailThread.getMessages()[0];
    let senderEmail = getSenderEmailFromMessage(emailMessage);
    let emailSubject = emailMessage.getSubject();
    let timestamp = emailMessage.getDate().toISOString();

    let attachments = saveAttachmentsToGDrive(mailThread);
    let attachmentList = [];

    if (attachments.length > 0) {
        let hyperlinks = attachments.map(x => `- [${x.getName()}](${x.getDownloadUrl()})`);
        attachmentList = [
            {
                "name": "Anhänge", // German for "Attachments"
                "value": hyperlinks.join("\n")
            }
        ];
    }

    let titlePayload = JSON.stringify({
        "embeds": [
            {
                "title": emailSubject,
                "color": EMBED_COLOR,
                "timestamp": timestamp,
                "author": {
                    "name": senderEmail,
                    "icon_url": DEFAULT_DISCORD_AVATAR // default discord profile picture
                },
                "fields": attachmentList
            }
        ]
    });

    postPayloadToDiscord(titlePayload);

    // Some people simply don't know how to manage whitespace in messages...
    // Why do you need 3 linebreaks for every sentence you type?
    let cleanEmailBody = reduceContentWhitespace(emailMessage.getPlainBody());

    // If a message is larger than 2000 or 2048 characters, then Discord won't let us post it
    let splitMessages = splitEmailBody(cleanEmailBody);

    splitMessages.forEach(message => postContentMessageToDiscord(message));
}

function splitEmailBody(emailBody) {
    if (emailBody.length >= 2000 - 4) { // -4 for the ">>> " quoting
        let lines = emailBody.split("\n").map(x => x + "\n");
        let lineLengths = lines.map(x => x.length);
        let lineGroups = [];

        let localGroup = [];
        let localGroupSum = 0;

        for (let i = 0; i < lineLengths.length; i++) {
            let lineLength = lineLengths[i];

            if (localGroupSum + lineLength >= 2000) {
                lineGroups.push(localGroup);
                localGroup = [];
                localGroupSum = 0;
            }

            localGroup.push(i);
            localGroupSum += lineLength;
        }

        lineGroups.push(localGroup);

        let messages = [];

        for (const group of lineGroups) {
            let message = "";
            for (const lineNumber of group)
                message += lines[lineNumber];
            messages.push(">>> " + message);
        }

        return messages;

    } else {
        return [">>> " + emailBody];
    }
}
