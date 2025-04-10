<script setup lang="ts">
import { reactive, watch } from 'vue';
import { defineProps, defineEmits, withDefaults } from 'vue';

const props = withDefaults(defineProps<{
  appleSettings: {
    enabled: boolean;
    webServiceURL?: string;
    associatedStoreIdentifiers?: string;
    teamIdentifier?: string;
    sharingProhibited?: boolean;
    passTypeIdentifier?: string;
    authenticationToken?: string;
    nfcEnabled?: boolean;
    encryptionPublicKey?: string;
    properties?: any;
  };
  data: {
    template: {
      type: string;
      guestEnabled: boolean;
      details: {
        industry?: string;
        properties?: any;
      };
    };
  };
}>(), {
  appleSettings: () => ({
    enabled: false,
    webServiceURL: '',
    associatedStoreIdentifiers: '',
    teamIdentifier: '',
    sharingProhibited: false,
    passTypeIdentifier: '',
    authenticationToken: '',
    nfcEnabled: false,
    encryptionPublicKey: '',
    properties: {},
  }),
  data: () => ({
    template: {
      type: '',
      guestEnabled: false,
      details: {
        industry: '',
        properties: {},
      },
    },
  }),
});

const data = reactive(props.data);
const appleSettings = reactive(props.appleSettings);

const emits = defineEmits(['updateAppleSettings', 'update:data']);

watch(() => appleSettings, (newSettings) => {
  emits('updateAppleSettings', newSettings);
}, { deep: true });

watch(() => data, (newData) => {
  emits('update:data', newData);
}, { deep: true });

const industryOptions = [
  { title: 'Retail', value: 'retail' },
  { title: 'Hospitality', value: 'hospitality' },
  { title: 'Healthcare', value: 'healthcare' },
  { title: 'Education', value: 'education' },
  { title: 'Technology', value: 'technology' },
  { title: 'Finance', value: 'finance' },
  { title: 'Manufacturing', value: 'manufacturing' },
  { title: 'Real Estate', value: 'real_estate' },
  { title: 'Entertainment', value: 'entertainment' },
  { title: 'Other', value: 'other' },
];
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


    <v-card class="elevation-0 mt-4" :title="$t('Industry Settings')">
      <v-card-text>
        <v-select
          v-model="data.template.details.industry"
          :items="industryOptions"
          item-title="title"
          item-value="value"
          :label="$t('Industry')"
          density="comfortable"
          variant="outlined"
          clearable
          class="mb-4"
        ></v-select>
      </v-card-text>
    </v-card>
  </div>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Apple configuration')">
    <v-card-text>
      <v-text-field v-model="appleSettings.webServiceURL" label="Web Service URL" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="appleSettings.associatedStoreIdentifiers" label="Associated Store Identifiers" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="appleSettings.teamIdentifier" label="Team Identifier" />
    </v-card-text>
    <v-card-text>
      <v-checkbox v-model="appleSettings.sharingProhibited" label="Sharing Prohibited" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="appleSettings.passTypeIdentifier" label="Pass Type Identifier" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="appleSettings.authenticationToken" label="Authentication Token" />
    </v-card-text>
    <v-card-text>
      <v-checkbox v-model="appleSettings.nfcEnabled" label="NFC Enabled" />
    </v-card-text>
    <v-card-text>
      <v-text-field v-model="appleSettings.encryptionPublicKey" label="NFC Encrytion Public Key" />
    </v-card-text>    
  </v-card>
</template>
