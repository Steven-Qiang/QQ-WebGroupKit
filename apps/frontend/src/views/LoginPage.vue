<template>
  <div class="login-page">
    <div class="container">
      <div class="header">
        <h1>QQ WebGroupKit</h1>
      </div>

      <div class="content">
        <img class="qrcode" :src="qrcodeUrl" alt="二维码">
        <p class="status">
          {{ message }}
          <span v-if="!isLoginSuccess" class="dots" />
        </p>
      </div>

      <PageFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginResultResponseDto, QrcodeResponseDto } from '../api/api';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const qrcodeUrl = ref('');
const qrsig = ref('');
const message = ref('正在获取状态');
const isLoginSuccess = ref(false);
let timer: number | null = null;

async function getQrcode(): Promise<QrcodeResponseDto> {
  const { data } = await api.App_GetQrcode();
  return data;
}

async function getResult(qrsig: string): Promise<LoginResultResponseDto> {
  const { data } = await api.App_GetResult({ qrsig });
  return data;
}

async function onSuccess(ret: LoginResultResponseDto) {
  isLoginSuccess.value = true;
  if (ret.cookies) {
    userStore.setCookies(ret.cookies);
  }
  setTimeout(() => {
    router.push('/group');
  }, 1000);
}

onMounted(async () => {
  try {
    const result = await getQrcode();
    qrcodeUrl.value = result.image;
    qrsig.value = result.qrsig;

    if (timer) clearInterval(timer);

    timer = window.setInterval(async () => {
      try {
        const result = await getResult(qrsig.value);
        message.value = result.msg;

        if (result.code === 65) {
          clearInterval(timer!);
          return;
        }

        if (result.code === 0) {
          clearInterval(timer!);
          message.value = `${result.msg}, QQ: ${result.uin}`;
          await onSuccess(result);
        }
      } catch (error) {
        console.error('获取登录状态失败:', error);
      }
    }, 3000);
  } catch (error) {
    console.error('获取二维码失败:', error);
    message.value = '获取二维码失败';
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 20px;
}

.container {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  padding-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.content {
  text-align: center;
  padding-bottom: 24px;
}

.qrcode {
  width: 200px;
  height: 200px;
  display: block;
  margin: 0 auto 20px;
}

.status {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.dots::after {
  content: '...';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%,
  20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%,
  100% {
    content: '...';
  }
}
</style>
