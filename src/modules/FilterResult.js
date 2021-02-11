const path = require('path');
const _ = require('lodash');

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

let filterByFreeSlot = (res) => {
  return res.filter((r) => r.slots === true && r.speed > 0);
};

let keepOnlyMp3 = (res) => {
  return res.filter((r) => path.extname(r.file) === '.mp3');
};

let filterByQuality = (res) => {
  if (this.qualityFilter) {
    res = res.filter((r) => r.bitrate === parseInt(this.qualityFilter, 10));
  }
  return res;
};

let sortBySpeed = (res) => {
  return res.sort((a, b) => b.speed - a.speed);
};

let computeAverageBitrate = (files) => {
  let averageBitrate = 0;

  if (files.length > 0) {
    const sum = files.reduce((a, b) => a + b.bitrate, 0);
    averageBitrate = Math.round(sum / files.length);
  }

  return averageBitrate;
};

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
    extraInfo.push(rawFilesByUser[prop].length + ' files');

    // Bitrate
    extraInfo.push(computeAverageBitrate(rawFilesByUser[prop]) + 'kbps');
    filesByUser[`${prop} (${extraInfo.join(', ')})`] = rawFilesByUser[prop];
  }
  return filesByUser;
};
