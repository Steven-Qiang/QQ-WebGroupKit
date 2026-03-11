<template>
  <div class="page">
    <div class="container">
      <div class="user-bar">
        <div class="left">
          <slot name="left" />
          <h1 v-html="title" />
        </div>
        <div class="right">
          <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`" class="avatar">
          <span class="qq-number">{{ qqNumber }}</span>
          <el-link type="danger" @click="handleLogout">
            退出
          </el-link>
        </div>
      </div>

      <div class="content">
        <slot />
      </div>
      <page-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import PageFooter from './PageFooter.vue';

defineProps<{
  title?: string;
}>();

const router = useRouter();
const userStore = useUserStore();

const qqNumber = computed(() => {
  const uin = userStore.cookies?.uin || '';
  return uin.startsWith('o') ? uin.slice(1) : uin;
});

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  userStore.clearCookies();
  router.push('/');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 4px;
  padding: 24px;
  padding-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-bar {
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  overflow: hidden;
}

.left {
  display: flex;
  gap: 15px;
  float: left;
  line-height: 40px;
}

.left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.right {
  float: right;
  line-height: 40px;
}

.avatar {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  margin-right: 8px;
}

.qq-number {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  vertical-align: middle;
  margin-right: 12px;
}
</style>
