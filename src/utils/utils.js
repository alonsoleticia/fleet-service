/**************************************************************
* Auxiliary reusable methods to implement APIs:
**************************************************************/

/**
 * Determines which fields should be selected in the response based on the query parameter.
 * 
 * @param {Object} req - Express request object containing query parameters.
 * @returns {string} A string representing the selected fields.
 *
 * @note This function manages the level of detail in database queries.
 */
const getSelectedFieldsInResponse = (detailed, ALL_FIELDS, SUMMARISED_FIELDS) => {
    const showFullDetails = String(detailed) === "true";
    return showFullDetails ? ALL_FIELDS : SUMMARISED_FIELDS;
}

module.exports = {
    getSelectedFieldsInResponse
};