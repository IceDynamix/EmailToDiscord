/**
 * Runs every hour to post incoming emails to a Discord server via webhook
 */
function runEveryHour() {
    if (!MASTER_TOGGLE) return;

    let emails = getValidThreads();
    if (emails.length == 0) return;

    if (MENTION_ROLE && !DEBUG) // Only mention once per update instead mentioning for every single mail
        postContentMessageToDiscord("<@&" + MENTION_ROLE_ID + ">");

    for (const mail of emails) {
        postEmailToDiscord(mail);
        mail.addLabel(GmailApp.getUserLabelByName(EMAIL_LABEL));
    }
}
