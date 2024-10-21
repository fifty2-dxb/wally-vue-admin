<template>
  <div class="w-100 pb-3">
    <div class="d-flex align-center justify-center flex-column">
      <div class="preview-container">
        <div class="pb-3">
          <div class="google-container">
            <v-img src="/images/loyalty/iphoneLayout.svg" alt="" width="300px">
              <div class="notification-container">
                <div class="notification-window">
                  <div class="company-icon"></div>
                  <header class="notification-header">
                    <div class="header-content">
                      <span class="company-name"> • wally • now</span>
                    </div>
                  </header>
                  <div class="content">{{ notificationData?.message || 'Default message' }}</div>
                </div>
              </div>
            </v-img>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notificationData: {
    type: Object,
    default: () => ({})
  }
});

</script>

<style>
.notification-container {
  position: relative;
  top: 170px;
  width: 260px;
  cursor: auto;
  margin: auto;
}

.notification-window {
  display: grid;
  grid-template-columns: 24px auto 24px;
  grid-template-areas:
    "icon head collapse"
    "blank message message";
  grid-template-rows: auto;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(24, 39, 75, 0.12) 0px 6px 12px -6px, rgba(24, 39, 75, 0.08) 0px 8px 24px -4px;
  gap: 12px;
  padding: 20px;
  border-radius: 28px;
}

.notification-header {
  grid-area: head;
  display: grid;
  gap: 4px 8px;
  width: 100%;
  height: auto;
  font-size: 12px;
  grid-template: auto / auto;
}

.header-content {
  display: flex;
  flex-flow: row;
  align-items: center;
  column-gap: 1px;
}

.company-name {
  min-width: max-content;
  white-space: nowrap;
  color: #051b2c;
}

.content {
  grid-area: message;
  color: #051b2c;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  letter-spacing: 0.1px;
  margin: 0px;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  word-break: break-word;
}

.company-icon {
  grid-area: icon;
  display: flex;
  background-image: url('/favicon.ico');
  background-size: contain; 
  background-repeat: no-repeat;
  width: 44px;
  height: 24px;
  justify-content: center;
  align-items: center;
}

</style>
