# sraideia-loja

Script da loja Tray da Sra Ideia (www.senhoraideia.com.br).

- `loja.js`: modo orçamento, lista de orçamento, botões de WhatsApp, página inicial etc.
- Carregado na Tray (Configurações → Ferramentas de atendimento) por:

```html
<script src="https://cdn.jsdelivr.net/gh/RafaelHMS/sraideia-loja@main/loja.js"></script>
```

O CSS (bloco `<style>`) continua direto no campo da Tray, para os preços ficarem escondidos desde o primeiro instante.

Depois de alterar `loja.js`, limpe o cache do jsDelivr:
https://purge.jsdelivr.net/gh/RafaelHMS/sraideia-loja@main/loja.js
