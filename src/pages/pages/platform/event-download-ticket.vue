<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const googleLogo = new URL('@images/google-wallet.svg', import.meta.url).href;
const appleLogo = new URL('@images/apple-wallet.svg', import.meta.url).href;

const platformData = ref({});
const route = useRoute();
const googleLoading = ref(false);
const appleLoading = ref(false);
const deviceDetected = ref(false);
const helpDialogOpen = ref(false);
const platform = ref(0)

const userDevice = computed(() => {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    if (/android/i.test(userAgent)) return 'android';
  }

  return 'unknown';
})

const steps = [
  { title: 'Apple', icon: 'tabler-brand-apple', cardTitle: 'Add card to Apple Wallet', cardDescription: 'To add the card to the Apple Wallet app, press the button below.', buttonText: 'Save to phone', logo: appleLogo, showButton: false },
  { title: 'Google', icon: 'tabler-brand-android', cardTitle: 'Add card to Google Pay', cardDescription: 'To add the card press the button below. Perhaps you will need to log in to your Google account.', buttonText: 'Save to phone', logo: googleLogo, showButton: true },
];

const fetchPlatformData = async () => {
  try {
    const response = await $wallyApi(`/campaigns/platform/${route.params.id}`, { method: "GET" });
    platformData.value = response || {};
  } catch (error) {
    console.error("Error fetching campaigns", error);
  }
};

const downloadGoogleCard = async () => {
  try {
    googleLoading.value = true
    console.log(platformData)

    const response = await $wallyApi(`v1/passes/event/${platformData.value.eventGuid}/google`, { method: "GET" });

    const googleWalletUrl = response

    if (googleWalletUrl) {
      window.location.href = googleWalletUrl;
    } else {
      console.error("Google Wallet URL not found in the response");
    }
  } catch (error) {
    console.error("Error fetching Google Wallet link", error);
  } finally {
    googleLoading.value = false;
  }
};

const downloadAppleCard = async () => {
  try {
    appleLoading.value = true;
    console.log(platformData);

    const response = await $wallyApi(`v1/passes/event/${platformData.value.eventGuid}`, {
      method: "GET",
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.apple.pkpass' }));

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = url;
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pass.pkpass");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error fetching apple card link", error);
  } finally {
    appleLoading.value = false;
  }
};

const toggleHelp = () => {
  helpDialogOpen.value = !helpDialogOpen.value;
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && helpDialogOpen.value) {
    helpDialogOpen.value = false;
  }
};

onMounted(async () => {
  await fetchPlatformData();

  if (userDevice.value === 'ios') {
    platform.value = 0;
    deviceDetected.value = true;
  } else if (userDevice.value === 'android') {
    platform.value = 1;
    deviceDetected.value = true;
  }
  
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="d-flex justify-center align-center">
    <VCard class="inner-card" width="450px" elevation="2">
      <div class="text-center">
        <img :src="platformData.companyLogo" alt="" height="60px">
      </div>

      <v-card-text>
        <div class="tab-container">
          <div class="tab-header">
            <div class="tab" :class="{ 'active': platform === 0 }" @click="platform = 0">
              <i class="tabler-brand-apple tab-icon"></i>
              <div>Apple</div>
            </div>
            <div class="tab" :class="{ 'active': platform === 1 }" @click="platform = 1">
              <i class="tabler-brand-android tab-icon"></i>
              <div>Google</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <VRow no-gutters class="w-100">
        <VCol cols="12" class="text-center">
          <VCardText class="text-center px-15 py-40">
            <h1 class="card-title">{{ steps[platform].cardTitle }}</h1>
            <p class="card-description">{{ steps[platform].cardDescription }}</p>

            <VBtn :loading="googleLoading" v-if="platform === 1" block
              class="walletBtn d-flex justify-center align-center btn-lg" @click="downloadGoogleCard">
              <img :src="steps[platform].logo" alt="wallet logo" class="mr-2" style="width: 46px; height: 18px;" />
              <span class="divider mx-2">|</span>
              <p class="mb-0 text-14">{{ steps[platform].buttonText }}</p>
            </VBtn>

            <div v-else>
              <img v-if="!appleLoading" :src="steps[platform].logo" alt="wallet logo" class="asset-apple mt-40"
                @click="downloadAppleCard" />
              <v-btn :loading="true" v-if="appleLoading" variant="text" color="primary"></v-btn>
            </div>

            <p class="text-primary cursor-pointer mt-4 mb-0 text-16" role="button" @click="toggleHelp">
              Don't know how to install the card?
            </p>
          </VCardText>
        </VCol>
      </VRow>

      <Teleport to="body" v-if="helpDialogOpen">
        <div class="help-dialog" @click="helpDialogOpen = false">
          <div class="help-dialog-content" @click.stop>
            <div class="help-header">
              <h3>Installation Help</h3>
              <button class="close-x" @click="helpDialogOpen = false">×</button>
            </div>
            
            <template v-if="platform === 0">
              <ol>
                <li>Tap the "Add to Apple Wallet" button above</li>
                <li>Your iOS device will display a preview of the pass</li>
                <li>Tap "Add" in the top-right corner</li>
                <li>Your ticket will be saved to Apple Wallet</li>
              </ol>
            </template>
            <template v-else>
              <ol>
                <li>Tap the "Save to phone" button above</li>
                <li>Sign in to your Google account if prompted</li>
                <li>Review the pass details</li>
                <li>Tap "Save" to add it to Google Wallet</li>
              </ol>
            </template>
            
            <button class="close-dialog" @click="helpDialogOpen = false">Close</button>
          </div>
        </div>
      </Teleport>
    </VCard>
  </div>
</template>

<style scoped>
.d-flex {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab-container {
  width: 100%;
  margin: 0 auto;
}

.tab-header {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.tab.active {
  background-color: #efe1ff;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 5px;
  color: #333;
}

.inner-card {
  padding: 20px;
  border-radius: 8px;
}

.walletBtn {
  height: 48px;
  font-size: 14px;
  padding: 13px 24px;
  margin-top: 40px;
}

.card-title {
  font-size: 22px;
  margin: 30px 0 20px;
}

.card-description {
  font-size: 14px;
  margin: 0;
}

.divider {
  font-size: 18px;
}

.asset-apple {
  width: 170px;
  height: 52px;
  margin-top: 40px;
  cursor: pointer;
}

.help-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.help-dialog-content {
  background: #fff;
  color: #333;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  text-align: left;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.help-dialog-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.close-x {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-x:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.help-dialog-content ol {
  padding-left: 1.8rem;
  margin-bottom: 2rem;
}

.help-dialog-content li {
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

.close-dialog {
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  background-color: #6200ee;
  color: white;
}

.close-dialog:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}
</style>