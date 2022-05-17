import { getIntl, getLocale } from 'umi';

const intl = getIntl();
const CURRENT_LOCALE = getLocale();
const LOCATION_CONNECTOR = intl.formatMessage({ id: 'geodist.locationConnector' }) + ' ';

export function parseGithubProfile(rawSQLResult) {
  const profile = {
    id: rawSQLResult.id,
    login: rawSQLResult.login,
    name: rawSQLResult.name,
    avatarUrl: rawSQLResult.avatar_url,
    htmlUrl: rawSQLResult.html_url,
    country: _githubProfileCountry(rawSQLResult),
    company: _githubProfileCompany(rawSQLResult),
    location: _githubProfileLocation(rawSQLResult),
  };

  return profile;
}

function _githubProfileCountry(rawSQLResult: object) {
  const { country_inferred_from_location } = rawSQLResult;
  if (isNaN(parseInt(country_inferred_from_location))) {
    return country_inferred_from_location;
  }
  // If country inferred from location is a number, use other inferred countries
  const { from_email_cctld, from_email_domain_company, from_company } = rawSQLResult;

  for (const inferredCountry of [from_email_cctld, from_email_domain_company, from_company]) {
    if (inferredCountry != '') {
      return inferredCountry;
    }
  }

  return '';
}

function _githubProfileCompany(rawSQLResult: object) {
  const { company } = rawSQLResult;
  if (!!company) {
    // TODO
    // If company is written without care, like super short abbreviation
    // For example, RE for RedHat, MS for Microsoft
    // Then we should use:
    // const final_company_inferred_from_company = rawSQLResult[37];
    return company;
  }

  return rawSQLResult.company_inferred_from_email_domain_company;
}

function _githubProfileLocation(rawSQLResult: object) {
  // xxx's original field is inferred_from_location__xxx
  const continent = rawSQLResult[43];
  const {
    administrative_area_level_1,
    administrative_area_level_2,
    administrative_area_level_3,
    colloquial_area,
    locality,
    political,
    route,
    street_number,
  } = rawSQLResult;

  // Remove the empty location items and concatenate them together
  let locationItems = [
    continent,
    administrative_area_level_1,
    administrative_area_level_2,
    administrative_area_level_3,
    colloquial_area,
    locality,
    political,
    route,
    street_number,
  ];

  if (CURRENT_LOCALE == 'en_US') {
    locationItems.reverse();
  }

  // location is rawSQLResult[22]
  // TODO Some special situation:
  // If location is set to 'Asia / Remote', then the geolocator can just infer the continent, while the
  // important info 'Remote' is dropped
  return locationItems.filter((item) => !!item).join(LOCATION_CONNECTOR);
}
