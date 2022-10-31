let SUPERSET_SERVER = 'http://192.168.8.4:8088';
if (process.env.SUPERSET_SERVER) {
  SUPERSET_SERVER = process.env.SUPERSET_SERVER;
}

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
  // {
  //   path: '/welcome',
  //   name: 'welcome',
  //   icon: 'smile',
  //   component: './Welcome',
  // },
  {
    path: '/repositories',
    name: 'repositoriesManager',
    icon: 'Github',
    component: './RepositoriesManager',
  },
  {
    path: '/contrib_distribution',
    name: 'contribDist',
    icon: 'LineChart',
    component: './ContribDistribution',
  },
  {
    path: '/low_code_platform',
    name: 'lowCodePlatform',
    icon: 'rocket',
    component: './LowCodePlatform',
  },
  {
    path: SUPERSET_SERVER,
    name: 'superset',
    icon: 'rocket',
  },
  // {
  //   path: '/chart_image',
  //   name: 'charImageDownload',
  //   icon: 'LineChart',
  //   component: './CriticalityScoreDownload',
  // },
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
    redirect: '/repositories',
  },
  {
    component: './404',
  },
];
