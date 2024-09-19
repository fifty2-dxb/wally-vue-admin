<script setup lang="ts">
import { toRefs, computed } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  activeTab: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:activeTab']);

// Directly use the activeTab prop for two-way binding
const currentStep = computed({
  get() {
    return props.activeTab;
  },
  set(value) {
    emit('update:activeTab', value);
  },
});
</script>

<template>
  <VSlideGroup
    v-model="currentStep"
    show-arrows
    mandatory
  >
    <VSlideGroupItem
      v-for="(step, index) in steps"
      :key="step.title"
      v-slot="{ isSelected, toggle }"
      :value="index"
    >
      <div
        style="block-size: 100px; inline-size: 110px; min-width:160px"
        :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
        :class="isSelected ? 'border' : 'border border-dashed'"
        class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
        @click="toggle"
      >
        <VAvatar
          rounded
          size="38"
          :color="isSelected ? 'primary' : ''"
          variant="tonal"
          class="mb-2"
        >
          <VIcon :icon="step.icon" size="22" />
        </VAvatar>
        <h6 class="text-base font-weight-medium mb-0">
          {{ step.title }}
        </h6>
      </div>
    </VSlideGroupItem>
  </VSlideGroup>
</template>
