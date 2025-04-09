  <script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute } from 'vue-router'

  definePage({
    meta: {
      layout: 'blank',
      unauthenticatedOnly: true,
    },
  })

  const googleLogo = new URL('@images/google-wallet.svg', import.meta.url).href
  const appleLogo = new URL('@images/apple-wallet.svg', import.meta.url).href

  const platformData = ref({})
  const route = useRoute()
  const googleLoading = ref(false)
  const appleLoading = ref(false)
  const deviceDetected = ref(false)
  const helpDialogOpen = ref(false)
  const currentStep = ref(0)
  const selectedPlatform = ref(-1)

  const userDevice = computed(() => {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
      if (/android/i.test(userAgent)) return 'android'
    }

    return 'unknown'
  })

  const wallets = [
    { 
      title: 'Apple', 
      icon: 'tabler-brand-apple', 
      cardTitle: 'Add to Apple Wallet', 
      cardDescription: 'To add the card to the Apple Wallet app, press the button below.', 
      buttonText: 'Add to Apple Wallet', 
      logo: appleLogo
    },
    { 
      title: 'Google', 
      icon: 'tabler-brand-android', 
      cardTitle: 'Add to Google Wallet', 
      cardDescription: 'To add the card press the button below. You may need to sign in to your Google account.', 
      buttonText: 'Add to Google Wallet', 
      logo: googleLogo
    },
  ]

  const fetchPlatformData = async () => {
    try {
      const response = await $wallyApi(`/campaigns/platform/${route.params.id}`, { method: 'GET' })
      platformData.value = response || {}
    } catch (error) {
      console.error('Error fetching campaigns', error)
    }
  }

  const downloadGoogleCard = async () => {
    try {
      googleLoading.value = true
      const response = await $wallyApi(`v1/passes/event/${platformData.value.eventGuid}/google`, { method: 'GET' })
      const googleWalletUrl = response

      if (googleWalletUrl) {
        window.location.href = googleWalletUrl
      } else {
        console.error('Google Wallet URL not found in the response')
      }
    } catch (error) {
      console.error('Error fetching Google Wallet link', error)
    } finally {
      googleLoading.value = false
    }
  }

  const downloadAppleCard = async () => {
    try {
      appleLoading.value = true
      const response = await $wallyApi(`v1/passes/${route.params.id}`, {
        method: 'GET',
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.apple.pkpass' }))

      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = url
      } else {
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'pass.pkpass')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error fetching apple card link', error)
    } finally {
      appleLoading.value = false
    }
  }

  const selectPlatform = (platform: number) => {
    selectedPlatform.value = platform
    currentStep.value = 1
  }

  const goBack = () => {
    currentStep.value = 0
  }

  const toggleHelp = () => {
    helpDialogOpen.value = !helpDialogOpen.value
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && helpDialogOpen.value) {
      helpDialogOpen.value = false
    }
  }

  onMounted(async () => {
    await fetchPlatformData()

    if (userDevice.value === 'ios' || userDevice.value === 'android') {
      deviceDetected.value = true
    }
    
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
  </script>

  <template>
    <div class="d-flex justify-center align-center">
      <VCard class="modern-card" width="450px" elevation="2">
        <div class="logo-section">
          <img :src="platformData.companyLogo" alt="" height="60px">
        </div>
        <template v-if="currentStep === 0">
          <VCardText class="text-center">
            <h1 class="selection-title">Select Your Platform</h1>
            <p class="selection-description">Choose your device's platform to download the ticket to your wallet</p>

            <div class="platform-container">
              <div class="platform-option" :class="{ active: selectedPlatform === 0 }" @click="selectPlatform(0)">
                <VIcon icon="tabler-brand-apple" size="32" class="platform-icon" />
                <span class="platform-label">Apple</span>
                <small v-if="userDevice.value === 'ios'" class="device-hint">Recommended for your device</small>
              </div>

              <div class="platform-option" :class="{ active: selectedPlatform === 1 }" @click="selectPlatform(1)">
                <VIcon icon="tabler-brand-android" size="32" class="platform-icon" />
                <span class="platform-label">Google</span>
                <small v-if="userDevice.value === 'android'" class="device-hint">Recommended for your device</small>
              </div>
            </div>
          </VCardText>
        </template>

        <template v-else>
          <VCardText class="text-center px-15 py-40">
            <VBtn icon variant="text" size="small" class="back-button" @click="goBack">
              <VIcon icon="tabler-arrow-left" />
              <span class="ml-2">Back</span>
            </VBtn>

            <h1 class="card-title">{{ wallets[selectedPlatform].cardTitle }}</h1>
            <p class="card-description">{{ wallets[selectedPlatform].cardDescription }}</p>

            <VBtn v-if="selectedPlatform === 1" :loading="googleLoading" block
              class="wallet-btn d-flex justify-center align-center btn-lg" @click="downloadGoogleCard">
              <img :src="wallets[selectedPlatform].logo" alt="wallet logo" class="mr-2"
                style="width: 46px; height: 18px;" />
              <span class="divider mx-2">|</span>
              <p class="mb-0 text-14">{{ wallets[selectedPlatform].buttonText }}</p>
            </VBtn>

            <div v-else>
              <img v-if="!appleLoading" :src="wallets[selectedPlatform].logo" alt="wallet logo" class="asset-apple mt-40"
                @click="downloadAppleCard" />
              <VBtn v-if="appleLoading" :loading variant="text" color="primary" />
            </div>

            <p class="text-primary cursor-pointer mt-4 mb-0 text-16" role="button" @click="toggleHelp">
              Don't know how to install the card?
            </p>
          </VCardText>
        </template>

        <Teleport to="body" v-if="helpDialogOpen">
          <div class="help-dialog" @click="helpDialogOpen = false">
            <div class="help-dialog-content" @click.stop>
              <div class="help-header">
                <h3>Installation Help</h3>
                <VBtn icon variant="text" size="small" class="close-x" @click="helpDialogOpen = false">
                  <VIcon icon="tabler-x" />
                </VBtn>
              </div>

              <template v-if="selectedPlatform === 0">
                <ol>
                  <li>Tap the "Add to Apple Wallet" button above</li>
                  <li>Your iOS device will display a preview of the pass</li>
                  <li>Tap "Add" in the top-right corner</li>
                  <li>Your ticket will be saved to Apple Wallet</li>
                </ol>
              </template>
              <template v-else>
                <ol>
                  <li>Tap the "Add to Google Wallet" button above</li>
                  <li>Sign in to your Google account if prompted</li>
                  <li>Review the pass details</li>
                  <li>Tap "Save" to add it to Google Wallet</li>
                </ol>
              </template>

              <VBtn color="primary" block class="close-dialog" @click="helpDialogOpen = false">
                Close
              </VBtn>
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
    background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  }

  .modern-card {
    border-radius: 16px !important;
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease;
    background: white;
    overflow: hidden;
  }

  .modern-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.08) !important;
  }

  .logo-section {
    text-align: center;
    padding: 2rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  }

  .selection-title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin-bottom: 0.5rem;
  }

  .selection-description {
    font-size: 14px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

.platform-container {
  display: flex;
  flex-direction: column; 
  gap: 16px;
  padding: 1rem;
  align-items: center; 
  margin-top: 1rem;
}

.platform-option {
  width: 100%;
  max-width: 220px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

  .platform-option:hover {
    transform: translateY(-2px);
    background: rgba(var(--v-theme-primary), 0.05);
    border-color: rgba(var(--v-theme-primary), 0.2);
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.1);
  }

  .platform-option.active {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
    border-color: rgba(var(--v-theme-primary), 0.3);
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.15);
  }

  .platform-icon {
    font-size: 32px;
    margin-bottom: 12px;
    color: rgba(var(--v-theme-on-surface), 0.87);
  }

  .platform-label {
    font-size: 16px;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin-bottom: 4px;
  }

  .device-hint {
    font-size: 11px;
    color: var(--v-theme-primary);
    text-align: center;
    margin-top: 8px;
  }

  .wallet-btn {
    height: 48px;
    font-size: 14px;
    padding: 13px 24px;
    margin-top: 24px;
    background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .wallet-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.3);
  }

  .card-title {
    font-size: 22px;
    margin: 30px 0 20px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
  }

  .card-description {
    font-size: 14px;
    margin: 0;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .divider {
    font-size: 18px;
    color: rgba(var(--v-theme-on-surface), 0.3);
  }

  .asset-apple {
    width: 170px;
    height: 52px;
    margin-top: 24px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .asset-apple:hover {
    transform: scale(1.05);
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
    background: white;
    color: rgba(var(--v-theme-on-surface), 0.87);
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
    color: rgba(var(--v-theme-on-surface), 0.87);
  }

  .close-x {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: rgba(var(--v-theme-on-surface), 0.6);
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
    background-color: rgba(var(--v-theme-surface), 0.1);
  }

  .help-dialog-content ol {
    padding-left: 1.8rem;
    margin-bottom: 2rem;
  }

  .help-dialog-content li {
    margin-bottom: 0.8rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .close-dialog {
    border-radius: 10px;
    padding: 0.9rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
    color: white;
  }

  .close-dialog:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    text-transform: none;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 14px;
  }

  .back-button:hover {
    color: var(--v-theme-primary);
  }
  </style>