<script setup lang="ts">
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'

import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { useUserStore } from '@/stores/user'

const imageVariant = useGenerateImageVariant(authV2RegisterIllustrationLight,
  authV2RegisterIllustrationDark,
  authV2RegisterIllustrationBorderedLight,
  authV2RegisterIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const form = ref({
  email: '',
  password: '',
  name: '',
  cLimit: 0,
  mLimit: 0,
  oLimit: 0,
  revokeAccess: 0,
  privacyPolicies: false,
})

const isPasswordVisible = ref(false)
const errors = ref<Record<string, string | undefined>>({
  name: undefined,
  email: undefined,
  password: undefined,
})

const userStore = useUserStore();


const refVForm = ref<VForm>()

const router = useRouter()

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarType = ref('success') // 'success' or 'error'

const register = async () => {
  try {
    const res = await $wallyApi('/users/register', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password,
        name: form.value.name,
        cLimit: form.value.cLimit,
        mLimit: form.value.mLimit,
        oLimit: form.value.oLimit,
        revokeAccess: form.value.revokeAccess,
        LastLogonTime: new Date().toISOString(),
      },
      onResponseError({ response }) {
        const errorMessages = response._data.message;

        const errorMessage = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;

        showSnackbar.value = true;
        snackbarMessage.value = errorMessage;
        snackbarType.value = 'error';
      },
    })

    showSnackbar.value = true;
    snackbarMessage.value = 'Registration successful.';
    snackbarType.value = 'success';
    console.log('Redirecting to: /organisations');

    setTimeout(() => {
      router.replace('/pages/organisations');
    }, 3000);

  } catch (err) {
    console.error(err);
  }
};

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      register()
    }
  })
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100 me-0">
        <div class="d-flex align-center justify-center w-100 h-100" style="padding-inline: 100px;">
          <VImg max-width="500" :src="imageVariant" class="auth-illustration mt-16 mb-2" />
        </div>
        <img class="auth-footer-mask" :src="authThemeMask" alt="auth-footer-mask" height="280" width="100">
      </div>
    </VCol>

    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Adventure starts here 🚀
          </h4>
          <p class="mb-0">
            Make your app management easy and fun!
          </p>
        </VCardText>

        <VCardText>
          <!-- Snackbar for Success or Error -->
          <VSnackbar v-model="showSnackbar" :color="snackbarType === 'success' ? 'success' : 'error'" location="top"
            right>
            {{ snackbarMessage }}
          </VSnackbar>

          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <AppTextField v-model="form.name" :rules="[requiredValidator]" autofocus label="Username"
                  placeholder="Johndoe" :error-messages="errors.name" />
              </VCol>

              <!-- Email -->
              <VCol cols="12">
                <AppTextField v-model="form.email" :rules="[requiredValidator, emailValidator]" label="Email"
                  type="email" placeholder="johndoe@email.com" :error-messages="errors.email" />
              </VCol>

              <!-- Password -->
              <VCol cols="12">
                <AppTextField v-model="form.password" :rules="[requiredValidator]" label="Password"
                  placeholder="············" :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                <div class="d-flex align-center my-6">
                  <VCheckbox id="privacy-policy" v-model="form.privacyPolicies" inline />
                  <VLabel for="privacy-policy" style="opacity: 1;">
                    <span class="me-1 text-high-emphasis">I agree to</span>
                    <a href="javascript:void(0)" class="text-primary">privacy policy & terms</a>
                  </VLabel>
                </div>

                <VBtn block type="submit">
                  Sign up
                </VBtn>
              </VCol>

              <!-- Already have an account -->
              <VCol cols="12" class="text-center text-base">
                <span class="d-inline-block">Already have an account?</span>
                <RouterLink class="text-primary ms-1 d-inline-block" :to="{ name: 'login' }">
                  Sign in instead
                </RouterLink>
              </VCol>

              <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- Auth providers -->
              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
