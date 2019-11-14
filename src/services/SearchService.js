module.exports = function(queries) {
  this.queries = queries;

  /**
   * Return the next query to process
   *
   * @return {Object}
   */
  this.getNextQuery = () => {
    return this.queries[0];
  };

  /**
   * Return true if there is no pending searches
   *
   * @return {boolean}
   */
  this.allSearchesCompleted = () => {
    return this.queries.length === 0;
  };

  /**
   * Remove the first query of the query list
   */
  this.consumeQuery = () => {
    return this.queries.splice(0, 1);
  };
};
