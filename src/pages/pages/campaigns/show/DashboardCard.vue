<script setup lang="ts">
import { ref, watch, computed, PropType } from 'vue';

const props = defineProps({
  data: {
    type: Array as PropType<
      Array<{ title: string; value: number | null; icon: string; desc: string; change?: number; color?: string }>
    >,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const gridCols = computed(() => {
  const cardCount = props.data.length;
  if (cardCount === 5) {
    return '2';
  } else if (cardCount === 4) {
    return '3';
  } else if (cardCount === 3) {
    return '4';
  } else {
    return '6'; 
  }
});

const cardHoverStates = ref(props.data.map(() => false));

watch(
  () => props.data,
  (newData) => {
    cardHoverStates.value = newData.map(() => false);
  }
);
</script>

<template>
  <VRow class="d-flex justify-space-evenly align-center flex-wrap">
    <VCol
      v-for="(data, index) in props.data"
      :key="index"
      class="d-flex justify-center"
      :cols="12"
      :sm="6"
      :md="gridCols"
    >
      <VCard
        class="logistics-card-statistics cursor-pointer"
        :style="data.isHover ? `border-block-end-color: rgb(var(--v-theme-${data.color}))` : `border-block-end-color: rgba(var(--v-theme-${data.color}),0.38)`"
        @mouseenter="data.isHover = true"
        @mouseleave="data.isHover = false"
      >
        <VCardText>
          <div class="d-flex align-center gap-x-4 mb-1">
            <VAvatar
              variant="tonal"
              :color="data.color"
              rounded
            >
              <VIcon
                :icon="data.icon"
                size="28"
              />
            </VAvatar>
            <h4 class="text-h4">
                  <span v-if="props.isLoading">
                    <v-progress-circular indeterminate size="24" />
                  </span>
                  <h4 class="text-h4" v-else>
                    {{ data.value }}
                  </h4>
                </h4>
          </div>
          <div class="text-body-1 mb-1">
            {{ data.title }}
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics {
  border-block-end-style: solid;
  border-block-end-width: 2px;

  &:hover {
    border-block-end-width: 3px;
    margin-block-end: -1px;

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}

.skin--bordered {
  .logistics-card-statistics {
    border-block-end-width: 2px;

    &:hover {
      border-block-end-width: 3px;
      margin-block-end: -2px;
      transition: all 0.1s ease-out;
    }
  }
}

.logistics-card-statistics {
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
  transition: width 0.2s ease; 
}

[data-col="4"] .logistics-card-statistics {
  max-width: 300px;
}

[data-col="3"] .logistics-card-statistics {
  max-width: 350px;
}
</style>
