<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="tabler-heart-filled"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="https://fifty2.ae"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Fifty2 Digital Solutions</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <span>Version 1.0.0</span>
      <span>Terms of Service</span>
      <span>Privacy Policy</span>
    </span>
  </div>
</template>
