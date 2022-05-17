export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/low_code_platform',
    name: 'lowCodePlatform',
    icon: 'rocket',
    component: './LowCodePlatform',
  },
  {
    path: '/geo_distribution',
    name: 'geoDist',
    icon: 'global',
    component: './GeoDistribution',
  },
  {
    path: '/chart_image',
    name: 'charImageDownload',
    icon: 'LineChart',
    component: './CriticalityScoreDownload',
  },
  {
    path: '/add_repo',
    name: 'repositoriesMonitor',
    icon: 'Github',
    component: './RepositoriesMonitor',
  },
  // {
  //   path: '/backup_low_code_viz',
  //   name: '[removing]Low Code Viz(activity)',
  //   icon: 'warning',
  //   component: './DeveloperActivities',
  // },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       icon: 'smile',
  //       component: './Welcome',
  //     },
  //     {
  //       component: './404',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
