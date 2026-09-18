/**
 * Google Apps Script — paste into https://script.google.com (New project), then Run ▶ listInstrumentImages.
 *
 * Exactly the same routine you used for the songs, with the folder and file names changed. It finds
 * the Drive folder  Telugu Folk Songs / Instruments , makes every photo in it viewable by anyone with
 * the link, and saves "drive-files.csv" (name,id) in that same folder. Download that CSV and put it in
 * the instrument-images/ folder.
 *
 * Steps before running this:
 *   1. In Google Drive, open your existing folder named "Telugu Folk Songs".
 *   2. Inside it, create a folder named "Instruments".
 *   3. Upload every file from instrument-images/upload/ (andelu.jpg … tappeta.jpg) into that folder.
 *      Upload them as they are — don't rename them, the file name is what maps each photo to its page.
 *   4. Come back here, paste this script, and run listInstrumentImages.
 */
const PARENT_FOLDER = "Telugu Folk Songs";
const IMAGE_FOLDER = "Instruments";
const EXPECTED_COUNT = 20;

function listInstrumentImages() {
  const parents = DriveApp.getFoldersByName(PARENT_FOLDER);
  if (!parents.hasNext()) {
    throw new Error(`Folder "${PARENT_FOLDER}" not found in your Drive`);
  }
  const children = parents.next().getFoldersByName(IMAGE_FOLDER);
  if (!children.hasNext()) {
    throw new Error(`Folder "${IMAGE_FOLDER}" not found inside "${PARENT_FOLDER}"`);
  }
  const folder = children.next();

  const rows = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    if (!/^[a-z-]+\.(jpg|png)$/i.test(name)) {
      continue; // skip anything that isn't an instrument photo (e.g. an older drive-files.csv)
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

  Logger.log(`Found ${rows.length} photo(s). Saved drive-files.csv in "${PARENT_FOLDER}/${IMAGE_FOLDER}".`);
  if (rows.length !== EXPECTED_COUNT) {
    Logger.log(`WARNING: expected ${EXPECTED_COUNT} photos. Check that the upload finished.`);
  }
}
