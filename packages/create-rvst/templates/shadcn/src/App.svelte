<script>
  import { Tabs } from 'bits-ui';

  let value = $state('profile');
</script>

<div class="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 font-sans text-sm">

  <div class="flex flex-row items-center gap-4 px-6 py-3 bg-zinc-900 border-b border-zinc-800">
    <span class="text-base font-semibold text-white">My App</span>
    <span class="flex-1"></span>
    <button class="px-3 py-1 rounded-md bg-white text-zinc-900 font-medium text-sm">
      Action
    </button>
  </div>

  <div class="flex flex-col flex-1 px-8 py-6 gap-6">
    <Tabs.Root bind:value class="flex flex-col gap-0">
      <Tabs.List class="flex flex-row gap-1 border-b border-zinc-800 pb-0">
        <Tabs.Trigger value="profile"
          class="px-4 py-2 text-sm rounded-t-md {value === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}">
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger value="settings"
          class="px-4 py-2 text-sm rounded-t-md {value === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}">
          Settings
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="profile" class="py-6">
        <div class="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md">
          <h3 class="text-base font-semibold text-white">Your Profile</h3>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-zinc-500">Name</span>
            <span class="text-sm text-zinc-100">Demo User</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-zinc-500">Email</span>
            <span class="text-sm text-zinc-100">demo@example.com</span>
          </div>
          <button class="px-4 py-2 rounded-md bg-white text-zinc-900 font-medium text-sm w-fit">
            Edit Profile
          </button>
        </div>
      </Tabs.Content>

      <Tabs.Content value="settings" class="py-6">
        <div class="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md">
          <h3 class="text-base font-semibold text-white">Settings</h3>
          <div class="flex flex-row items-center justify-between py-2 border-b border-zinc-800">
            <span class="text-sm text-zinc-300">Dark Mode</span>
            <span class="text-sm text-zinc-500">On</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 border-b border-zinc-800">
            <span class="text-sm text-zinc-300">Notifications</span>
            <span class="text-sm text-zinc-500">Enabled</span>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
