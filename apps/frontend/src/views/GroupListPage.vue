<template>
  <page-layout title="QQ 群列表">
    <el-table v-if="userStore.groups.length" :data="userStore.groups" stripe height="800">
      <el-table-column prop="gc" label="群号" width="140" />
      <el-table-column prop="gn" label="群名" min-width="200">
        <template #default="{ row }">
          <span v-html="row.gn" />
        </template>
      </el-table-column>
      <el-table-column prop="roleName" label="身份" width="100" align="center" />
      <el-table-column label="群主" width="180">
        <template #default="{ row }">
          <div class="owner">
            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${row.owner}&s=40`">
            <span>{{ row.owner }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.role === 'creator' || row.role === 'manager'"
            link
            type="primary"
            @click="goToManage(row)"
          >
            管理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无群组" />
  </page-layout>
</template>

<script setup lang="ts">
import type { GroupInfoDto, GroupListRequestDto } from '../api/api';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import PageLayout from '../components/PageLayout.vue';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

async function getGroupList() {
  const cookiesData = userStore.getCookiesForRequest;
  if (!cookiesData) {
    router.push('/');
    return;
  }

  const requestData: GroupListRequestDto = {
    skey: cookiesData.skey,
    p_skey: cookiesData.p_skey,
    uin: cookiesData.uin,
    p_uin: cookiesData.p_uin,
  };

  const { data } = await api.App_GetGroupList(requestData);
  return data;
}

function getUinType(row: GroupInfoDto) {
  return {
    creator: 0,
    manager: 1,
    member: 2,
  }[row.role];
}

function goToManage(row: GroupInfoDto) {
  router.push({
    path: `/group-members/${row.gc}`,
    query: { name: row.gn, uinType: getUinType(row) },
  });
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/');
    return;
  }

  try {
    const result = await getGroupList();
    if (result && result.errcode === 0) {
      userStore.setGroups(result.list);
    }
  } catch (error) {
    console.error('获取群列表失败:', error);
  }
});
</script>

<style scoped>
.owner {
  line-height: 32px;
}

.owner img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 10px;
}

.owner span {
  font-size: 13px;
  color: #666;
  vertical-align: middle;
}
</style>
