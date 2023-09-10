// Select members with this role (ID):
export const SELECT_ROLE = '761289612068388874';
export const SELECT_ROLE_NICKNAME = 'placement-student';

// Who have this block number in the CSV file:
export const BLOCK = '4';

// Course roles
// keys are the course names from the CSV file,
// values are the role names from Discord
export function getCourseRole(courseName) {
  const courseRoleMap = {
    'BSC (HONS) COMPUTER SCIENCE': '1149706797553303655', // comsci
    'BSC (HONS) BUSINESS INFORMATION SYSTEMS': '1149707295656267789', // bis
    'BSC (HONS) COMPUTING': '1149707654906789889', // computing
    'BSC (HONS) SOFTWARE ENGINEERING': '1149707019692036156', // softeng
    'BSC (HONS) COMPUTER NETWORKS': '1149707187401269309', // networks-bsc
    'BSC (HONS) DATA SCIENCE AND ANALYTICS': '1149707119784894657', // datascience-bsc
    'BSC (HONS) CYBER SECURITY AND FORENSIC COMPUTING': '1149707254514335875', // cyfor
  };

  return courseRoleMap[courseName] || null;
}

// Roles (ID) to add to selected members
export const ADDED_ROLES = [
  '1150521303745441996', // test1
  '1149706993813176452', // L6
];

// Roles (ID) to remove from selected members
export const REMOVED_ROLES = [
  '761289612068388874', // placement-student
];
