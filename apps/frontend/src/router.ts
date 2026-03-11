import { createRouter, createWebHashHistory } from 'vue-router';
import GroupListPage from './views/GroupListPage.vue';
import GroupMembersPage from './views/GroupMembersPage.vue';
import LoginPage from './views/LoginPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/group',
      name: 'groupList',
      component: GroupListPage,
    },
    {
      path: '/group-members/:gc',
      name: 'groupMembers',
      component: GroupMembersPage,
    },
  ],
});

export default router;
