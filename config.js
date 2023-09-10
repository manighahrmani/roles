// Select members with this role:
export const SELECT_ROLE = 'placement-student';

// Who have this block number in the CSV file:
export const BLOCK = '4';

// Course roles
// keys are the course names from the CSV file,
// values are the role names from Discord
export function getCourseRole(courseName) {
  const courseRoleMap = {
    'BSC (HONS) COMPUTER SCIENCE': 'compsi',
    'BSC (HONS) BUSINESS INFORMATION SYSTEMS': 'bis',
    'BSC (HONS) COMPUTING': 'computing',
    'BSC (HONS) SOFTWARE ENGINEERING': 'softeng',
    'BSC (HONS) COMPUTER NETWORKS': 'networks-bsc',
    'BSC (HONS) DATA SCIENCE AND ANALYTICS': 'datascience-bsc',
    'BSC (HONS) CYBER SECURITY AND FORENSIC COMPUTING': 'cyfor',
  };

  return courseRoleMap[courseName] || null;
}

// Roles (ID) to add to selected members
export const ADDED_ROLES = [
  '1149738387033559140', // test
  '1149706993813176452', // L6
];

// Roles (ID) to remove from selected members
export const REMOVED_ROLES = [
  '761289612068388874', // placement-student
];
