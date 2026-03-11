import type { GroupInfoDto, IQQLoginCookies } from '../api/api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore(
  'user',
  () => {
    const cookies = ref<IQQLoginCookies | null>(null);
    const groups = ref<GroupInfoDto[]>([]);
    const isLoggedIn = ref<boolean>(false);

    const getCookiesForRequest = computed(() => {
      if (!cookies.value) return null;
      return {
        skey: cookies.value.skey || '',
        p_skey: cookies.value.p_skey || '',
        uin: cookies.value.uin || '',
        p_uin: cookies.value.p_uin || '',
      };
    });

    function setCookies(cookieData: IQQLoginCookies) {
      cookies.value = cookieData;
      isLoggedIn.value = true;
    }

    function setGroups(groupList: GroupInfoDto[]) {
      groups.value = groupList;
    }

    function clearCookies() {
      cookies.value = null;
      isLoggedIn.value = false;
      groups.value = [];
    }

    return {
      cookies,
      groups,
      isLoggedIn,
      getCookiesForRequest,
      setCookies,
      setGroups,
      clearCookies,
    };
  },
  {
    persist: true,
  }
);
