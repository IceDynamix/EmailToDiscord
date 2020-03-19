/**
 * Save files of a Gmail Thread to Google Drive
 *
 * @param {GoogleAppsScript.Gmail.GmailThread} mailThread
 * @return {GoogleAppsScript.Drive.File[]}
 */
function saveAttachmentsToGDrive(mailThread) {
    let message = mailThread.getMessages()[0];
    let attachments = message.getAttachments();
    let attachmentArray = [];


    for (let i = 0; i < attachments.length; i++) {
        let attachment = attachments[i];
        let file = createFilename(attachment, message, i);
        attachmentArray.push(saveAttachment(attachment, file));
    }

    return attachmentArray;
}

/**
 * Get the extension of a file
 *
 * @param  {string} name
 * @return {string}
 */
function getExtension(name) {
    let result = /(?:\.([^.]+))?$/.exec(name);
    return result && result[1] ? result[1].toLowerCase() : "unknown";
}

/**
 * Apply template vars
 *
 * @param {GoogleAppsScript.Gmail.GmailAttachment} attachment
 * @param {GoogleAppsScript.Gmail.GmailMessage} message
 * @param {string}
 */
function createFilename(attachment, message, index) {
    let filename = DRIVE_FILENAME_TEMPLATE;
    let info = {
        "name": attachment.getName(),
        "ext": getExtension(attachment.getName()),
        "from": getSenderEmailFromMessage(message),
        "y": ("0000" + (message.getDate().getFullYear())).slice(-4),
        "m": ("00" + (message.getDate().getMonth() + 1)).slice(-2),
        "d": ("00" + (message.getDate().getDate())).slice(-2),
        "h": ("00" + (message.getDate().getHours())).slice(-2),
        "i": ("00" + (message.getDate().getMinutes())).slice(-2),
        "s": ("00" + (message.getDate().getSeconds())).slice(-2),
        "ac": index,
    }

    let keys = Object.keys(info).sort(function (a, b) {
        return b.length - a.length;
    });

    for (const key of keys)
        filename = filename.replace(new RegExp("\\$" + key, "g"), info[key]);

    return filename;
}

/**
 * Saves the file to a given path in the Google Drive
 *
 * @param {GoogleAppsScript.Gmail.GmailAttachment} attachment
 * @param {string} path
 */

function saveAttachment(attachment, path) {
    let parts = path.split("/");
    let file = parts.pop();
    path = parts.join("/");

    let folder = getOrMakeFolder(path);
    let check = folder.getFilesByName(file);
    if (check.hasNext()) {
        Logger.log(path + "/" + file + " already exists. File not overwritten.");
        return check.next();
    }

    file = folder.createFile(attachment)
        .setName(file)
        .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    Logger.log(path + "/" + file + " saved.");
    return file;
}

/**
 * Returns the Google Drive folder object matching the given path
 *
 * Creates the path if it doesn't exist.
 *
 * @param {string} path
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getOrMakeFolder(path) {
    let driveFolder = DriveApp.getRootFolder();
    let names = path.split("/");
    while (names.length) {

        let name = names.shift();
        if (name === "") continue;

        let folders = driveFolder.getFoldersByName(name);

        if (folders.hasNext())
            driveFolder = folders.next();
        else
            driveFolder = driveFolder.createFolder(name);
    }

    return driveFolder;
}
