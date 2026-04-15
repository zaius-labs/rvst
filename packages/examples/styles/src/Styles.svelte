<script>
  let color = $state('blue');
  let bold = $state(false);
</script>

<div>
  <button onclick={() => color = color === 'blue' ? 'red' : 'blue'}>Toggle Color</button>
  <button onclick={() => bold = !bold}>Toggle Bold</button>
  <p style:color={color} style:font-weight={bold ? 'bold' : 'normal'}>Demo Text</p>
  <div>Color: {color}</div>
  <div>Bold: {bold}</div>
</div>
