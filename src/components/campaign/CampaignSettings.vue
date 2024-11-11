<script setup lang="ts">
import { reactive, toRefs, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  appleSettings: Object
});
const emits = defineEmits(['updateAppleSettings']);

const settings = reactive({ ...props.appleSettings });

watch(settings, (newSettings) => {
  emits('updateAppleSettings', newSettings);
}, { deep: true });
</script>

<template>
  <v-card>
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
