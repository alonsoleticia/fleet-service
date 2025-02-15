const ALL_FIELDS = ''

const SATELLITE_SUMMARISED_FIELDS = "name slug orbit"
const SATELLITE_STATUSES = ['active', 'inactive'];
const SATELLITE_CREATION_ORIGINS = ['inventory', 'manual'];
const SATELLITE_DELETION_ORIGINS = ['manual'];

const BEAM_SUMMARISED_FIELDS = "name linkDirection"
const BEAM_LINK_DIRECTIONS = ['uplink', 'downlink'];
const BEAM_CREATION_ORIGINS = ['inventory', 'manual'];
const BEAM_DELETION_ORIGINS = ['manual'];

const TRANSPONDER_SUMMARISED_FIELDS = "name"
const TRANSPONDER_STATUSES = ['active', 'inactive'];
const TRANSPONDER_CREATION_ORIGINS = ['inventory', 'manual'];
const TRANSPONDER_DELETION_ORIGINS = ['manual'];

const POLARIZATIONS = ['V', 'H', 'LHCP', 'RHCP'];
const POLARIZATIONS_VERBOSE = ['linear vertical polarization', 'linear horizontal polarization', 'left-handed circular polarization', 'right-handed circular polarization'];



module.exports = {
    ALL_FIELDS,
    SATELLITE_SUMMARISED_FIELDS,
    SATELLITE_STATUSES,
    SATELLITE_CREATION_ORIGINS,
    SATELLITE_DELETION_ORIGINS,
    BEAM_SUMMARISED_FIELDS,
    BEAM_LINK_DIRECTIONS,
    BEAM_CREATION_ORIGINS,
    BEAM_DELETION_ORIGINS,
    TRANSPONDER_SUMMARISED_FIELDS,
    TRANSPONDER_STATUSES,
    TRANSPONDER_CREATION_ORIGINS,
    TRANSPONDER_DELETION_ORIGINS,
    POLARIZATIONS,
    POLARIZATIONS_VERBOSE
  };