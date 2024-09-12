<script lang="ts" setup>
import { defineEmits, defineProps } from 'vue';

interface Props {
  menuList?: { title: string; value: string }[];
  organisationGuid: string;
  organisation: {};
  itemProps?: boolean;
  iconSize?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: 'text-disabled',
});

const emit = defineEmits<{
  (e: 'option-selected', value: string, organisationGuid: string, organisation: {}): void;
}>();

const handleClick = (value: string) => {
  emit('option-selected', value, props.organisationGuid, props.organisation);
};
</script>

<template>
  <IconBtn :class="props.class">
    <VIcon :size="props.iconSize" icon="tabler-dots-vertical" />

    <VMenu v-if="props.menuList" activator="parent">
      <VList>
        <VListItem v-for="item in props.menuList" :key="item.value" @click="handleClick(item.value)">
          {{ item.title }}
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
