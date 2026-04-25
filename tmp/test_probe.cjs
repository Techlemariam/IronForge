const WebSocket = require('ws');

const wsUrl = 'ws://localhost:9000/devtools/page/2375ADC5154FFB6D21970160F7A28851';
const ws = new WebSocket(wsUrl);

const probeExpression = `(() => {
    const q = (s) => document.querySelector(s);
    const hasCascade = !!q('#cascade, #conversation, #chat, [id*="cascade"], [id*="conversation"], [id*="chat"]');
    const hasComposer = !!q('[data-lexical-editor="true"][contenteditable="true"], [contenteditable="true"][role="textbox"], textarea');
    const hasMessages = !!q('[data-message-id], [data-testid*="message" i], [class*="message"], article, [role="article"]');
    const hasCommandPalette = !!q('.quick-input-widget, [id*="quickInput" i], [aria-label*="Type a command" i]');
    return { hasCascade, hasComposer, hasMessages, hasCommandPalette, title: String(document.title || ''), href: String(location.href || '') };
})()`;

ws.on('open', () => {
  console.log('Connected to CDP');
  ws.send(
    JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: probeExpression,
        returnByValue: true,
      },
    })
  );
});

ws.on('message', (data) => {
  let response;
  try {
    response = JSON.parse(data);
  } catch (e) {
    console.error('Invalid JSON from CDP:', e);
    ws.close();
    return;
  }
  if (response.id !== 1) return;
  if (response.result?.exceptionDetails) {
    console.error(
      'Runtime.evaluate exception:',
      JSON.stringify(response.result.exceptionDetails, null, 2)
    );
    ws.close();
    return;
  }
  if (response.result?.result?.value !== undefined) {
    console.log('Probe Result:', JSON.stringify(response.result.result.value, null, 2));
  } else {
    console.warn('Unexpected response shape:', JSON.stringify(response, null, 2));
  }
  ws.close();
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
});
