const path = require('path');
const _ = require('lodash');
const pluralize = (noun, count, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

module.exports = function (qualityFilter) {
  this.qualityFilter = qualityFilter;

  /**
   * From the query results, only get mp3 with free slots.
   * The fastest results are going to be first.
   *
   * @param  {array}
   * @return {array}
   */
  this.filter = (res) => {
    res = filterByFreeSlot(res);
    res = keepOnlyMp3(res);
    res = filterByQuality(res);
    res = sortBySpeed(res);
    const filesByUser = getFilesByUser(res);
    return filesByUser;
  };
};

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
 * If a quality filter is defined, keep only the folders with the defined bitrate
 * @param {array} res
 * @returns {array}
 */
let filterByQuality = (res) => {
  if (this.qualityFilter) {
    res = res.filter((r) => r.bitrate === parseInt(this.qualityFilter, 10));
  }

  return res;
};

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
    extraInfo.push(`bitrate: ${getAverageBitrate(rawFilesByUser[prop])}kbps`);

    // Size
    extraInfo.push(`size: ${getFolderSize(rawFilesByUser[prop])}mb`);

    // Speed
    extraInfo.push(`speed: ~${getSpeed(rawFilesByUser[prop])}kb/s`);

    filesByUser[`${prop} (${extraInfo.join(', ')})`] = rawFilesByUser[prop];
  }

  return filesByUser;
};
