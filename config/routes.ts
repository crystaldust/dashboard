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
    path: '/sql_platform',
    name: 'lowcode', // TODO Add the name in i18n locales
    icon: 'table',
    component: './SQLTableList',
  },

  {
    name: 'Welcome',
    path: '/welcome',
    icon: 'smile',
    component: './Welcome',
  },

  {
    path: '/admin',
    name: 'Admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
  // TODO Confirm why route after 404 can't be rendered and always driect to 404
  // {
  //   path: '/testc',
  //   name: 'TestC',
  //   icon: 'smile',
  //   component: './JustTest',
  // },
];
