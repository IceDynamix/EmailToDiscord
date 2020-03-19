// Any constant that starts with an underscore in this file is replaced with example data or just censored overall.
// They are being called from another file that is not uploaded in the repository.

const _EMAIL_WHITELIST = [
    "example1@email.com",
    "example2@email.com",
    "example3@email.com",
];

const _EMAIL_SUFFIX_WHITELIST = [
    "example.com",
    "domain.web"
];

const _PUBLIC_WEBHOOK_URL = "https://discordapp.com/api/webhooks/***";
const _PRIVATE_WEBHOOK_URL = "https://discordapp.com/api/webhooks/***";

// Keyword that has to be present in the subject in order to be sent to Discord.
// Requirement of the keyword can be toggled via the CHECK_FOR_KEYWORD constant.
const _POST_KEYWORD = "KEYWORD";

// Labels are used to mark mails that have already been sent.
// This is simply the name of the label to use.
const _EMAIL_LABEL = "LABEL";
const _MENTION_ROLE_ID = "1234567890"; // Using a string because Javascript isn't that cool with large numbers

const DRIVE_FILENAME_TEMPLATE = "Email to Discord/Attachments/$from/$y-$m-$d_$ac_$name";

// Not having to check though 1000 emails every update speeds things up a lot.
// Change to fit your needs.
const MAX_EMAIL_CHECK = 20;
const EMBED_COLOR = 14830157;
const DEFAULT_DISCORD_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

// Is the keyword in the email subject required for now?
const CHECK_FOR_KEYWORD = false;

// Do you want to ping people? Only pings if !DEBUG
const MENTION_ROLE = true;

// Quick toggle when you're testing something and don't necessarily want everyone to notice.
// Toggles the used URL between public/private and disables mentions.
const DEBUG = false;

// Quick toggle for when EVERYTHING goes wrong for some reason.
const MASTER_TOGGLE = true;
