<script>
  import { Tabs } from 'bits-ui';
  let value = $state('profile');
</script>

<div class="app">
  <h2 class="title">bits-ui Tabs</h2>
  <Tabs.Root bind:value class="tabs-root">
    <Tabs.List class="tabs-list">
      <Tabs.Trigger value="profile" class="tab-trigger">Profile</Tabs.Trigger>
      <Tabs.Trigger value="settings" class="tab-trigger">Settings</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="profile" class="tab-content">
      <div class="content-card">
        <h3 class="card-title">Your Profile</h3>
        <p class="card-text">Name: Demo User</p>
        <p class="card-text">Email: demo@example.com</p>
      </div>
    </Tabs.Content>
    <Tabs.Content value="settings" class="tab-content">
      <div class="content-card">
        <h3 class="card-title">Settings</h3>
        <p class="card-text">Theme: Dark</p>
        <p class="card-text">Notifications: On</p>
      </div>
    </Tabs.Content>
  </Tabs.Root>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    font-family: sans-serif;
    max-width: 480px;
    color: #eee;
  }

  .title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  :global(.tabs-root) {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  :global(.tabs-list) {
    display: flex;
    gap: 2px;
    padding-bottom: 0;
    border-bottom: 2px solid #2a2a3a;
  }

  :global(.tab-trigger) {
    padding: 10px 18px;
    font-size: 14px;
    color: #aaa;
    background: transparent;
    border-radius: 5px 5px 0 0;
  }

  :global(.tab-content) {
    padding: 20px 0;
  }

  .content-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: #1e1e2e;
    border-radius: 8px;
  }

  .card-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .card-text {
    margin: 0;
    font-size: 13px;
    color: #aaa;
  }
</style>
