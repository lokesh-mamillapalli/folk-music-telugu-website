/**
 * Google Apps Script — paste into https://script.google.com (New project), then Run ▶ listSongFiles.
 *
 * It finds the Drive folder  Telugu Folk Songs / Andhra , makes every audio file in it
 * viewable by anyone with the link, and saves a file called "drive-files.csv" (name,id)
 * in that same folder. Download that CSV and put it in the andhra-songs/ folder.
 */
const PARENT_FOLDER = "Telugu Folk Songs";
const AUDIO_FOLDER = "Andhra";

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
      continue; // skip anything that isn't 001.mp3 … 102.mp3 (e.g. an older drive-files.csv)
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
  if (rows.length !== 102) {
    Logger.log("WARNING: expected 102 files (001.mp3 to 102.mp3). Check that the upload finished.");
  }
}
