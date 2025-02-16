const constants = {
  ALL_FIELDS: '',
  
  SATELLITE: {
    NAME_MIN_LENGTH: 3,
    SLUG_MIN_LENGTH: 3,
    SUMMARISED_FIELDS: "name slug orbit",
    STATUSES: ['active', 'inactive'],
    CREATION_ORIGINS: ['inventory', 'manual'],
    DELETION_ORIGINS: ['manual'],
    LONGITUDE_RANGE: [-180, 180],
    LATITUDE_RANGE: [-90, 90],
    DEFAULT_HEIGHT: 35786.063, // Km
    MIN_HEIGHT: 0, //Km
    DEFAULT_INCLINATION: 0,
  },

  BEAM: {
    NAME_MIN_LENGTH: 3,
    SUMMARISED_FIELDS: "name linkDirection",
    LINK_DIRECTIONS: ['uplink', 'downlink'],
    CREATION_ORIGINS: ['inventory', 'manual'],
    DELETION_ORIGINS: ['manual'],
  },

  TRANSPONDER: {
    NAME_MIN_LENGTH: 2,
    SUMMARISED_FIELDS: "name",
    STATUSES: ['active', 'inactive'],
    CREATION_ORIGINS: ['inventory', 'manual'],
    DELETION_ORIGINS: ['manual'],
    MIN_FREQUENCY: 0, // General validation
    MIN_BANDWIDTH: 0, // General validation
  },

  POLARIZATIONS: ['V', 'H', 'LHCP', 'RHCP'],
  POLARIZATIONS_VERBOSE: [
    'linear vertical polarization', 
    'linear horizontal polarization', 
    'left-handed circular polarization', 
    'right-handed circular polarization'
  ]
};

module.exports = constants;
