<template>
  <v-card class="elevation-0" :title="$t('Fields')" :subtitle="$t('Please select fields shown on card')">
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-h6 text-center mb-6"><v-icon class="mr-3" size="24" icon="tabler-brand-apple"></v-icon></div>
          <v-select :label="$t('Field 1')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f1" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 2')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f2" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 3')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f3" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 4')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f4" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 5')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f5" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 6')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.apple.f6" outlined class="mb-6"></v-select>
        </v-col>
        <v-col cols="6">
          <div class="text-h6 text-center mb-6"><v-icon class="mr-3" size="24" icon="tabler-brand-android"></v-icon></div>
          <v-select :label="$t('Field 1')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f1" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 2')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f2" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 3')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f3" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 4')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f4" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 5')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f5" outlined class="mb-6"></v-select>
          <v-select :label="$t('Field 6')" :items="fieldList" item-title="name" item-value="key" variant="outlined" v-model="value.template.fields.google.f6" outlined class="mb-6"></v-select>
        </v-col>

        
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
// get data from v-model
import { ref, watch, computed } from 'vue'
import TemplateService from '@/services/TemplateService';

const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const fieldList = ref(TemplateService.getFields())




</script>