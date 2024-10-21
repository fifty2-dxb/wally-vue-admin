<script setup lang="ts">
import { ref, watch } from 'vue';
import { load } from 'webfontloader';

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const googleLogo = new URL('@images/google-wallet.svg', import.meta.url).href;
const appleLogo = new URL('@images/apple-wallet.svg', import.meta.url).href;

const platform = ref(0);

const steps = [
  { title: 'Apple', icon: 'tabler-brand-apple', cardTitle: 'Add card to Apple Wallet', cardDescription: 'To add the card to the Apple Wallet app, press the button below.', buttonText: 'Save to phone', logo: appleLogo, showButton: false },
  { title: 'Google', icon: 'tabler-brand-android', cardTitle: 'Add card to Google Pay', cardDescription: 'To add the card press the button below. Perhaps you will need to log in to your Google account.', buttonText: 'Save to phone', logo: googleLogo, showButton: true },
];


const platformData = ref({});
const route = useRoute();

const fetchPlatformData = async () => {
  try {
    const response = await $wallyApi(`/campaigns/platform/${route.params.id}`, { method: "GET" });

    platformData.value = response || {};
  } catch (error) {
    console.error("Error fetching campaigns", error);
  }
};

const googleLoading = ref(false);
const downloadGoogleCard = async () => {
  try {
    googleLoading.value = true;
    console.log(platformData);

    // Fetch the Google Wallet link from the API
    const response = await $wallyApi(`v1/passes/event/${platformData.value.eventGuid}/google`, { method: "GET" });

    // Assuming the response contains the Google Wallet URL, extract it and redirect the user
    const googleWalletUrl = response; // Adjust based on the actual response structure

    if (googleWalletUrl) {
      // Redirect the user to the Google Wallet link
      window.location.href = googleWalletUrl;
    } else {
      console.error("Google Wallet URL not found in the response");
    }

    googleLoading.value = false;

  } catch (error) {
    googleLoading.value = false;
    console.error("Error fetching Google Wallet link", error);
  }
};

const appleLoading = ref(false);

const downloadAppleCard = async () => {
  try {
    appleLoading.value = true;
    console.log(platformData);

    // Fetch the pass (.pkpass file) from the API
    const response = await $wallyApi(`v1/passes/event/${platformData.value.eventGuid}`, { 
      method: "GET",
      responseType: 'blob' // Make sure the response is treated as a blob
    });

    // Create a URL for the .pkpass file
    const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.apple.pkpass' }));

    // Check if the platform is iOS, as Apple Wallet only works on iOS devices
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // Redirect to the URL to trigger the "Add to Apple Wallet" action
      window.location.href = url;
    } else {
      // If it's not iOS, provide a download option for the .pkpass file
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "pass.pkpass");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    appleLoading.value = false;

  } catch (error) {
    appleLoading.value = false;
    console.error("Error fetching apple card link", error);
  }
};


onMounted(async() => {
  await fetchPlatformData();
});
</script>

<template>
  <div class="d-flex justify-center align-center">
    <VCard class="inner-card" width="450px" elevation="2">
      <div class="text-center">
        <img :src="platformData.companyLogo" alt="" height="60px">
      </div>
      <v-card-text>
        <WallyStepHeader v-model:activeTab="platform" :steps="steps" />
      </v-card-text>
        

      <VRow no-gutters class="w-100">
        <VCol cols="12" class="text-center">
          <VCardText class="text-center px-15 py-40">
            <h1 class="card-title">{{ steps[platform].cardTitle }}</h1>
            <p class="card-description">{{ steps[platform].cardDescription }}</p>

            <VBtn :loading="googleLoading" v-if="steps[platform].showButton" block class="walletBtn d-flex justify-center align-center btn-lg"  @click="downloadGoogleCard">
              <img :src="steps[platform].logo" alt="wallet logo" class="mr-2" style="width: 46px; height: 18px;"/>
              <span class="divider mx-2">|</span>
              <p class="mb-0 text-14">{{ steps[platform].buttonText }}</p>
            </VBtn>
            
            <div v-else>
              <img v-if="!appleLoading" :src="steps[platform].logo" alt="wallet logo" class="asset-apple mt-40" @click="downloadAppleCard"/>
              <v-btn :loading="true" v-if="appleLoading" variant="text" color="primary"></v-btn>
            </div>

            <p class="text-primary cursor-pointer mt-4 mb-0 text-16" role="button">
              Don't know how to install the card?
            </p>
          </VCardText>
        </VCol>
      </VRow>
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

.platform-select-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 120px;
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
}
</style>
