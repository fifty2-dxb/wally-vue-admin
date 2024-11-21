<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardText, VCardTitle, VDialog, VDivider, VIcon } from 'vuetify/components';

const props = defineProps({
  open: Boolean,
  cert: Object,
});
const emit = defineEmits(['close']);

const dialogVisible = ref(props.open);
watch(() => props.open, (newVal) => {
  dialogVisible.value = newVal;
});

const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 900">
    <DialogCloseBtn @click="closeDialog" />
    <VCard class="pa-6">
      <VCardTitle class="text-h5 font-weight-bold">
        {{ $t("Apple Wallet Certificate") }}
      </VCardTitle>
      <VDivider class="my-4" />

      <VCardText class="text-body-1">
        {{$t(`To create passes for Apple Wallet, you need a certificate from Apple. Apple Wallet certificates are
        non-transferable permissions by Apple and cannot be provided by Wally (even for a fee).`)}}
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-1-filled" />
        <h4 class="mb-0">{{$t("Download the Certificate Signing Request (CSR)")}}</h4>
      </div>
      <VCardText>
       {{$t(" In Settings / Certificates, click")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("New Apple Wallet Certificate")}}</span>
        {{$t("and")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("Next")}}</span>.
        {{$t("Using")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("Download CSR")}}</span>,
        {{$t("you can download the certificate signing request")}}.
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-2-filled" />
        <h4 class="mb-0">{{$t("Upload CSR to Apple, Download Certificate")}}</h4>
      </div>
      <VCardText>
       {{$t(" Sign up for the")}} <a href="https://developer.apple.com/account/">{{$t("Apple Developer Program")}}</a> {{$t(`(paid membership
        required, $99/year). You don't need a Mac or special software`)}}. <br />
        {{$t("Follow the steps in")}} <a
          href="https://developer.apple.com/help/account/configure-app-capabilities/create-wallet-identifiers-and-certificates#register-a-pass-type-identifier">
          {{$t("Apple's Guide")}}</a>:
        <ul>
          <li>{{$t(`"Register a Pass Type Identifier"`)}}</li>
          <li>{{$t(`"Create a Pass Type ID Certificate"`)}}</li>
        </ul>
        {{$t("Pass Type IDs should contain your reversed domain name, e.g.,")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("example.com")}}</span> {{$t("becomes")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("pass.com.example.membershipCard")}}</span>.
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-3-filled" />
        <h4 class="mb-0">{{$t("Upload Certificate Here")}}</h4>
      </div>
      <VCardText>
        {{$t("Click")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("Upload Certificate")}}</span>,
        {{$t("select the certificate you downloaded, and press")}}
        <span class="btn btn-sm btn-primary mx-1">{{$t("Save")}}</span>.
        {{$t("You can now use the certificate for your passes")}}.
      </VCardText>

      <VDivider class="my-2" />

      <VCardText class="d-flex justify-end">
        <VBtn color="primary" @click="closeDialog">{{$t("Ok")}}</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
