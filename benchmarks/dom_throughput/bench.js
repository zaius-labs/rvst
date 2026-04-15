// 10k counter benchmark — pre-compiled Svelte-like output
function rvst_mount(target) {
    const N = 10000;
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    target.appendChild(container);

    const textNodes = [];
    const values = [];

    // Create 10k counter elements
    for (let i = 0; i < N; i++) {
        const span = document.createElement('span');
        span.style.width = '40px';
        span.style.height = '20px';
        span.style.fontSize = '10px';
        const text = document.createTextNode('0');
        span.appendChild(text);
        container.appendChild(span);
        textNodes.push(text);
        values.push(0);
    }

    // Benchmark: update all 10k counters
    const start = performance.now();
    for (let i = 0; i < N; i++) {
        values[i]++;
        textNodes[i].nodeValue = String(values[i]);
    }
    const elapsed = performance.now() - start;

    // Report
    const result = document.createElement('div');
    result.style.position = 'fixed';
    result.style.top = '0';
    result.style.left = '0';
    result.style.backgroundColor = '#000';
    result.style.color = '#0f0';
    result.style.padding = '8px';
    result.style.fontSize = '14px';
    result.id = 'bench-result';
    result.textContent = N + ' DOM ops in ' + elapsed.toFixed(2) + 'ms';
    target.appendChild(result);

    // Second pass — measure sustained throughput
    let frames = 0;
    let totalMs = 0;
    function tick() {
        const t0 = performance.now();
        for (let i = 0; i < N; i++) {
            values[i]++;
            textNodes[i].nodeValue = String(values[i]);
        }
        const dt = performance.now() - t0;
        totalMs += dt;
        frames++;
        if (frames < 60) {
            requestAnimationFrame(tick);
        } else {
            result.textContent = N + ' ops x ' + frames + ' frames: avg ' + (totalMs / frames).toFixed(2) + 'ms/frame';
        }
    }
    requestAnimationFrame(tick);
}
