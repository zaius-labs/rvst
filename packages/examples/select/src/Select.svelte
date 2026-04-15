<script>
  let color = $state('red');
</script>
<div>
  <select bind:value={color}>
    <option value="red">Red</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
  </select>
  <span>Selected: {color}</span>
</div>
