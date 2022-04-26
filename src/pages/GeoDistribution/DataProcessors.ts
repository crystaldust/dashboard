import { getIntl, getLocale } from 'umi';

const intl = getIntl();
const CURRENT_LOCALE = getLocale();
const LOCATION_CONNECTOR = intl.formatMessage({ id: 'geodist.locationConnector' }) + ' ';

export function parseGithubProfile(rawSQLResult) {
  const profile = {
    id: rawSQLResult[2],
    login: rawSQLResult[1],
    name: rawSQLResult[19],
    avatarUrl: rawSQLResult[4],
    htmlUrl: rawSQLResult[7],
    country: _githubProfileCountry(rawSQLResult),
    company: _githubProfileCompany(rawSQLResult),
    location: _githubProfileLocation(rawSQLResult),
  };

  return profile;
}

function _githubProfileCountry(rawSQLResult: any[]) {
  const country_inferred_from_location = rawSQLResult[35];
  if (isNaN(parseInt(country_inferred_from_location))) {
    return country_inferred_from_location;
  }
  // If country inferred from location is a number, use other inferred countries
  const from_email_cctld = rawSQLResult[33];
  const from_email_domain_company = rawSQLResult[34];
  const from_company = rawSQLResult[36];

  for (const inferredCountry of [from_email_cctld, from_email_domain_company, from_company]) {
    if (inferredCountry != '') {
      return inferredCountry;
    }
  }

  return '';
}

function _githubProfileCompany(rawSQLResult: any[]) {
  let company = rawSQLResult[20];
  if (!!company) {
    // TODO
    // If company is written without care, like super short abbreviation
    // For example, RE for RedHat, MS for Microsoft
    // Then we should use:
    // const final_company_inferred_from_company = rawSQLResult[37];
    return company;
  }

  // rawSQLResult[38] is company_inferred_from_email_domain_company
  return rawSQLResult[38];
}

function _githubProfileLocation(rawSQLResult: any[]) {
  // xxx's original field is inferred_from_location__xxx
  const continent = rawSQLResult[43];
  const administrative_area_level_1 = rawSQLResult[39];
  const administrative_area_level_2 = rawSQLResult[40];
  const administrative_area_level_3 = rawSQLResult[41];
  const colloquial_area = rawSQLResult[42];
  const locality = rawSQLResult[45];
  const political = rawSQLResult[46];
  const route = rawSQLResult[50];
  const street_number = rawSQLResult[51];

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

  return locationItems.filter((item) => item != '').join(LOCATION_CONNECTOR);
}
