// Select members with this role (ID):
export const SELECT_ROLE = '794608682834198578';
export const SELECT_ROLE_NICKNAME = 'L4-non-se';

// Block roles
// keys are the block numbers from the CSV file,
// values are the role names from Discord
export function getBlockRole(blockValue) {
  const blockRoleMap = {
    '1': '1149706610982264903', // L4
    '2': '1149706669232771143', // L5
    '3': '1149706993813176452', // L6
    '3P': '761289612068388874', // placement-student
    '4': '1149706993813176452', // L6
  };

  return blockRoleMap[blockValue] || null;
}

// Course roles
// keys are the course names from the CSV file,
// values are the role names from Discor
export function getCourseRole(courseName) {
  const courseRoleMap = {
    'BSC (HONS) COMPUTER SCIENCE': '1149706797553303655', // comsci
    'MENG COMPUTER SCIENCE': '1149706797553303655', // comsci
    'BSC (HONS) BUSINESS INFORMATION SYSTEMS': '1149707295656267789', // bis
    'BSC (HONS) COMPUTING': '1149707654906789889', // computing
    'BSC (HONS) SOFTWARE ENGINEERING': '1149707019692036156', // softeng
    'BSC (HONS) COMPUTER NETWORKS': '1149707187401269309', // networks-bsc
    'BSC (HONS) DATA SCIENCE AND ANALYTICS': '1149707119784894657', // datascience-bsc
    'BSC (HONS) CYBER SECURITY AND FORENSIC COMPUTING': '1149707254514335875', // cyfor
  };

  return courseRoleMap[courseName] || null;
}

export const BLOCK_ROLE_MAP = {
  '1': '1149706610982264903',
  '2': '1149706669232771143',
  '3': '1149706993813176452',
  '3P': '761289612068388874',
  '4': '1149706993813176452',
  '4A': '861998118102368276',
  '5': '861998118102368276',
};

// Add the test role to the selected members
export const TEST_ROLE = '1150577623332814920'; // test4

export const ERROR_ROLE = '1150525936698142810'; // error

// Roles (ID) to remove from selected members
export const REMOVED_ROLES = [
  SELECT_ROLE,
];

export const POST_ROLE = '760456815724593152'; // post-grad
