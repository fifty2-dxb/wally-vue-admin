<script setup lang="ts">

const isNewOrganisationVisible = ref(false)

const wallyMerchants = [
  {
    avatarColor: 'success',
    avatarIcon: 'tabler-mail',
    title: 'Kahve Dünyasi',
    count: '32',
    stats: '0.3%',
    statsColor: 'success',
  },
  {
    avatarColor: 'success',
    avatarIcon: 'tabler-mail',
    title: 'Supper Coffee',
    count: '94',
    stats: '10.3%',
    statsColor: 'success',
  }
]

const mcMerchants = [
  {
    avatarColor: 'success',
    avatarIcon: 'tabler-mail',
    title: 'McDonalds Kadikoy',
    count: '32',
    stats: '0.3%',
    statsColor: 'success',
  }
]

const moreList = [
  { title: 'Add Merchant', value: 'add' },
  { title: 'Edit Organisation', value: 'edit' },
  { title: 'Delete Organisation', value: 'Delete' },
]
</script>

<template>
  <!-- 👉 Add New Card Dialog -->
  <CardAddEditOrganisation v-model:isDialogVisible="isNewOrganisationVisible" />


  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        Organisations
      </h4>
      <div class="text-body-1">
        Create or edit your organisations
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">

      <VBtn @click="isNewOrganisationVisible = !isNewOrganisationVisible">New Organisation</VBtn>
    </div>
  </div>
  <VRow>
    <!-- 👉 Organisation Card -->
    <VCol cols="12" sm="6" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>Wally</VCardTitle>
          <VCardSubtitle>
            250 Customers
          </VCardSubtitle>
          <template #append>
            <div class="mt-n4 me-n2">
              <MoreBtn :menu-list="moreList" />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem v-for="state in wallyMerchants" :key="state.title">

              <VListItemTitle class="font-weight-medium me-4">
                {{ state.title }}
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ state.count }}
                  </div>
                  <div :class="`text-${state.statsColor}`">
                    {{ state.stats }}
                  </div>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>McDonalds</VCardTitle>
          <VCardSubtitle>
            250 Customers
          </VCardSubtitle>
          <template #append>
            <div class="mt-n4 me-n2">
              <MoreBtn :menu-list="moreList" />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem v-for="state in mcMerchants" :key="state.title">

              <VListItemTitle class="font-weight-medium me-4">
                {{ state.title }}
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ state.count }}
                  </div>
                  <div :class="`text-${state.statsColor}`">
                    {{ state.stats }}
                  </div>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
