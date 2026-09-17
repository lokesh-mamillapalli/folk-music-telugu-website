/**
 * Google Apps Script — paste into https://script.google.com (New project), then Run ▶ listSongFiles.
 *
 * It finds the Drive folder  Telugu Folk Songs / Telangana , makes every audio file in it
 * viewable by anyone with the link, and saves a file called "drive-files.csv" (name,id)
 * in that same folder. Download that CSV and put it in the telangana-songs/ folder.
 *
 * Steps before running this:
 *   1. In Google Drive, open (or create) a folder named "Telugu Folk Songs".
 *   2. Inside it, create a folder named "Telangana".
 *   3. Upload every file from telangana-songs/audio/ (001.mp3 … 103.mp3) into that folder.
 *   4. Come back here, paste this script, and run listSongFiles (see the walkthrough you used
 *      for the Andhra songs — the steps are identical, just with the "Telangana" folder name).
 */
const PARENT_FOLDER = "Telugu Folk Songs";
const AUDIO_FOLDER = "Telangana";
const EXPECTED_COUNT = 103;

function listSongFiles() {
  const parents = DriveApp.getFoldersByName(PARENT_FOLDER);
  if (!parents.hasNext()) {
    throw new Error(`Folder "${PARENT_FOLDER}" not found in your Drive`);
  }
  const children = parents.next().getFoldersByName(AUDIO_FOLDER);
  if (!children.hasNext()) {
    throw new Error(`Folder "${AUDIO_FOLDER}" not found inside "${PARENT_FOLDER}"`);
  }
  const folder = children.next();

  const rows = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    if (!/^\d{3}\.mp3$/i.test(name)) {
      continue; // skip anything that isn't 001.mp3 … 103.mp3 (e.g. an older drive-files.csv)
    }
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    rows.push([name, file.getId()]);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));

  const old = folder.getFilesByName("drive-files.csv");
  while (old.hasNext()) {
    old.next().setTrashed(true);
  }
  const csv = ["name,id"].concat(rows.map((r) => r.join(","))).join("\n");
  folder.createFile("drive-files.csv", csv, MimeType.CSV);

  Logger.log(`Found ${rows.length} audio files. Saved drive-files.csv in "${PARENT_FOLDER}/${AUDIO_FOLDER}".`);
  if (rows.length !== EXPECTED_COUNT) {
    Logger.log(`WARNING: expected ${EXPECTED_COUNT} files (001.mp3 to ${String(EXPECTED_COUNT).padStart(3, "0")}.mp3). Check that the upload finished.`);
  }
}
