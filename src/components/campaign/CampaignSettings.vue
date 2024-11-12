<script setup lang="ts">
import { reactive, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  appleSettings: Object,
  data: Object,
});

const emits = defineEmits(['updateAppleSettings']);

const settings = reactive({ ...props.appleSettings });

console.log(props.data);
watch(settings, (newSettings) => {
  emits('updateAppleSettings', newSettings);
}, { deep: true });
</script>

<template>
  <div v-if="data.template.type === 'stamp'">
    <v-card class="elevation-0" :title="$t('Stamp configuration')">
      <v-card-text>
        <v-select v-model="data.template.properties.stampLimitType" label="Stamp Limit"
          :items="['daily', 'weekly', 'monthly', 'unlimited']" class="mb-6" />
        <v-select v-model="data.template.properties.redeemLimitType" label="Redeem Limit"
          :items="['daily', 'weekly', 'monthly', 'unlimited']" class="mb-6" />
      </v-card-text>
    </v-card>
  </div>
  <div v-if="data.template.type === 'membership'">
    <v-card class="elevation-0" :title="$t('Guest configuration')">
      <v-card-text>
        <v-checkbox v-model="data.template.guestEnabled" label="Guest Enabled" class="mb-6"></v-checkbox> </v-card-text>
    </v-card>
  </div>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Apple configuration')">
    <v-card-text>
      <v-text-field v-model="settings.webServiceURL" label="Web Service URL" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="settings.associatedStoreIdentifiers" label="Associated Store Identifiers" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="settings.teamIdentifier" label="Team Identifier" />
    </v-card-text>
    <v-card-text>
      <v-checkbox v-model="settings.sharingProhibited" label="Sharing Prohibited" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="settings.passTypeIdentifier" label="Pass Type Identifier" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="settings.authenticationToken" label="Authentication Token" />
    </v-card-text>
  </v-card>
</template>
