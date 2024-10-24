<script setup lang="ts">
import { useTheme } from 'vuetify'
import Pusher from 'pusher-js'
import ConfettiExplosion from "vue-confetti-explosion";
import { ref, onMounted, nextTick } from 'vue'

const theme = useTheme()

const customerName = ref('')
const membershipMessage = ref('')
const stampMessage = ref('')
const showConfetti = ref(false)
const pusherKey = import.meta.env.VITE_APP_PUSHER_KEY
const showInput = ref(false); 
const inputText = ref(''); 
const inputRef = ref<HTMLInputElement | null>(null); // Ref for the input element

// Toggle input visibility
const toggleInput = async () => {
  showInput.value = !showInput.value;
  inputText.value = ''; // Reset input value when toggling

  if (showInput.value) {
    await nextTick(); // Wait for the DOM to update
    inputRef.value?.focus(); // Focus the input element
  }
};


// Handle API call on Enter key press
const submitText = async () => {
  if (inputText.value.trim() === '') return; // Avoid empty submissions
  try {
    const response = await fetch('https://api-v1.wally.ae/v1/readers/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': 'H4ohc8LlaoaxVzNRmASVn1U0fR9uQOrPfVQMVFTeBUhdcbwU73VwuNi6XL7jQoi3U5gNhfQSkK5xq9KQW16DXaOCt00IvNXa7xDPBRHi9IRX3ZpLeEdoLbAUQB4889Pk'},
      body: JSON.stringify({ 
        payload: inputText.value,
        IP: 'localhost',
        location: 'Dubai Active Show',
        serialno: 'CC217005',
        SSID: 'none',
        MAC: 'none',
        passtype: 'A',
        rdrparam1: 'none',
        rdrparam2: 'none',
      }),
    });
    const result = await response.json();
    console.log('API Response:', result);
  } catch (error) {
    console.error('API Error:', error);
    stampMessage.value = 'Failed to submit text.';
  }
  showInput.value = false; // Hide input after submission
};

onMounted(() => {

  const pusher = new Pusher(pusherKey, {
    cluster: 'ap1',
  })

  const channel = pusher.subscribe('wally-saas')
  channel.bind('membership', (data: any) => {
    customerName.value = data?.customer.name || ''
    membershipMessage.value = data?.message || ''

    if (membershipMessage.value) {
      stampMessage.value = ''
    }

    if (customerName.value && membershipMessage.value) {
      showConfetti.value = true
      setTimeout(() => {
        showConfetti.value = false
      }, 3000)
    }
  })
  channel.bind('stamp', (eventData: any) => {
    try {
      const parsedData = eventData;

      customerName.value = parsedData?.customer?.name || '';
      stampMessage.value = parsedData?.message || 'No stamp message received';

      if (stampMessage.value) {
        membershipMessage.value = ''
      }
      
      if (customerName.value && stampMessage.value) {
        showConfetti.value = true;
        setTimeout(() => {
          showConfetti.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error handling stamp-customer data:', error);
    }
  });

})
</script>

<template>

  <div id="home" :style="{ background: 'rgb(var(--v-theme-surface))' }">

    <div id="landingHero">
      <div class="landing-hero" :class="theme.current.value.dark ? 'landing-hero-dark-bg' : 'landing-hero-light-bg'">
        <VContainer>
          <div class="hero-text-box text-center px-6">
            <h1 class="hero-title mb-4">
              Hi {{ customerName }}, Welcome to Wally
            </h1>
            <h6 class="mb-6 text-h6">
              {{ membershipMessage }}

            </h6>
            <ConfettiExplosion v-if="showConfetti" :particleCount="250" :particleSize="15" :force="1.6"
              :stageHeight="1000" :stageWidth="3000" :duration="4000" />

              <h6 v-if="stampMessage" class="mb-6 text-h6">{{ stampMessage }}</h6>

                          <!-- Toggle Button -->
            <v-btn @click="toggleInput" color="primary" block variant="outlined"> {{ showInput ? 'Close local reader' : 'Scan with local reader' }}</v-btn>


            <!-- Input Field (Shown Conditionally) -->
            <div v-if="showInput" class="input-container mt-4">
              <v-text-field ref="inputRef" v-model="inputText" @keyup.enter="submitText" :label="$t('Scan your Wally card')" class="mb-6"></v-text-field>
            </div>
          </div>
        </VContainer>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>  
.landing-hero {
  border-radius: 0 0 50px 50px;
  padding-block: 9.75rem 22rem;
  height: 100vh;
  width: 100vw;
}

.hero-animation-img {
  inline-size: 90%;
  inset-block-start: -25rem;
  inset-inline-start: 4.425rem;
  margin-inline: auto;
}

section {
  display: block;
}

.blank-section {
  background-color: rgba(var(--v-theme-surface));
  min-block-size: 25rem;
}

@media (min-width: 1280px) and (max-width: 1440px) {
  .blank-section {
    min-block-size: 18rem;
  }

  .landing-hero {
    padding-block-end: 22rem;
  }

  .hero-animation-img {
    inset-block-start: -25rem;
  }
}

@media (min-width: 900px) and (max-width: 1279px) {
  .blank-section {
    min-block-size: 13rem;
  }

  .landing-hero {
    padding-block-end: 14rem;
  }

  .hero-animation-img {
    inset-block-start: -17rem;
    inset-inline-start: 2.75rem;
  }
}

@media (min-width: 768px) and (max-width: 899px) {
  .blank-section {
    min-block-size: 12rem;
  }

  .landing-hero {
    padding-block-end: 12rem;
  }

  .hero-animation-img {
    inset-block-start: -15rem;
    inset-inline-start: 2.5rem;
  }
}

@media (min-width: 600px) and (max-width: 767px) {
  .blank-section {
    min-block-size: 12rem;
  }

  .landing-hero {
    padding-block-end: 8rem;
  }

  .hero-animation-img {
    inset-block-start: -11rem;
    inset-inline-start: 2rem;
  }
}

@media (min-width: 425px) and (max-width: 600px) {
  .blank-section {
    min-block-size: 8rem;
  }

  .landing-hero {
    padding-block-end: 8rem;
  }

  .hero-animation-img {
    inset-block-start: -9rem;
    inset-inline-start: 1.7rem;
  }
}

@media (min-width: 300px) and (max-width: 424px) {
  .blank-section {
    min-block-size: 4rem;
  }

  .landing-hero {
    padding-block-end: 6rem;
  }

  .hero-animation-img {
    inset-block-start: -7rem;
    inset-inline-start: 1.25rem;
  }
}

.landing-hero::before {
  position: absolute;
  background-repeat: no-repeat;
  inset-block: 0;
  opacity: 0.5;
}

.landing-hero-dark-bg {
  height: 100vh;
  background-color: #25293c;
  background-image: url("@images/front-pages/backgrounds/hero-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.landing-hero-light-bg {
  background: url("@images/front-pages/backgrounds/hero-bg.png") center no-repeat, linear-gradient(138.18deg, #eae8fd 0%, #fce5e6 94.44%);
  background-size: cover;
}

@media (min-width: 650px) {
  .hero-text-box {
    inline-size: 38rem;
    margin-block-end: 1rem;
    margin-inline: auto;
  }
}

@media (max-width: 599px) {
  .hero-title {
    font-size: 1.5rem !important;
    line-height: 2.375rem !important;
  }
}

.hero-title {
  animation: shine 2s ease-in-out infinite alternate;
  background: linear-gradient(135deg, #28c76f 0%, #5a4aff 47.92%, #ff3739 100%);
  //  stylelint-disable-next-line property-no-vendor-prefix
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 200% auto;
  font-size: 42px;
  font-weight: 800;
  line-height: 48px;
  -webkit-text-fill-color: rgba(0, 0, 0, 0%);
}

@keyframes shine {
  0% {
    background-position: 0% 50%;
  }

  80% {
    background-position: 50% 90%;
  }

  100% {
    background-position: 91% 100%;
  }
}
</style>
