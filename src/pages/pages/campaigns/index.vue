<script setup lang="ts">
import iphoneLayout from '@images/iphoneLayout.png';

const campaigns = ref(null)

try {
    const res = await $wallyApi('/campaigns/merchant/955e94c0-2576-46e5-b3e3-78811e0d431c', {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })

    const { status, campaign_details } = res    

    if (status === 'success') {
      console.log(campaign_details)
      campaigns.value = campaign_details
    }
  }
  catch (err) {
    console.error(err)
  }

</script>

<template>
      <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 font-weight-medium">
          Campaigns
        </h4>
        <div class="text-body-1">
          Show all campaigns
        </div>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">

        <VBtn @click="$router.push('/pages/campaigns/create')">Create new campaign</VBtn>
      </div>
    </div>
  <VRow>
    <!-- 👉 Apple iPhone 11 Pro -->
    <VCol
      sm="6"
      cols="12"
      v-for="c in campaigns"
    >
      <VCard>
        <div class="d-flex justify-space-between flex-wrap flex-md-nowrap flex-column flex-md-row">
          <div class="ma-auto pa-5">
            <VImg
              width="137"
              height="176"
              style="object-fit: cover;object-position: center top;"
              :src="iphoneLayout"
            />
          </div>

          <VDivider :vertical="$vuetify.display.mdAndUp" />

          <div>
            <VCardItem>
              <VCardTitle>{{ c.campaignName }}</VCardTitle>
            </VCardItem>

            <VCardText>
              {{ c.campaignDescription }}
            </VCardText>

            <VCardActions class="justify-space-between mt-10">

              <VBtn :to="{ name: 'pages-campaigns-show', params: { id: c.merchant.merchantGuid } }">
                <VIcon icon="tabler-folder-open" />
                <span class="ms-2">Show Campaign</span>
              </VBtn>

              <IconBtn
                color="secondary"
                icon="tabler-share"
              />
            </VCardActions>
          </div>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>
