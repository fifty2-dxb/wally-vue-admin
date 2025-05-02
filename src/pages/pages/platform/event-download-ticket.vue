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
  const wallyDarkLogo = new URL('@images/wally-new-dark.png', import.meta.url).href
  const wallyWhiteLogo = new URL('@images/wally-white.png', import.meta.url).href

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
      const response = await $wallyApi(`/campaigns/pass/${route.params.id}`, { method: 'GET' })
      platformData.value = response || {}
      console.log(platformData.value);
    } catch (error) {
      console.error('Error fetching campaigns', error)
    }
  }

  const downloadGoogleCard = async () => {
    try {
      googleLoading.value = true
      const response = await $wallyApi(`event-tickets?walletType=google&serialNumber=${route.params.id}`, { method: 'POST' })
      console.log(response);
      const googleWalletUrl = response.saveUrl

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
    <div class="download-wizard">
      <div class="wizard-container">
        <div class="wizard-header">
          <img 
            v-if="platformData?.campaign?.styleSettings?.properties?.logo" 
            :src="platformData.campaign?.styleSettings.properties.logo" 
            alt="Company Logo" 
            class="company-logo"
          >
          <div v-else class="placeholder-logo">
            <VIcon icon="tabler-ticket" size="32" />
          </div>
        </div>

        <div class="event-details">
          <div class="event-info">
            <p v-if="platformData.eventName" class="event-description">
              <b>{{ platformData.eventName }}</b>
            </p>
            <p v-if="platformData.eventDescription" class="event-description">
              {{ platformData.eventDescription }}
            </p>
            <p v-else class="event-description no-description">
              No event description available
            </p>
          </div>
        </div>

        <div class="wizard-content">
          <div class="wizard-progress" v-if="currentStep > 0">
            <div class="progress-steps">
              <div class="step" :class="{ active: currentStep >= 1 }">
                <div class="step-number">1</div>
                <div class="step-label">Select Platform</div>
              </div>
              <div class="step-divider"></div>
              <div class="step" :class="{ active: currentStep >= 2 }">
                <div class="step-number">2</div>
                <div class="step-label">Download</div>
              </div>
            </div>
          </div>

          <div class="wizard-body">
            <template v-if="currentStep === 0">
              <h1 class="wizard-title">Add to Wallet</h1>
              <p class="wizard-description">Choose your device to add this to your digital wallet</p>

              <div class="platform-options">
                <div 
                  class="platform-option" 
                  :class="{ active: selectedPlatform === 0 }" 
                  @click="selectPlatform(0)"
                >
                  <div class="platform-icon">
                    <VIcon icon="tabler-brand-apple" size="32" />
                  </div>
                  <div class="platform-info">
                    <span class="platform-name">Apple Wallet</span>
                    <span v-if="userDevice === 'ios'" class="platform-hint">Recommended for your device</span>
                  </div>
                  <div class="platform-arrow">
                    <VIcon icon="tabler-chevron-right" size="20" />
                  </div>
                </div>

                <div 
                  class="platform-option" 
                  :class="{ active: selectedPlatform === 1 }" 
                  @click="selectPlatform(1)"
                >
                  <div class="platform-icon">
                    <VIcon icon="tabler-brand-android" size="32" />
                  </div>
                  <div class="platform-info">
                    <span class="platform-name">Google Wallet</span>
                    <span v-if="userDevice === 'android'" class="platform-hint">Recommended for your device</span>
                  </div>
                  <div class="platform-arrow">
                    <VIcon icon="tabler-chevron-right" size="20" />
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="download-step">
                <div class="back-button" @click="goBack">
                  <VIcon icon="tabler-arrow-left" size="20" />
                  <span>Back</span>
                </div>

                <div class="download-content">
                  <h2 class="download-title">{{ wallets[selectedPlatform].cardTitle }}</h2>
                  <p class="download-description">{{ wallets[selectedPlatform].cardDescription }}</p>

                  <div class="download-button-container">
                    <VBtn
                      v-if="selectedPlatform === 1"
                      :loading="googleLoading"
                      class="download-button"
                      block
                      @click="downloadGoogleCard"
                    >
                      <div class="button-content">
                        <img :src="wallets[selectedPlatform].logo" alt="Google Wallet" class="wallet-logo" />
                        <span class="button-text">{{ wallets[selectedPlatform].buttonText }}</span>
                      </div>
                    </VBtn>

                    <div v-else class="apple-button-container">
                      <img
                        v-if="!appleLoading"
                        :src="wallets[selectedPlatform].logo"
                        alt="Apple Wallet"
                        class="apple-button"
                        @click="downloadAppleCard"
                      />
                      <VBtn v-if="appleLoading" :loading variant="text" color="primary" />
                    </div>
                  </div>

                  <div class="help-section">
                    <VBtn
                      variant="text"
                      class="help-button"
                      @click="toggleHelp"
                    >
                      <VIcon icon="tabler-help" size="18" class="me-2" />
                      Need help?
                    </VBtn>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="wizard-footer">
            <div class="powered-by">
              <span class="powered-text">Powered by</span>
              <a href="https://wally.ae" target="_blank" rel="noopener noreferrer" class="wally-link">
                <span class="wally-text">Wally: Your Smart Wallet</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Teleport to="body" v-if="helpDialogOpen">
        <div class="help-dialog" @click="helpDialogOpen = false">
          <div class="help-dialog-content" @click.stop>
            <div class="help-header">
              <h3>Installation Guide</h3>
              <VBtn
                icon
                variant="text"
                size="small"
                class="close-button"
                @click="helpDialogOpen = false"
              >
                <VIcon icon="tabler-x" />
              </VBtn>
            </div>

            <div class="help-steps">
              <template v-if="selectedPlatform === 0">
                <ol>
                  <li>Tap the "Add to Apple Wallet" button</li>
                  <li>Your iOS device will display a preview of the pass</li>
                  <li>Tap "Add" in the top-right corner</li>
                  <li>Your ticket will be saved to Apple Wallet</li>
                </ol>
              </template>
              <template v-else>
                <ol>
                  <li>Tap the "Add to Google Wallet" button</li>
                  <li>Sign in to your Google account if prompted</li>
                  <li>Review the pass details</li>
                  <li>Tap "Save" to add it to Google Wallet</li>
                </ol>
              </template>
            </div>

            <VBtn
              block
              color="primary"
              class="close-dialog-btn"
              @click="helpDialogOpen = false"
            >
              Got it, thanks!
            </VBtn>
          </div>
        </div>
      </Teleport>
    </div>
  </template>

  <style scoped>
  .download-wizard {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  }

  .wizard-container {
    width: 100%;
    max-width: 480px;
    background: rgb(var(--v-theme-surface));
    border-radius: 24px;
    box-shadow: 0 4px 25px rgba(var(--v-theme-on-background), 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 600px;
  }

  .wizard-header {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }

  .company-logo {
    max-height: 48px;
    width: auto;
  }

  .placeholder-logo {
    width: 48px;
    height: 48px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--v-theme-primary), 0.1);
    border-radius: 12px;
    color: var(--v-theme-primary);
  }

  .wizard-content {
    padding: 2rem;
  }

  .wizard-progress {
    margin-bottom: 2rem;
  }

  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(var(--v-theme-surface), 1);
    border: 2px solid rgba(var(--v-theme-primary), 0.3);
    color: rgba(var(--v-theme-on-surface), 0.87);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .step.active .step-number {
    background: var(--v-theme-primary);
    color: white;
    border: none;
  }

  .step-label {
    font-size: 12px;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .step-divider {
    width: 40px;
    height: 2px;
    background: rgba(var(--v-theme-on-surface), 0.1);
  }

  .wizard-title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .wizard-description {
    font-size: 14px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    text-align: center;
    margin-bottom: 2rem;
  }

  .platform-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .platform-option {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    border-radius: 16px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(var(--v-theme-on-background), 0.05);
  }

  .platform-option:hover {
    transform: translateY(-2px);
    background: rgba(var(--v-theme-primary), 0.02);
    border-color: rgba(var(--v-theme-primary), 0.3);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
  }

  .platform-option.active {
    background: rgba(var(--v-theme-primary), 0.04);
    border-color: rgba(var(--v-theme-primary), 0.4);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.12);
  }

  .platform-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--v-theme-primary), 0.08);
    color: var(--v-theme-primary);
    margin-right: 1rem;
    font-size: 28px;
    transition: all 0.3s ease;
  }

  .platform-option:hover .platform-icon {
    background: rgba(var(--v-theme-primary), 0.12);
    transform: scale(1.05);
  }

  .platform-option.active .platform-icon {
    background: rgba(var(--v-theme-primary), 0.15);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
  }

  .platform-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .platform-name {
    font-size: 16px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
  }

  .platform-hint {
    font-size: 12px;
    color: var(--v-theme-primary);
    font-weight: 500;
  }

  .platform-arrow {
    color: rgba(var(--v-theme-on-surface), 0.4);
    transition: all 0.3s ease;
  }

  .platform-option:hover .platform-arrow {
    color: var(--v-theme-primary);
    transform: translateX(4px);
  }

  .platform-option.active .platform-arrow {
    color: var(--v-theme-primary);
    transform: translateX(4px);
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 14px;
    margin-bottom: 1.5rem;
    cursor: pointer;
  }

  .download-content {
    text-align: center;
  }

  .download-title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin-bottom: 0.5rem;
  }

  .download-description {
    font-size: 14px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 2rem;
  }

  .download-button-container {
    margin: 2rem auto;
    max-width: 320px;
    width: 100%;
  }

  .download-button {
    width: 100%;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2rem;
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 280px;
  }

  .wallet-logo {
    height: 24px;
    width: auto;
  }

  .button-text {
    color: white;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
  }

  .apple-button-container {
    display: flex;
    justify-content: center;
  }

  .apple-button {
    height: 52px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .apple-button:hover {
    transform: scale(1.05);
  }

  .help-section {
    margin-top: 1.5rem;
  }

  .help-button {
    color: var(--v-theme-primary);
    font-size: 14px;
  }

  .help-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(var(--v-theme-on-background), 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 1rem;
    backdrop-filter: blur(5px);
  }

  .help-dialog-content {
    background: rgb(var(--v-theme-surface));
    border-radius: 24px;
    padding: 2rem;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(var(--v-theme-on-background), 0.3);
  }

  .help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .help-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin: 0;
  }

  .close-button {
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .help-steps {
    margin-bottom: 2rem;
  }

  .help-steps ol {
    padding-left: 1.5rem;
    margin: 0;
  }

  .help-steps li {
    margin-bottom: 1rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    line-height: 1.5;
  }

  .close-dialog-btn {
    border-radius: 12px;
    height: 48px;
    font-weight: 500;
  }

  .event-details {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    background: rgba(var(--v-theme-primary), 0.03);
  }

  .event-info {
    max-width: 480px;
    margin: 0 auto;
  }

  .event-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .event-description {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin: 0;
    text-align: center;
    white-space: pre-line;
  }

  .no-description {
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-style: italic;
  }

  .wallet-buttons {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .wallet-button-wrapper {
    width: 100%;
    max-width: 320px;
  }

  .wallet-button {
    width: 100%;
    transition: all 0.3s ease;
  }

  .apple-button {
    height: 48px;
    cursor: pointer;
    opacity: 0.9;
  }

  .apple-button:hover {
    transform: translateY(-2px);
    opacity: 1;
  }

  .google-button {
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0 2rem;
    opacity: 0.9;
  }

  .google-button:hover {
    transform: translateY(-2px);
    opacity: 1;
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  }

  .button-loading {
    opacity: 0.5;
    pointer-events: none;
  }

  .wizard-footer {
    padding: 1.5rem;
    text-align: center;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    margin-top: auto;
    background: rgb(var(--v-theme-surface));
  }

  .powered-by {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 12px;
  }

  .powered-text {
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .wally-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .wally-text {
    color: var(--v-theme-primary);
    font-weight: 500;
  }

  .wally-link:hover {
    opacity: 0.85;
  }

  .wally-link:hover .wally-text {
    text-decoration: underline;
  }

  .wally-link:active {
    opacity: 0.7;
  }

  .wally-logo {
    height: 16px;
    width: auto;
    display: block;
  }

  @media (max-width: 600px) {
    .wizard-container {
      border-radius: 16px;
    }

    .wizard-content {
      padding: 1.5rem;
    }

    .wizard-title,
    .download-title {
      font-size: 20px;
    }

    .help-dialog-content {
      margin: 1rem;
      padding: 1.5rem;
    }

    .event-details {
      padding: 1.25rem;
    }

    .event-title {
      font-size: 15px;
    }

    .event-description {
      font-size: 13px;
    }

    .wallet-button-wrapper {
      max-width: 280px;
    }

    .wizard-footer {
      padding: 1rem;
    }

    .powered-by {
      font-size: 11px;
    }

    .wally-logo {
      height: 14px;
    }
  }
  </style>