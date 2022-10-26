import path from 'path';
import _ from 'lodash';
const pluralize = (noun, count, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

export default function (qualityFilter, mode) {
  this.qualityFilter = qualityFilter;
  this.mode = mode;

  /**
   * From the query results, only get mp3 with free slots.
   * The fastest results are going to be first.
   *
   * @param res
   * @return {array}
   */
  this.filter = (res) => {
    res = filterByFreeSlot(res);

    if (this.mode === 'mp3') {
      res = keepOnlyMp3(res);
    }

    if (this.mode === 'flac') {
      res = keepOnlyFlac(res);
    }

    if (this.qualityFilter) {
      res = filterByQuality(this.qualityFilter, res);
    }

    res = sortBySpeed(res);
    return getFilesByUser(res);
  };
}

/**
 * Discard all results without free slots
 * @param {array} res
 * @returns {array}
 */
let filterByFreeSlot = (res) => res.filter((r) => r.slots === true && r.speed > 0);

/**
 * Remove everything that is not a mp3
 * @param {array} res
 * @returns {array}
 */
let keepOnlyMp3 = (res) => res.filter((r) => path.extname(r.file) === '.mp3');

/**
 * Remove everything that is not a flac
 * @param {array} res
 * @returns {array}
 */
let keepOnlyFlac = (res) => res.filter((r) => path.extname(r.file) === '.flac');

/**
 * If a quality filter is defined, keep only the folders with the defined bitrate
 * @param {string} qualityFilter
 * @param {array} res
 * @returns {array}
 */
let filterByQuality = (qualityFilter, res) => res.filter((r) => r.bitrate === parseInt(qualityFilter, 10));

/**
 * Display the fastest results first
 * @param {array} res
 */
let sortBySpeed = (res) => res.sort((a, b) => b.speed - a.speed);

/**
 * Compute the average bitrate of a folder
 * @param {array} files
 * @returns {Number}
 */
let getAverageBitrate = (files) => {
  let averageBitrate = 0;

  if (files.length > 0) {
    const sum = files.reduce((a, b) => a + b.bitrate, 0);
    averageBitrate = Math.round(sum / files.length);
  }

  return averageBitrate;
};

/**
 * Compute the size of a folder in megabytes
 * @param {array} files
 * @returns {Number}
 */
let getFolderSize = (files) => {
  let size = 0;

  if (files.length > 0) {
    size = Math.round(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024);
  }

  return size;
};

/**
 * Get the speed of the remote peer
 * @param {array} files
 * @returns {Number}
 */
let getSpeed = (files) => {
  let speed = 0;

  if (files.length > 0) {
    speed = Math.round(files[0].speed / 1024);
  }

  return speed;
};

/**
 * Build the result list
 * @param {array} res
 * @returns {object}
 */
let getFilesByUser = (res) => {
  let filesByUser = {};

  const rawFilesByUser = _.groupBy(res, (r) => {
    const resFileStructure = r.file.split('\\');
    const resDirectory = resFileStructure[resFileStructure.length - 2];
    return resDirectory + ' - ' + r.user;
  });

  for (const prop in rawFilesByUser) {
    let extraInfo = [];

    // Number of files
    extraInfo.push(`${pluralize('file', rawFilesByUser[prop].length)}`);

    // Bitrate
    const bitrate = getAverageBitrate(rawFilesByUser[prop]);
    if (bitrate) {
      extraInfo.push(`bitrate: ${bitrate}kbps`);
    }

    // Size
    extraInfo.push(`size: ${getFolderSize(rawFilesByUser[prop])}mb`);

    // Speed
    extraInfo.push(`speed: ~${getSpeed(rawFilesByUser[prop])}kb/s`);

    filesByUser[`${prop} (${extraInfo.join(', ')})`] = rawFilesByUser[prop];
  }

  return filesByUser;
};
