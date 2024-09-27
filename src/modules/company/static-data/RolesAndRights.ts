const commonPermissions = [
  {
    permissionName: 'No Access',
    permissionValue: 'no-access',
  },
  {
    permissionName: 'Read',
    permissionValue: 'read',
  },
  {
    permissionName: 'Read/Write',
    permissionValue: 'read/write',
  },
];

export const rolesMenuList = [
  { menuName: 'General', menuValue: 'general', orderNumber: 1 },
  { menuName: 'Content Library', menuValue: 'content-library', orderNumber: 2 },
  { menuName: 'Phishing', menuValue: 'phishing', orderNumber: 3 },
  { menuName: 'Training', menuValue: 'training', orderNumber: 4 },
  { menuName: 'Suvey', menuValue: 'suvey', orderNumber: 5 },
  { menuName: 'Reporting', menuValue: 'reporting', orderNumber: 6 },
];

export const rolesCategoryList = [
  {
    menuValue: 'general',
    orderNumber: 1,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Account Settings',
        categoryValue: 'account-settings',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Audit Log',
        categoryValue: 'audit-log',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: [
          {
            permissionName: 'No Access',
            permissionValue: 'no-access',
          },
          {
            permissionName: 'Show',
            permissionValue: 'show',
          },
        ],
      },
      {
        orderNumber: 3,
        categoryName: 'User Groups & Departments',
        categoryValue: 'user-groups-departments',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 4,
        categoryName: 'ASAP',
        categoryValue: 'asap',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 5,
        categoryName: 'Campaigns',
        categoryValue: 'campaigns',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
  {
    menuValue: 'content-library',
    orderNumber: 2,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Content',
        categoryValue: 'content',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Upload Content',
        categoryValue: 'upload-content',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Brandable Content & Content Manager',
        categoryValue: 'brandable-content-content-manager',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
  {
    menuValue: 'phishing',
    orderNumber: 3,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Phishing Campaigns',
        categoryValue: 'phishing-campaigns',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: true,
        groups: [],
        departments: [],
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Phishing Template',
        categoryValue: 'phishing-template',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: true,
        groups: [],
        departments: [],
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 3,
        categoryName: 'Phishing landing Page',
        categoryValue: 'phishing-landing-page',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 4,
        categoryName: 'Phishing Reports',
        categoryValue: 'phishing-reports',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
  {
    menuValue: 'training',
    orderNumber: 4,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Training Campaigns',
        categoryValue: 'training-campaigns',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Training Notification Templates',
        categoryValue: 'training-notification-templates',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 3,
        categoryName: 'Policy Management',
        categoryValue: 'policy-management',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 4,
        categoryName: 'Training Reports',
        categoryValue: 'training-reports',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
  {
    menuValue: 'suvey',
    orderNumber: 5,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Suvey',
        categoryValue: 'suvey',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: true,
        groups: [],
        departments: [],
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Suvey Reports',
        categoryValue: 'suvey-reports',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
  {
    menuValue: 'reporting',
    orderNumber: 6,
    categories: [
      {
        orderNumber: 1,
        categoryName: 'Reporting',
        categoryValue: 'reporting',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
      {
        orderNumber: 2,
        categoryName: 'Send Report',
        categoryValue: 'send-report',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: [
          {
            permissionName: 'No Access',
            permissionValue: 'no-access',
          },
          {
            permissionName: 'Read/Write',
            permissionValue: 'read/write',
          },
        ],
      },
      {
        orderNumber: 3,
        categoryName: 'Executive Report',
        categoryValue: 'executive-report',
        currentValue: 'no-access',
        isGroupOrDeptAvailable: false,
        possibleCapability: commonPermissions,
      },
    ],
  },
];

// export default [
//   {
//     menuName: 'General',
//     menuValue: 'general',
//     catgories: [
//       {
//         categoryName: 'Account Settings',
//         categoryValue: 'account-settings',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Audit Log',
//         categoryValue: 'audit-log',
//         currentValue: 'no-access',
//         permissions: [
//           {
//             permissionName: 'No Access',
//             permissionValue: 'no-access',
//           },
//           {
//             permissionName: 'Show',
//             permissionValue: 'show',
//           },
//         ],
//       },
//       {
//         categoryName: 'User Groups & Departments',
//         categoryValue: 'user-groups-departments',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'ASAP',
//         categoryValue: 'asap',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Campaigns',
//         categoryValue: 'campaigns',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//     ],
//   },
//   {
//     menuName: 'Content Library',
//     menuValue: 'content-library',
//     catgories: [
//       {
//         categoryName: 'Content',
//         categoryValue: 'content',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Upload Content',
//         categoryValue: 'upload-content',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Brandable Content & Content Manager',
//         categoryValue: 'brandable-content-content-manager',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//     ],
//   },
//   {
//     menuName: 'Phishing',
//     menuValue: 'phishing',
//     catgories: [
//       {
//         categoryName: 'Phishing Campaigns',
//         categoryValue: 'phishing-campaigns',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//         groups: [],
//         departments: [],
//       },
//       {
//         categoryName: 'Phishing Template',
//         categoryValue: 'phishing-template',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Phishing landing Page',
//         categoryValue: 'phishing-landing-page',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Phishing Reports',
//         categoryValue: 'phishing-reports',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//     ],
//   },
//   {
//     menuName: 'Training',
//     menuValue: 'training',
//     catgories: [
//       {
//         categoryName: 'Training Campaigns',
//         categoryValue: 'training-campaigns',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//         groups: [],
//         departments: [],
//       },
//       {
//         categoryName: 'Training Notification Templates',
//         categoryValue: 'training-notification-templates',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Policy Management',
//         categoryValue: 'policy-management',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Training Reports',
//         categoryValue: 'training-reports',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//         groups: [],
//         departments: [],
//       },
//     ],
//   },
//   {
//     menuName: 'Suvey',
//     menuValue: 'suvey',
//     catgories: [
//       {
//         categoryName: 'Suvey',
//         categoryValue: 'suvey',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//         groups: [],
//         departments: [],
//       },
//       {
//         categoryName: 'Suvey Reports',
//         categoryValue: 'suvey-reports',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//     ],
//   },
//   {
//     menuName: 'Reporting',
//     menuValue: 'reporting',
//     catgories: [
//       {
//         categoryName: 'Reporting',
//         categoryValue: 'reporting',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//       {
//         categoryName: 'Send Report',
//         categoryValue: 'send-report',
//         currentValue: 'no-access',
//         permissions: [
//           {
//             permissionName: 'No Access',
//             permissionValue: 'no-access',
//           },
//           {
//             permissionName: 'Read/Write',
//             permissionValue: 'read/write',
//           },
//         ],
//       },
//       {
//         categoryName: 'Executive Report',
//         categoryValue: 'executive-report',
//         currentValue: 'no-access',
//         permissions: commonPermissions,
//       },
//     ],
//   },
// ];
