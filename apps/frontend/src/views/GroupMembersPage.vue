<template>
  <page-layout :title="groupName">
    <template #left>
      <el-button link @click="goBack">
        ← 返回
      </el-button>
    </template>

    <div class="toolbar">
      <div class="left">
        <el-button :disabled="!selectedMembers.length" type="danger" size="small" @click="batchDelete">
          批量踢出 ({{ selectedMembers.length }})
        </el-button>
      </div>
      <div class="right">
        <span class="total-text">共 {{ total }} 人</span>
      </div>
    </div>

    <el-table v-loading="loading" :data="members" height="750" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" :selectable="checkSelectable" />
      <el-table-column label="成员" width="150">
        <template #default="{ row }">
          <div class="member">
            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${row.uin}&s=40`">
            <span>{{ row.uin }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="nick" label="昵称" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-html="row.nick" />
        </template>
      </el-table-column>
      <el-table-column prop="card" label="群名片" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="card-cell" @click="editCard(row)">
            <span v-html="row.card || '-'" />
            <el-icon class="edit-icon">
              <edit />
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.role === 0" type="danger" size="small" disable-transitions>
            群主
          </el-tag>
          <el-tag v-else-if="row.role === 1" type="warning" size="small" disable-transitions>
            管理员
          </el-tag>
          <span v-else>成员</span>
        </template>
      </el-table-column>
      <el-table-column prop="qage" label="Q龄" width="80" align="center" />
      <el-table-column prop="join_time" label="加群时间" width="160">
        <template #default="{ row }">
          {{ formatTime(row.join_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="last_speak_time" label="最后发言" width="160">
        <template #default="{ row }">
          {{ formatTime(row.last_speak_time) }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      class="pagination"
      @current-change="loadMembers"
    />
  </page-layout>
</template>

<script setup lang="ts">
import type { GroupMemberDto } from '../api/api';
import { Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import PageLayout from '../components/PageLayout.vue';
import { useUserStore } from '../stores/userStore';

enum MemberRole {
  lord = 0,
  manage = 1,
  member = 2,
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const gc = Number(route.params.gc);
const groupUinType = Number(route.query.uinType);

const groupName = route.query.name as string;

const members = ref<GroupMemberDto[]>([]);
const selectedMembers = ref<GroupMemberDto[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

function checkSelectable(target: GroupMemberDto) {
  const disabled
    = target.role === MemberRole.lord
      || (groupUinType === MemberRole.manage && target.role === MemberRole.manage)
      || groupUinType === MemberRole.member;
  return !disabled;
}

function handleSelectionChange(selection: GroupMemberDto[]) {
  selectedMembers.value = selection;
}

async function loadMembers() {
  const cookies = userStore.getCookiesForRequest;
  if (!cookies) {
    ElMessage.error('登录信息已过期');
    router.push('/');
    return;
  }

  loading.value = true;
  try {
    const st = (currentPage.value - 1) * pageSize.value;
    const end = st + pageSize.value - 1;
    const res = await api.App_GetGroupMembers({
      ...cookies,
      gc,
      st,
      end,
    });
    members.value = res.data.mems || [];
    total.value = res.data.count || 0;
    selectedMembers.value = [];
  } catch {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
}

async function editCard(row: GroupMemberDto) {
  const cookies = userStore.getCookiesForRequest;
  if (!cookies) return;

  ElMessageBox.prompt('请输入新的群名片', '修改群名片', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.card?.replace(/&nbsp;/g, ' ') || '',
  })
    .then(async ({ value }) => {
      try {
        await api.App_SetGroupCard({
          ...cookies,
          gc,
          u: row.uin,
          name: value,
        });
        ElMessage.success('修改成功');
        loadMembers();
      } catch {
        ElMessage.error('修改失败');
      }
    })
    .catch(() => {});
}

async function batchDelete() {
  const cookies = userStore.getCookiesForRequest;
  if (!cookies) return;

  const count = selectedMembers.value.length;
  const names = selectedMembers.value
    .slice(0, 3)
    .map((m) => m.nick)
    .join('、');
  const suffix = count > 3 ? ` 等${count}人` : '';

  ElMessageBox.confirm(`确定要批量踢出 ${names}${suffix} 吗？`, '批量踢出', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      loading.value = true;
      let successCount = 0;
      let failCount = 0;

      for (const member of selectedMembers.value) {
        try {
          await api.App_DeleteMember({
            ...cookies,
            gc,
            ul: member.uin,
          });
          successCount++;
        } catch {
          failCount++;
        }
      }

      loading.value = false;

      if (failCount === 0) {
        ElMessage.success(`成功踢出 ${successCount} 人`);
      } else {
        ElMessage.warning(`成功 ${successCount} 人，失败 ${failCount} 人`);
      }

      loadMembers();
    })
    .catch(() => {});
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadMembers();
});
</script>

<style scoped>
.title {
  font-size: 20px;
  font-weight: 500;
  margin-left: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
}

.toolbar .left {
  flex: 1;
}

.toolbar .right {
  color: #666;
  font-size: 14px;
}

.total-text {
  font-weight: 500;
}

.member {
  line-height: 32px;
}

.member img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 10px;
}

.member span {
  font-size: 13px;
  color: #666;
  vertical-align: middle;
}

.card-cell {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-cell:hover {
  color: #409eff;
}

.card-cell:hover .edit-icon {
  opacity: 1;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px;
  flex-shrink: 0;
}

.pagination {
  margin: 20px 0;
  justify-content: center;
}
</style>
