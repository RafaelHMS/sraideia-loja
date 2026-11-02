(function () {
var WHATSAPP = "5512991960856";   // (12) 99196-0856 - DDI 55 + DDD + numero, so numeros
var LOJA = "Sra Ideia";
var INSTAGRAM = "https://www.instagram.com/sraideiasublimacao/";
var AVISO_TOPO = "Orçamento rápido pelo WhatsApp (12) 99196-0856 • Personalizamos com a sua marca";
var BENEFICIOS = [
["Orçamento sem compromisso", "resposta rápida pelo WhatsApp"],
["Enviamos para todo o Brasil", "frete informado no orçamento"],
["Estoque sempre atualizado", "direto do fornecedor"],
["Personalização", "com o seu nome ou a sua marca"]
];
var PAGINAS_OCULTAS = ["/pagamento", "/tempo-de-garantia"];
var CHAVE = "sraideia_orcamento_v1";
var MINIMO = 10;                  // pedido minimo (unidades) nos Brindes atacado
// Precos da personalizacao: aba "Faixas" da planilha "Sra-Ideia-Precificacao-Personalizacao" (publicada como CSV).
// A Monica muda os valores na aba "Valores" da planilha; o site le daqui.
var FAIXAS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcCRGPJP7o83XoZMwcAeQ958SERlb8cc-BrWzASQ6S9a5bmhqWf3GFclMpHDf-79X8DSZtPtHuIYQY/pub?gid=108716330&single=true&output=csv";
function csvLinhas(t) {
var out = [], lin = [], campo = "", aspas = false;
for (var i = 0; i < t.length; i++) {
var c = t[i];
if (aspas) { if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else aspas = false; } else campo += c; }
else if (c === '"') aspas = true;
else if (c === ",") { lin.push(campo); campo = ""; }
else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; lin.push(campo); out.push(lin); lin = []; campo = ""; }
else campo += c;
}
if (campo || lin.length) { lin.push(campo); out.push(lin); }
return out;
}
function num(v) { return parseFloat(String(v || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")); }
function reais(v) { return "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
var faixasPromessa = null;
function carregarFaixas() {
if (faixasPromessa) return faixasPromessa;
var CH = "sraideia_faixas_v1";
try { var g = JSON.parse(sessionStorage.getItem(CH)); if (g && Date.now() - g.t < 600000 && g.f.length) return (faixasPromessa = Promise.resolve(g.f)); } catch (e) {}
faixasPromessa = fetch(FAIXAS_CSV).then(function (r) { return r.text(); }).then(function (t) {
var f = [];
csvLinhas(t).forEach(function (l) {
var preco = num(l[5]), larg = num(l[2]), alt = num(l[3]);
if (l[0] && l[1] && l[0] !== "Técnica" && preco > 0 && larg > 0 && alt > 0) f.push({ tecnica: l[0].trim(), faixa: l[1].trim(), larg: larg, alt: alt, preco: preco });
});
try { sessionStorage.setItem(CH, JSON.stringify({ t: Date.now(), f: f })); } catch (e) {}
return f;
}).catch(function () { return []; });
return faixasPromessa;
}
(function () {
var st = document.createElement("style");
st.textContent = ".si-est-campos{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.si-est-campos select{flex:1 1 200px;padding:8px;border:1px solid #ccc;border-radius:8px;font:inherit;background:#fff}" +
".si-est-res strong{color:#1f7a99;font-size:1.05em}.si-est-res small{display:block;color:#777;margin-top:4px}";
document.head.appendChild(st);
})();
function areaGravacao() {
var m = (document.body.innerText || "").match(/Área para gravação:\s*([\d.,]+)\s*(?:cm)?\s*[x×]\s*([\d.,]+)/i);
return m ? [num(m[1]), num(m[2])].sort(function (a, b) { return a - b; }) : null;
}
// Técnicas adequadas por material (ordem importa: a primeira regra que bate vale)
var REGRAS_TECNICA = [
[/sublima/, ["sublima"]],
[/inox|\ba[cç]o\b|alum[ií]nio|metal|ferro/, ["laser", "uv"]],
[/cer[aâ]mica|porcelana/, ["sublima", "uv"]],
[/vidro/, ["uv"]],
[/bambu|madeira|\bmdf\b|corti[cç]a/, ["laser"]],
[/couro|\bpu\b|poliuretano/, ["uv"]],
[/poli[eé]ster|taf[eé]t[aá]/, ["dtf", "sublima"]],
[/algod[aã]o|nylon|n[aá]ilon|oxford|tecido|lona|feltro|juta|\btnt\b|sarja|jacquard|neoprene|malha|veludo/, ["dtf"]],
[/pl[aá]stico|acr[ií]lico|\bpvc\b|\babs\b|\bpp\b|silicone|borracha|\beva\b/, ["uv"]],
[/papel|kraft|couch[eê]/, ["uv"]]
];
function tecnicasDoProduto() {
var tx = document.body.innerText || "", alvo = "", m = null;
var lis = document.querySelectorAll("li");
for (var k = 0; k < lis.length && !m; k++) m = (lis[k].textContent || "").match(/^\s*Material do produto:\s*(.+?)\s*$/i);
if (!m) m = tx.match(/Material\s*:\s*([^\n]+)/i);
if (m) alvo = m[1].split(/,| e /)[0];
var h1 = document.querySelector("h1");
var nome = h1 ? h1.textContent : "";
var busca = [alvo, nome];
for (var b = 0; b < busca.length; b++) {
var t = (busca[b] || "").toLowerCase();
if (!t) continue;
for (var i = 0; i < REGRAS_TECNICA.length; i++) if (REGRAS_TECNICA[i][0].test(t)) return REGRAS_TECNICA[i][1];
}
return null;
}
function chaveTecnica(nome) {
var t = nome.toLowerCase();
if (/sublima/.test(t)) return "sublima";
if (/laser/.test(t)) return "laser";
if (/\buv\b/.test(t)) return "uv";
if (/dtf/.test(t)) return "dtf";
return t;
}
// Personalizados: "Sem personalização" primeiro e o resto do menor para o maior preço; some o "Máximo de N caracteres"
function ajustarInfoAdicional() {
var sels = document.querySelectorAll('select[name="informacoesAdicionais[]"], select.infoSelects');
for (var i = 0; i < sels.length; i++) {
var s = sels[i];
if (s.getAttribute("data-si-ord") === String(s.options.length)) continue;
var ops = [].slice.call(s.options), atual = s.value;
var vazio = ops.filter(function (o) { return !o.value || /^selecione/i.test(o.text.trim()); });
var resto = ops.filter(function (o) { return vazio.indexOf(o) < 0; });
var preco = function (o) { var m = o.text.match(/R\$\s*([\d.,]+)/); return m ? num(m[1]) : 0; };
resto.sort(function (a, b) {
var sa = /^sem /i.test(a.text.trim()) ? 0 : 1, sb = /^sem /i.test(b.text.trim()) ? 0 : 1;
return sa - sb || preco(a) - preco(b) || a.text.localeCompare(b.text);
});
vazio.concat(resto).forEach(function (o) { s.appendChild(o); });
s.value = atual;
s.setAttribute("data-si-ord", String(s.options.length));
}
var rs = document.querySelectorAll('[id^="restante_"]');
for (var j = 0; j < rs.length; j++) { var h = rs[j].closest("h5") || rs[j].parentElement; if (h && h.style.display !== "none") h.style.display = "none"; }
}
function ajustarLayout() {
var msg = document.querySelector(".top-bar .message");
if (msg && msg.textContent !== AVISO_TOPO) msg.textContent = AVISO_TOPO;
var itens = document.querySelectorAll(".section-info-ruler .swiper-slide .text");
for (var i = 0; i < itens.length && i < BENEFICIOS.length; i++) {
if (itens[i].getAttribute("data-si")) continue;
itens[i].innerHTML = '\x3cspan class="featured">\x3c/span> \x3cspan>\x3c/span>';
itens[i].children[0].textContent = BENEFICIOS[i][0];
itens[i].children[1].textContent = BENEFICIOS[i][1];
itens[i].setAttribute("data-si", "1");
}
var news1 = document.querySelector(".newsletter .text .first");
var news2 = document.querySelector(".newsletter .text .last");
if (news1 && news1.textContent !== "Receba novidades e lançamentos") news1.textContent = "Receba novidades e lançamentos";
if (news2 && news2.textContent !== "Ideias de presentes e brindes personalizados.") news2.textContent = "Ideias de presentes e brindes personalizados.";
var links = document.querySelectorAll("a[href]");
for (var j = 0; j < links.length; j++) {
var a = links[j];
if (a.hostname === location.hostname && PAGINAS_OCULTAS.indexOf(a.pathname.replace(/\/$/, "")) > -1) {
(a.closest("li") || a).classList.add("si-oculto");
}
}
var titulos = document.querySelectorAll(".smart-filter .filter-title, .filters .filter-title");
for (var f = 0; f < titulos.length; f++) {
if (titulos[f].textContent.trim().toLowerCase() === "cor") {
var bloco = titulos[f].closest(".filter-block") || titulos[f].parentElement;
if (!bloco.classList.contains("si-oculto")) bloco.classList.add("si-oculto");
}
}
var redes = document.querySelectorAll('[id^="social_networks"] a');
for (var r = 0; r < redes.length; r++) {
if (redes[r].querySelector(".icon-instagram")) redes[r].setAttribute("href", INSTAGRAM);
else redes[r].classList.add("si-oculto");
}
}
function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) { return []; } }
function gravar(l) { try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch (e) {} atualizarFab(); }
function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
function abrirWhats(msg) {
var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
window.open(url, "_blank");
}
var TIPOS_ANEXO = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.cdr,.ai,.psd,.eps,.svg,.zip,.rar";
function campoAnexo(id) {
return '\x3cdiv class="si-anexo" id="' + id + '">' +
'\x3cinput type="file" multiple accept="' + TIPOS_ANEXO + '" style="display:none">' +
'\x3cbutton type="button" class="si-anexo-btn">\uD83D\uDCCE Anexar imagem ou documento (opcional)\x3c/button>' +
'\x3cul class="si-anexo-lista">\x3c/ul>' +
'\x3cdiv class="si-anexo-dica">Logo, arte, foto ou briefing. Você envia os arquivos na conversa do WhatsApp.\x3c/div>\x3c/div>';
}
function ligarAnexo(raiz) {
var input = raiz.querySelector("input[type=file]"), ul = raiz.querySelector(".si-anexo-lista");
raiz.siArquivos = [];
function desenhar() {
ul.innerHTML = "";
raiz.siArquivos.forEach(function (f, i) {
var li = document.createElement("li");
li.innerHTML = "\x3cspan>\x3c/span>\x3cbutton type=\"button\">remover\x3c/button>";
li.querySelector("span").textContent = "\uD83D\uDCC4 " + f.name;
li.querySelector("button").onclick = function () { raiz.siArquivos.splice(i, 1); desenhar(); };
ul.appendChild(li);
});
}
raiz.querySelector(".si-anexo-btn").onclick = function () { input.click(); };
input.onchange = function () {
for (var i = 0; i < input.files.length; i++) raiz.siArquivos.push(input.files[i]);
input.value = "";
desenhar();
};
raiz.siLimpar = function () { raiz.siArquivos = []; desenhar(); };
}
function textoAnexos(arqs) {
if (!arqs || !arqs.length) return "";
return "\n\n\uD83D\uDCCE Vou enviar " + (arqs.length === 1 ? "1 arquivo" : arqs.length + " arquivos") +
" nesta conversa: " + arqs.map(function (f) { return f.name; }).join(", ");
}
function guiaAnexos(arqs) {
if (!arqs || !arqs.length) return;
var podeCompartilhar = false;
try { podeCompartilhar = !!(navigator.canShare && navigator.canShare({ files: arqs })); } catch (e) {}
var fundoG = document.createElement("div");
fundoG.className = "si-guia-fundo";
fundoG.innerHTML = '\x3cdiv class="si-guia" role="dialog" aria-modal="true">' +
'\x3ch3>Agora envie seus arquivos\x3c/h3>' +
'\x3cp>A mensagem do orçamento abriu no WhatsApp. Falta mandar os arquivos:\x3c/p>' +
'\x3cul class="si-anexo-lista">\x3c/ul>' +
'\x3col>\x3cli>Envie a mensagem do orçamento no WhatsApp.\x3c/li>' +
'\x3cli>Na mesma conversa, toque no clipe \uD83D\uDCCE (ou no +) e escolha os arquivos acima.\x3c/li>\x3c/ol>' +
(podeCompartilhar ? '\x3cbutton type="button" class="si-btn si-btn-principal si-compartilhar">Enviar arquivos pelo WhatsApp\x3c/button>' +
'\x3cdiv class="si-anexo-dica">Abre o compartilhamento do aparelho: escolha WhatsApp e a conversa da ' + LOJA + '.\x3c/div>' : "") +
'\x3cbutton type="button" class="si-btn si-btn-secundario si-ok">Entendi\x3c/button>\x3c/div>';
var ul = fundoG.querySelector(".si-anexo-lista");
arqs.forEach(function (f) { var li = document.createElement("li"); li.textContent = "\uD83D\uDCC4 " + f.name; ul.appendChild(li); });
function fechar() { if (fundoG.parentNode) fundoG.parentNode.removeChild(fundoG); }
fundoG.onclick = function (ev) { if (ev.target === fundoG) fechar(); };
fundoG.querySelector(".si-ok").onclick = fechar;
var bc = fundoG.querySelector(".si-compartilhar");
if (bc) bc.onclick = function () {
navigator.share({ files: arqs, title: "Arquivos do orçamento", text: "Arquivos para o orçamento - " + LOJA }).then(fechar).catch(function () {});
};
document.body.appendChild(fundoG);
}
function ehPersonalizados(caminho) { return /^\/personalizados(\/|$)/i.test(caminho || ""); }
function paginaDeCompra() {
if (ehPersonalizados(location.pathname)) return true;
var migalhas = document.querySelectorAll(".breadcrumb a, [class*=breadcrumb] a");
for (var i = 0; i < migalhas.length; i++) if (ehPersonalizados(migalhas[i].pathname)) return true;
return false;
}
function marcarModo() {
var compra = paginaDeCompra();
if (compra !== document.body.classList.contains("si-compra")) document.body.classList.toggle("si-compra", compra);
return compra;
}
function ajustarVitrine() {
var compra = marcarModo();
var ords = compra ? [] : document.querySelectorAll("option, li");
for (var k = 0; k < ords.length; k++) {
if (/^(menor|maior)\s+pre[cç]o$/i.test(ords[k].textContent.replace(/\s+/g, " ").trim())) ords[k].parentNode.removeChild(ords[k]);
}
var cards = document.querySelectorAll(".product:not([data-si-modo])");
for (var c = 0; c < cards.length; c++) {
var lk = cards[c].querySelector("a.product-info");
if (!lk) continue;
var deCompra = ehPersonalizados(lk.pathname);
cards[c].classList.add(deCompra ? "si-card-compra" : "si-card-orc");
cards[c].setAttribute("data-si-modo", deCompra ? "c" : "o");
if (!deCompra && cards[c].querySelector(".actions")) {
var mn = document.createElement("div");
mn.className = "si-card-min";
mn.textContent = "Pedido mínimo: " + MINIMO + " un.";
var ac = cards[c].querySelector(".actions");
ac.parentNode.insertBefore(mn, ac);
}
}
var botoes = document.querySelectorAll("a.product-button");
for (var i = 0; i < botoes.length; i++) {
var b = botoes[i];
if (b.getAttribute("data-si")) continue;
var card = b.closest(".product, li, article");
var link = card && card.querySelector("a.product-info, a[href]:not(.product-button)");
if (card && link && ehPersonalizados(link.pathname)) {
card.classList.add("si-card-compra");
b.setAttribute("data-si-compra", "1");
b.setAttribute("data-si", "c");
continue;
}
b.setAttribute("data-si", "1");
if (card) card.classList.add("si-card-orc");
b.textContent = "Ver e orçar";
b.style.setProperty("display", "inline-block", "important");
if (link && link.href) {
b.setAttribute("href", link.href);
b.onclick = function (ev) { ev.stopPropagation(); };
}
}
}
function temCores() { return !!document.querySelector(".lista_cor_variacao li"); }
function corEscolhida() {
var v = document.getElementById("variantSelectedValue");
if (v && v.value) return v.value;
var li = document.querySelector(".lista_cor_variacao li.selected, .lista_cor_variacao li.active, .lista_cor_variacao li.cor_selecionada");
if (li) return li.getAttribute("data-variant-value") || txt(li);
var n = document.getElementById("cor_nome");
return n ? txt(n).replace(/^[:\s-]+/, "") : "";
}
function corrigirAmostras() {
var lis = document.querySelectorAll(".lista_cor_variacao li");
for (var i = 0; i < lis.length; i++) {
(function (li) {
if (li.getAttribute("data-si")) return;
li.setAttribute("data-si", "1");
var img = li.querySelector("img"), nome = li.getAttribute("data-variant-value") || txt(li);
li.title = nome;
function trocar() {
if (li.querySelector(".si-cor-txt")) return;
if (img) img.style.display = "none";
var s = document.createElement("span");
s.className = "si-cor-txt";
s.textContent = nome;
li.appendChild(s);
}
if (!img || !img.getAttribute("src")) trocar();
else if (img.complete && img.naturalWidth === 0) trocar();
else img.addEventListener("error", trocar);
})(lis[i]);
}
}
function opcao(nome, valor, tipo) {
return '\x3clabel class="si-opcao">\x3cinput type="' + (tipo || "radio") + '" name="' + nome + '" value="' + valor + '"> ' + valor + '\x3c/label>';
}
function campoTipo() {
return '\x3cdiv class="si-orc-linha" style="display:block">\x3clabel>Tipo de personalização *\x3c/label>' +
'\x3cdiv class="si-anexo-dica">Escolha uma ou duas personalizações (arte/logo) e, se quiser, marque também o nome.\x3c/div>' +
'\x3cdiv class="si-opcoes">' + opcao("si-tipo", "Uma personalização") + opcao("si-tipo", "Duas personalizações") +
opcao("si-com-nome", "Personalizar com o nome", "checkbox") + '\x3c/div>' +
'\x3cdiv class="si-sub" id="si-nome-op" style="display:none">' +
opcao("si-nome", "Mesmo nome em todos os produtos") + opcao("si-nome", "Nomes diferentes") +
'\x3cdiv class="si-orc-linha" id="si-qnomes-l" style="display:none;margin-top:6px">\x3clabel for="si-qnomes">Quantos nomes diferentes?\x3c/label>' +
'\x3cinput id="si-qnomes" class="si-orc-qtd" type="number" min="2" step="1" placeholder="Ex.: 10">' +
'\x3cdiv style="flex-basis:100%">' + opcao("si-sem-nome", "Alguns produtos ficarão sem nome", "checkbox") + '\x3c/div>' +
'\x3cdiv class="si-orc-linha" id="si-qsem-l" style="display:none;flex-basis:100%;margin:0">\x3clabel for="si-qsem">Quantos sem nome?\x3c/label>' +
'\x3cinput id="si-qsem" class="si-orc-qtd" type="number" min="1" step="1">\x3c/div>\x3c/div>\x3c/div>\x3c/div>';
}
function ligarTipo(caixa) {
function marcado(n) { var r = caixa.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ""; }
function temNome() { var c = caixa.querySelector('input[name="si-com-nome"]'); return !!(c && c.checked); }
function qtdProdutos() { var q = parseInt((document.getElementById("si-qtd") || {}).value, 10); return q > 0 ? q : 1; }
function semNome() { var c = caixa.querySelector('input[name="si-sem-nome"]'); return !!(c && c.checked); }
function atualizar(ev) {
var comNome = temNome();
caixa.querySelector("#si-nome-op").style.display = comNome ? "block" : "none";
caixa.querySelector("#si-qnomes-l").style.display = comNome && marcado("si-nome") === "Nomes diferentes" ? "flex" : "none";
caixa.querySelector("#si-qsem-l").style.display = semNome() ? "flex" : "none";
var qs = caixa.querySelector("#si-qsem"), qn = parseInt(caixa.querySelector("#si-qnomes").value, 10);
if (semNome() && ev && ev.target && ev.target.name === "si-sem-nome" && !qs.value && qn > 0 && qtdProdutos() > qn) qs.value = qtdProdutos() - qn;
}
var rs = caixa.querySelectorAll('input[name="si-tipo"], input[name="si-nome"], input[name="si-com-nome"], input[name="si-sem-nome"]');
for (var i = 0; i < rs.length; i++) rs[i].addEventListener("change", atualizar);
var artes = caixa.querySelectorAll('input[name="si-tipo"]');
for (var j = 0; j < artes.length; j++) {
artes[j].addEventListener("mousedown", function () { this.siEstava = this.checked; });
artes[j].addEventListener("click", function () { if (this.siEstava) { this.checked = false; this.siEstava = false; } });
}
return function () {
var arte = marcado("si-tipo"), partes = [];
if (!arte && !temNome()) return { erro: "Escolha o tipo de personalização: uma ou duas personalizações e/ou com o nome." };
if (arte) partes.push(arte);
if (temNome()) {
var n = marcado("si-nome");
if (!n) return { erro: "Escolha: mesmo nome em todos os produtos ou nomes diferentes." };
if (n !== "Nomes diferentes") partes.push("com o nome (mesmo nome em todos os produtos)");
else {
var q = parseInt(caixa.querySelector("#si-qnomes").value, 10), total = qtdProdutos();
if (!(q >= 2)) return { erro: "Informe quantos nomes diferentes (2 ou mais)." };
if (q > total) return { erro: "São " + q + " nomes para " + total + " produtos. O número de nomes não pode ser maior que a quantidade de produtos." };
var sn = semNome() ? parseInt(caixa.querySelector("#si-qsem").value, 10) || 0 : 0;
if (q + sn !== total) {
return { erro: q < total && !semNome()
? "São " + q + " nomes para " + total + " produtos. Marque \"Alguns produtos ficarão sem nome\" e informe quantos (" + (total - q) + "), ou ajuste a quantidade."
: "A conta não fecha: " + q + " com nome + " + sn + " sem nome = " + (q + sn) + ", mas a quantidade é " + total + "." };
}
partes.push("com o nome (" + q + " nomes diferentes" + (sn ? " + " + sn + " sem nome" : "") + ")");
}
}
var texto = partes.join(" + ");
return { texto: texto.charAt(0).toUpperCase() + texto.slice(1) };
};
}
function produtoAtual() {
var nome = txt(document.querySelector("h1"));
var img = document.querySelector('meta[property="og:image"]');
var variacao = [];
var form = document.getElementById("form_comprar");
if (form) {
var sels = form.querySelectorAll("select");
for (var i = 0; i < sels.length; i++) {
var o = sels[i].options[sels[i].selectedIndex];
if (o && sels[i].value && sels[i].value !== "0") variacao.push(txt(o));
}
var marcados = form.querySelectorAll("input[type=radio]:checked");
for (var j = 0; j < marcados.length; j++) {
var lab = form.querySelector('label[for="' + marcados[j].id + '"]');
variacao.push(lab ? txt(lab) : marcados[j].value);
}
}
var cor = corEscolhida();
if (cor && variacao.join(" ").indexOf(cor) < 0) variacao.unshift("Cor: " + cor);
var ref = "";
try {
var ld = document.querySelector('script[type="application/ld+json"]');
if (ld) { var d = JSON.parse(ld.textContent); ref = d.mpn || d.gtin || ""; }
} catch (e) {}
return {
nome: nome,
variacao: variacao.join(" / "),
ref: ref,
url: location.href.split("#")[0].split("?")[0],
img: img ? img.content : ""
};
}
function montarQuantidadeCompra() {
var bt = document.getElementById("button-buy");
if (!bt || document.getElementById("quant") || !marcarModo()) return;
var box = document.createElement("div");
box.className = "si-qtd-compra";
box.innerHTML = '\x3clabel for="quant">Quantidade\x3c/label>\x3cdiv id="quantidade">' +
'\x3cbutton type="button" class="si-q-menos" aria-label="Diminuir">-\x3c/button>' +
'\x3cinput type="number" id="quant" name="quant" value="1" min="1" step="1" inputmode="numeric">' +
'\x3cbutton type="button" class="si-q-mais" aria-label="Aumentar">+\x3c/button>\x3c/div>';
bt.parentNode.insertBefore(box, bt);
var inp = box.querySelector("input");
function mudar(d) { var v = (parseInt(inp.value, 10) || 1) + d; inp.value = v < 1 ? 1 : v; inp.dispatchEvent(new Event("input", { bubbles: true })); }
box.querySelector(".si-q-menos").onclick = function () { mudar(-1); };
box.querySelector(".si-q-mais").onclick = function () { mudar(1); };
inp.addEventListener("change", function () { if (!(parseInt(inp.value, 10) >= 1)) inp.value = 1; });
}
function montarCaixaProduto() {
var form = document.getElementById("form_comprar");
if (!form || document.querySelector(".si-orc-box") || marcarModo()) return;
var caixa = document.createElement("div");
caixa.className = "si-orc-box";
caixa.innerHTML =
'\x3ch3>Peça seu orçamento\x3c/h3>' +
'\x3cp>O valor depende da personalização. Escolha a quantidade e conte o que deseja personalizar.\x3c/p>' +
'\x3cdiv class="si-orc-linha">\x3clabel for="si-qtd">Quantidade\x3c/label>' +
'\x3cinput id="si-qtd" class="si-orc-qtd" type="number" min="' + MINIMO + '" step="1" value="' + MINIMO + '">' +
'\x3cspan class="si-min">Pedido mínimo: ' + MINIMO + ' unidades\x3c/span>\x3c/div>' +
campoTipo() +
'\x3cdiv class="si-orc-linha si-est" id="si-est" style="display:none">\x3clabel>Estimativa da personalização (opcional)\x3c/label>' +
'\x3cdiv class="si-anexo-dica">Escolha a técnica e o tamanho da arte para ver um valor de referência.\x3c/div>' +
'\x3cdiv class="si-est-campos">\x3cselect id="si-est-tec">\x3coption value="">Técnica: ainda não sei\x3c/option>\x3c/select>' +
'\x3cselect id="si-est-tam" disabled>\x3coption value="">Tamanho da arte\x3c/option>\x3c/select>\x3c/div>' +
'\x3cdiv class="si-est-res" id="si-est-res">\x3c/div>\x3c/div>' +
'\x3cdiv class="si-orc-linha" style="display:block">\x3clabel for="si-obs">Detalhes da personalização (opcional)\x3c/label>' +
'\x3ctextarea id="si-obs" class="si-orc-obs" placeholder="Ex.: nome, logo da empresa, cores, data do evento...">\x3c/textarea>\x3c/div>' +
campoAnexo("si-anexo-produto") +
'\x3cdiv class="si-orc-linha">' +
'\x3cbutton type="button" class="si-btn si-btn-principal" id="si-whats">Pedir orçamento pelo WhatsApp\x3c/button>' +
'\x3cbutton type="button" class="si-btn si-btn-secundario" id="si-add">+ Adicionar à lista de orçamento\x3c/button>' +
'\x3c/div>\x3cdiv class="si-orc-aviso" id="si-aviso">\x3c/div>';
form.parentNode.insertBefore(caixa, form.nextSibling);
var est = parseInt(txt(document.querySelector(".value-max-stock")).replace(/\D/g, ""), 10);
if (est > 0) {
var e = document.createElement("div");
e.className = "si-estoque";
e.textContent = "\u2714 Disponível para pronta entrega";
caixa.insertBefore(e, caixa.querySelector(".si-orc-linha"));
}
var anexoP = document.getElementById("si-anexo-produto");
ligarAnexo(anexoP);
var lerTipo = ligarTipo(caixa);
var estAtual = null;
function nPers() { var r = caixa.querySelector('input[name="si-tipo"]:checked'); return r && /Duas/.test(r.value) ? 2 : 1; }
function calcEst() {
var res = document.getElementById("si-est-res"), tam = document.getElementById("si-est-tam");
var f = tam.siLista && tam.siLista[tam.value];
if (!f) { estAtual = null; res.textContent = ""; return; }
var n = nPers(), q = qtd(), porPeca = f.preco * n;
estAtual = { texto: f.tecnica + " – " + f.faixa + " (até " + String(f.larg).replace(".", ",") + "×" + String(f.alt).replace(".", ",") + " cm)" + (n > 1 ? ", 2 personalizações" : ""), peca: porPeca };
res.innerHTML = '\x3cstrong>' + reais(porPeca) + ' por peça\x3c/strong> · ' + reais(porPeca * q) + ' para ' + q + ' peças' +
'\x3csmall>Valor de referência só da personalização. O preço do produto e o valor final vêm no orçamento.\x3c/small>';
}
carregarFaixas().then(function (fx) {
if (!fx.length) return;
var tec = document.getElementById("si-est-tec"), tam = document.getElementById("si-est-tam"), ag = areaGravacao();
var tecs = [];
fx.forEach(function (f) { if (tecs.indexOf(f.tecnica) < 0) tecs.push(f.tecnica); });
var permitidas = tecnicasDoProduto();
if (permitidas) {
var filtradas = tecs.filter(function (t) { return permitidas.indexOf(chaveTecnica(t)) >= 0; });
if (filtradas.length) tecs = filtradas;
}
tecs.forEach(function (t) { var o = document.createElement("option"); o.value = t; o.textContent = t; tec.appendChild(o); });
tec.onchange = function () {
tam.innerHTML = '\x3coption value="">Tamanho da arte\x3c/option>';
var lst = fx.filter(function (f) { return f.tecnica === tec.value; });
if (ag) {
var cabe = lst.filter(function (f) { var d = [f.larg, f.alt].sort(function (a, b) { return a - b; }); return d[0] <= ag[0] + 0.5 && d[1] <= ag[1] + 0.5; });
lst = cabe.length ? cabe : lst.slice(0, 1);
}
tam.siLista = lst;
lst.forEach(function (f, i) { var o = document.createElement("option"); o.value = i; o.textContent = f.faixa + " – até " + String(f.larg).replace(".", ",") + "×" + String(f.alt).replace(".", ",") + " cm (" + reais(f.preco) + ")"; tam.appendChild(o); });
tam.disabled = !tec.value;
if (lst.length === 1) tam.value = "0";
calcEst();
};
tam.onchange = calcEst;
if (tecs.length === 1) { tec.value = tecs[0]; tec.onchange(); }
document.getElementById("si-qtd").addEventListener("input", calcEst);
var ts = caixa.querySelectorAll('input[name="si-tipo"]');
for (var k = 0; k < ts.length; k++) ts[k].addEventListener("change", calcEst);
document.getElementById("si-est").style.display = "block";
});
function validar() {
var aviso = document.getElementById("si-aviso");
aviso.classList.remove("si-erro");
var t = lerTipo();
if (temCores() && !corEscolhida()) t = { erro: "Escolha a cor do produto." };
var qd = parseInt(document.getElementById("si-qtd").value, 10);
if (!(qd >= MINIMO)) t = { erro: "O pedido mínimo é de " + MINIMO + " unidades." };
if (t.erro) { aviso.textContent = t.erro; aviso.classList.add("si-erro"); if (aviso.scrollIntoView) aviso.scrollIntoView({ block: "center", behavior: "smooth" }); return null; }
aviso.textContent = "";
return t.texto;
}
function qtd() {
var q = parseInt(document.getElementById("si-qtd").value, 10);
return q >= MINIMO ? q : MINIMO;
}
document.getElementById("si-whats").onclick = function () {
var tipo = validar();
if (!tipo) return;
var p = produtoAtual(), obs = document.getElementById("si-obs").value.trim();
var msg = "Olá, " + LOJA + "! Gostaria de um orçamento:\n\n" +
"• " + p.nome + (p.variacao ? " (" + p.variacao + ")" : "") + (p.ref ? " - Ref. " + p.ref : "") +
"\n  Quantidade: " + qtd() + "\n  " + p.url +
"\n  Personalização: " + tipo + (estAtual ? "\n  Estimativa da personalização: " + estAtual.texto + " = " + reais(estAtual.peca) + " por peça (" + reais(estAtual.peca * qtd()) + " no total)" : "") +
(obs ? "\n  Detalhes: " + obs : "") + textoAnexos(anexoP.siArquivos);
abrirWhats(msg);
guiaAnexos(anexoP.siArquivos.slice());
};
document.getElementById("si-add").onclick = function () {
var tipo = validar();
if (!tipo) return;
var p = produtoAtual(), lista = ler(), obs = document.getElementById("si-obs").value.trim();
var chave = p.url + "|" + p.variacao, achou = false;
for (var i = 0; i < lista.length; i++) {
if (lista[i].chave === chave) { lista[i].qtd += qtd(); lista[i].tipo = tipo; lista[i].est = estAtual; if (obs) lista[i].obs = obs; achou = true; }
}
if (!achou) lista.push({ chave: chave, nome: p.nome, variacao: p.variacao, ref: p.ref, url: p.url, img: p.img, qtd: qtd(), tipo: tipo, est: estAtual, obs: obs });
gravar(lista);
var av = document.getElementById("si-aviso");
av.innerHTML = '\x3cdiv class="si-add-ok">\x3cstrong>\u2713 Adicionado à sua lista de orçamento!\x3c/strong>' +
'\x3cspan>Você pode escolher outros produtos e enviar tudo junto em um só pedido pelo WhatsApp.' +
(anexoP.siArquivos.length ? " Os arquivos você anexa na lista, na hora de enviar." : "") + '\x3c/span>' +
'\x3cdiv class="si-add-bts">\x3cbutton type="button" class="si-btn si-btn-principal" id="si-ver-lista">Ver minha lista (' + lista.length + ')\x3c/button>' +
'\x3ca class="si-btn si-btn-secundario" href="/brindes">Escolher mais produtos\x3c/a>\x3c/div>\x3c/div>';
document.getElementById("si-ver-lista").onclick = abrirPainel;
if (av.scrollIntoView) av.scrollIntoView({ block: "center", behavior: "smooth" });
if (fab) { fab.classList.remove("si-pulsar"); void fab.offsetWidth; fab.classList.add("si-pulsar"); }
};
}
var RE_TAM = /(?:\s+de)?\s+\d+(?:[.,]\d+)?\s*(?:ml|l|litros?|m|metros?|cm|mm|kg|g|mah)\b/i;
function semCor(nome) { return String(nome || "").replace(/\s+-\s+[^-]+$/, "").trim(); }
function chaveTam(nome) {
return semCor(nome).replace(new RegExp(RE_TAM.source, "ig"), "").replace(/\s+/g, " ").trim().toLowerCase();
}
function rotuloTam(nome) {
var m = semCor(nome).match(new RegExp(RE_TAM.source, "ig"));
if (!m) return "";
return m.join(" ").replace(/^\s*de\s+/i, "").replace(/\s+/g, " ").trim()
.replace(/\s*litros?\b/ig, "L").replace(/\s*metros?\b/ig, "M")
.replace(/(\d)\s+(ml|l|m|cm|mm|kg|g|mah)\b/ig, "$1$2")
.replace(/(\d)(ml|l|m|cm|mm|kg|g|mah)\b/ig, function (s, n, u) { return n + (u.toLowerCase() === "mah" ? "mAh" : u.toUpperCase()); });
}
function emMl(r) {
var m = String(r).match(/(\d+(?:[.,]\d+)?)\s*([a-z]+)/i);
if (!m) return 0;
var n = parseFloat(m[1].replace(",", ".")), u = m[2].toLowerCase();
if (/^(l|litro|litros)$/.test(u)) return n * 1000;
if (/^(m|metro|metros)$/.test(u)) return n * 1000;
if (u === "cm") return n * 10;
if (u === "kg") return n * 1000;
return n;
}
function montarOutrosTamanhos() {
var caixa = document.querySelector(".si-orc-box");
if (!caixa || document.querySelector(".si-tam") || caixa.getAttribute("data-si-tam")) return;
caixa.setAttribute("data-si-tam", "1");
var nome = txt(document.querySelector("h1"));
if (!RE_TAM.test(semCor(nome))) return;
var chave = chaveTam(nome), atualId = (location.pathname.match(/-(\d+)\/?$/) || [])[1];
var prefixo = semCor(nome).split(RE_TAM)[0].trim();
if (!chave || !prefixo) return;
var base = "/web_api/products?name=" + encodeURIComponent(prefixo) + "%25&available=1&limit=50&page=";
Promise.all([1, 2, 3].map(function (pg) {
return fetch(base + pg).then(function (r) { return r.json(); }).catch(function () { return {}; });
}))
.then(function (pags) {
var vistos = {}, itens = [], todos = [];
pags.forEach(function (d) { todos = todos.concat(d.Products || []); });
todos.forEach(function (x) {
var p = x.Product;
if (!p || p.available !== "1" || String(p.id) === String(atualId)) return;
if (chaveTam(p.name) !== chave) return;
var url = p.url && (p.url.https || p.url.http);
if (!url || ehPersonalizados(url.replace(/^https?:\/\/[^/]+/, ""))) return;
var rot = rotuloTam(p.name);
if (!rot || rot === rotuloTam(nome) && semCor(p.name) === semCor(nome)) return;
var k = semCor(p.name).toLowerCase();
if (vistos[k]) return;
vistos[k] = 1;
var im = (p.ProductImage || [])[0] || {};
var th = (im.thumbs && (im.thumbs[180] || im.thumbs[90])) || {};
itens.push({ rot: rot, url: url, img: th.https || th.http || im.https || "", nome: semCor(p.name) });
});
if (!itens.length) return;
var atual = emMl(rotuloTam(nome));
itens.sort(function (a, b) { return Math.abs(emMl(a.rot) - atual) - Math.abs(emMl(b.rot) - atual); });
itens = itens.slice(0, 12);
itens.sort(function (a, b) { return emMl(a.rot) - emMl(b.rot); });
var box = document.createElement("div");
box.className = "si-tam";
box.innerHTML = '\x3ch4>Outros tamanhos deste produto\x3c/h4>\x3cdiv class="si-tam-lista">\x3c/div>';
var lista = box.querySelector(".si-tam-lista");
itens.forEach(function (it) {
var a = document.createElement("a");
a.href = it.url;
a.title = it.nome;
a.innerHTML = (it.img ? '\x3cimg alt="" loading="lazy">' : "") + '\x3cspan>\x3c/span>';
if (it.img) a.querySelector("img").src = it.img;
a.querySelector("span").textContent = it.rot;
lista.appendChild(a);
});
caixa.parentNode.insertBefore(box, caixa);
})
.catch(function () {});
}
var DESTAQUE_MIN = 10;   // minutos entre uma selecao e outra
var DESTAQUE_QTD = 8;    // produtos mostrados
var DESTAQUE_CATS = [11, 13, 15, 17, 19, 21, 23, 25, 27, 33, 35, 37, 39, 41, 43, 45]; // subcategorias de Brindes atacado
function sorteador(semente) {
var a = semente >>> 0;
return function () {
a = (a + 0x6D2B79F5) >>> 0;
var t = Math.imul(a ^ (a >>> 15), 1 | a);
t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
}
function secaoDestaques() {
var ts = document.querySelectorAll(".section-showcase .title-section");
for (var i = 0; i < ts.length; i++) {
if (/destaque/i.test(ts[i].textContent)) {
var s = ts[i].closest(".section-showcase");
return s && s.querySelector(".list-product") ? s : null;
}
}
return null;
}
function cardDestaque(p) {
var im = (p.ProductImage || [])[0] || {};
var th = (im.thumbs && (im.thumbs[180] || im.thumbs[90])) || {};
var url = (p.url && (p.url.https || p.url.http)) || "#";
var item = document.createElement("div");
item.className = "item";
item.innerHTML = '\x3cdiv class="product">\x3cdiv class="image">\x3ca class="space-image image-square">\x3cimg alt="" loading="lazy">\x3c/a>\x3c/div>' +
'\x3ca class="product-info">\x3cdiv class="product-name">\x3c/div>\x3c/a>' +
'\x3cdiv class="actions">\x3ca class="product-button">Ver e orçar\x3c/a>\x3c/div>\x3c/div>';
item.querySelector(".space-image").href = url;
item.querySelector(".product-info").href = url;
item.querySelector(".product-button").href = url;
item.querySelector("img").src = th.https || th.http || im.https || "";
item.querySelector("img").alt = p.name;
item.querySelector(".product-name").textContent = p.name;
return item;
}
function montarDestaques() {
var sec = secaoDestaques();
if (!sec || sec.getAttribute("data-si-dest")) return;
sec.setAttribute("data-si-dest", "1");
var lista = sec.querySelector(".list-product");
lista.style.visibility = "hidden";
var mostrar = setTimeout(function () { lista.style.visibility = ""; }, 5000);
var janela = Math.floor(Date.now() / (DESTAQUE_MIN * 60000));
var chave = "sraideia_destaques_" + janela, guardado = null;
try { guardado = JSON.parse(sessionStorage.getItem(chave)); } catch (e) {}
function desenhar(prods) {
clearTimeout(mostrar);
if (prods.length >= 4) {
lista.innerHTML = "";
prods.forEach(function (p) { lista.appendChild(cardDestaque(p)); });
ajustarVitrine();
}
lista.style.visibility = "";
}
if (guardado && guardado.length) { desenhar(guardado); return; }
var rnd = sorteador(janela * 2654435761);
var cats = DESTAQUE_CATS.slice().sort(function () { return rnd() - 0.5; }).slice(0, DESTAQUE_QTD + 2);
var sorteios = cats.map(function () { return rnd(); });
var base = "/web_api/products?available=1&category_id=";
Promise.all(cats.map(function (c, i) {
return fetch(base + c + "&limit=1").then(function (r) { return r.json(); }).then(function (d) {
var total = (d.paging && +d.paging.total) || 0;
if (!total) return null;
var pos = Math.floor(sorteios[i] * total) + 1;
return fetch(base + c + "&limit=1&page=" + pos).then(function (r) { return r.json(); })
.then(function (d2) { var x = (d2.Products || [])[0]; return x ? x.Product : null; });
}).catch(function () { return null; });
})).then(function (res) {
var prods = res.filter(function (p) { return p && p.available === "1" && (p.ProductImage || []).length; })
.slice(0, DESTAQUE_QTD)
.map(function (p) { return { name: p.name, url: p.url, ProductImage: [(p.ProductImage || [])[0]] }; });
try { sessionStorage.setItem(chave, JSON.stringify(prods)); } catch (e) {}
desenhar(prods);
}).catch(function () { desenhar([]); });
}
var fab, painel, fundo;
function montarPainel() {
fab = document.createElement("button");
fab.className = "si-fab";
fab.type = "button";
fab.onclick = abrirPainel;
document.body.appendChild(fab);
fundo = document.createElement("div");
fundo.className = "si-painel-fundo";
fundo.onclick = fecharPainel;
painel = document.createElement("div");
painel.className = "si-painel";
painel.innerHTML =
'\x3cheader>\x3cstrong>Meu orçamento\x3c/strong>\x3cbutton type="button" class="si-fechar" aria-label="Fechar">×\x3c/button>\x3c/header>' +
'\x3cdiv class="si-itens">\x3c/div>' +
'\x3cfooter>\x3cinput id="si-nome" placeholder="Seu nome">' +
'\x3cinput id="si-empresa" placeholder="Empresa / evento (opcional)">' +
'\x3ctextarea id="si-obs-geral" rows="2" placeholder="Observações gerais (opcional)">\x3c/textarea>' +
campoAnexo("si-anexo-lista") +
'\x3cbutton type="button" class="si-btn si-btn-principal" style="width:100%" id="si-enviar">Enviar orçamento pelo WhatsApp\x3c/button>\x3c/footer>';
document.body.appendChild(fundo);
document.body.appendChild(painel);
painel.querySelector(".si-fechar").onclick = fecharPainel;
painel.querySelector("#si-enviar").onclick = enviarLista;
ligarAnexo(painel.querySelector("#si-anexo-lista"));
atualizarFab();
}
function atualizarFab() {
if (!fab) return;
var n = ler().length;
fab.textContent = "Meu orçamento (" + n + ")";
fab.style.display = n ? "block" : "none";
}
function abrirPainel() { desenharItens(); fundo.style.display = "block"; painel.style.display = "flex"; }
function fecharPainel() { fundo.style.display = "none"; painel.style.display = "none"; }
function desenharItens() {
var area = painel.querySelector(".si-itens"), lista = ler();
if (!lista.length) { area.innerHTML = '\x3cdiv class="si-vazio">Sua lista está vazia.\x3c/div>'; return; }
area.innerHTML = "";
lista.forEach(function (it, i) {
var div = document.createElement("div");
div.className = "si-item";
div.innerHTML = (it.img ? '\x3cimg alt="" src="' + it.img + '">' : "") +
'\x3cdiv class="si-info">\x3ca href="' + it.url + '">\x3c/a>\x3csmall>\x3c/small>\x3c/div>' +
'\x3cinput type="number" min="' + MINIMO + '" value="' + it.qtd + '">' +
'\x3cbutton type="button" class="si-remover">remover\x3c/button>';
div.querySelector(".si-info a").textContent = it.nome;
div.querySelector(".si-info small").textContent = [it.variacao, it.tipo, it.obs].filter(Boolean).join(" • ");
div.querySelector("input").onchange = function () {
var l = ler(), q = parseInt(this.value, 10); l[i].qtd = q >= MINIMO ? q : MINIMO; this.value = l[i].qtd; gravar(l);
};
div.querySelector(".si-remover").onclick = function () {
var l = ler(); l.splice(i, 1); gravar(l); desenharItens();
};
area.appendChild(div);
});
}
function enviarLista() {
var lista = ler();
if (!lista.length) return;
var nome = painel.querySelector("#si-nome").value.trim();
var emp = painel.querySelector("#si-empresa").value.trim();
var obs = painel.querySelector("#si-obs-geral").value.trim();
var msg = "Olá, " + LOJA + "! " + (nome ? "Sou " + nome + (emp ? " (" + emp + ")" : "") + ". " : "") +
"Gostaria de um orçamento dos itens abaixo:\n";
lista.forEach(function (it, i) {
msg += "\n" + (i + 1) + ") " + it.nome + (it.variacao ? " (" + it.variacao + ")" : "") +
(it.ref ? " - Ref. " + it.ref : "") + "\n   Quantidade: " + it.qtd +
(it.tipo ? "\n   Personalização: " + it.tipo : "") +
(it.est ? "\n   Estimativa da personalização: " + it.est.texto + " = " + reais(it.est.peca) + " por peça (" + reais(it.est.peca * it.qtd) + " no total)" : "") + (it.obs ? "\n   Detalhes: " + it.obs : "") + "\n   " + it.url + "\n";
});
if (obs) msg += "\nObservações: " + obs;
var anexoL = painel.querySelector("#si-anexo-lista");
msg += textoAnexos(anexoL.siArquivos);
abrirWhats(msg);
if (anexoL.siArquivos.length) { fecharPainel(); guiaAnexos(anexoL.siArquivos.slice()); }
}
var INSTITUCIONAL = [
["Sobre a Sra Ideia", "/empresa"],
["Como pedir orçamento", "/como-comprar"],
["Envio e prazos", "/envio"],
["Trocas e devoluções", "/trocas-e-devolucoes"],
["Privacidade e segurança", "/seguranca"],
["Contato", "/contato"]
];
function montarMenuInstitucional() {
if (document.querySelector(".si-inst")) return;
var menus = [
[document.querySelector(".nav .container > ul.list"), "desktop"],
[document.querySelector(".nav-mobile > ul.list"), "mobile"]
];
menus.forEach(function (m) {
var ul = m[0];
if (!ul) return;
var li = document.createElement("li");
li.className = "si-inst si-inst-" + m[1] + (m[1] === "desktop" ? " first-level" : "");
var html = m[1] === "desktop"
? '\x3ca href="/empresa" title="Institucional">\x3cdiv class="name">Institucional\x3c/div>\x3c/a>'
: '\x3ca href="/empresa">Institucional\x3c/a>';
html += '\x3cul class="si-inst-sub">';
INSTITUCIONAL.forEach(function (it) {
html += '\x3cli>\x3ca href="' + it[1] + '">' + it[0] + '\x3c/a>\x3c/li>';
});
html += "\x3c/ul>";
li.innerHTML = html;
ul.insertBefore(li, ul.firstChild);
});
}
function corrigirEmailRodape() {
var EMAIL = "sraideiasublimacao@gmail.com";
document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
if (a.href.indexOf(EMAIL) > -1) return;
a.href = "mailto:" + EMAIL;
a.title = "Email: " + EMAIL;
a.innerHTML = a.innerHTML.replace(/[\w.+-]+@[\w.-]+/g, EMAIL);
});
}
var MENU_DESTAQUE = [
["Garrafas e Squeezes", "/brindes/garrafas-e-squeezes"],
["Copos e Canecas", "/brindes/copos-canecas-e-xicaras"],
["Bolsas e Mochilas", "/brindes/bolsas-sacolas-e-mochilas"],
["Kits", "/brindes/kits-presenteaveis"],
["Escritório", "/brindes/escritorio-e-papelaria"],
["Cadernos e Agendas", "/brindes/cadernos-agendas-e-blocos"],
["Personalizados", "/personalizados"]
];
function montarMenuCategorias() {
var ul = document.querySelector(".nav .container > ul.list");
if (!ul || ul.classList.contains("si-menu-novo")) return;
var cats = [];
ul.querySelectorAll("li.first-level.sub .second-level a").forEach(function (a) {
var t = a.textContent.trim();
if (!t || /canetas|^ver /i.test(t)) return;
cats.push([t, a.getAttribute("href")]);
});
var h = '<a href="/brindes" class="si-mc-link"><div class="name"><span class="si-mc-ico">&#9776;</span> Todas as categorias</div></a>';
h += '<div class="si-mc-drop"><div class="si-mc-col"><strong>Brindes atacado</strong><ul>';
cats.forEach(function (c) { h += '<li><a href="' + c[1] + '">' + c[0] + '</a></li>'; });
h += '<li><a href="/brindes" class="si-mc-ver">Ver todos os brindes &rsaquo;</a></li></ul></div>';
h += '<div class="si-mc-col"><strong>Personalizados</strong><ul><li><a href="/personalizados">Compra direta</a></li></ul>';
h += '<strong>Institucional</strong><ul>';
INSTITUCIONAL.forEach(function (it) { h += '<li><a href="' + it[1] + '">' + it[0] + '</a></li>'; });
h += '</ul></div></div>';
var todas = document.createElement("li");
todas.className = "first-level si-mc si-mc-todas";
todas.innerHTML = h;
ul.appendChild(todas);
var aqui = location.pathname.replace(/\/$/, "");
MENU_DESTAQUE.forEach(function (m) {
var li = document.createElement("li");
li.className = "first-level si-mc" + (aqui === m[1] ? " si-mc-ativo" : "");
li.innerHTML = '<a href="' + m[1] + '" class="si-mc-link"><div class="name">' + m[0] + '</div></a>';
ul.appendChild(li);
});
ul.classList.add("si-menu-novo");
}
var QUADROS_CATEGORIA = [
["Garrafas e Squeezes", "/brindes/garrafas-e-squeezes", "https://images.tcdn.com.br/img/img_prod/1570377/180_squeeze_plastico_750ml_8425_1_e157b4a1681c3dfa35db6f6cda86c73a.jpg"],
["Copos e Canecas", "/brindes/copos-canecas-e-xicaras", "https://images.tcdn.com.br/img/img_prod/1570377/180_copo_termico_inox_380ml_6621_1_f0d703357ff8dd81e680659f940322fb.jpg"],
["Bolsas e Mochilas", "/brindes/bolsas-sacolas-e-mochilas", "https://images.tcdn.com.br/img/img_prod/1570377/180_sacola_tnt_metalizado_8301_1_3de69d72067908f83c919b0266ee5dd0.jpg"],
["Kits", "/brindes/kits-presenteaveis", "https://images.tcdn.com.br/img/img_prod/1570377/180_kit_viagem_2_pecas_7355_1_0676c0bc3953970a38ff9430d0425f43.jpg"]
];
function montarQuadrosCategoria() {
if (!document.documentElement.classList.contains("page-home")) return;
if (document.querySelector(".si-quadros")) return;
var regua = document.querySelector("section.section-info-ruler");
if (!regua) return;
var h = '<div class="container"><h2 class="si-quadros-tit">Compre por categoria</h2><div class="si-quadros-grade">';
QUADROS_CATEGORIA.forEach(function (q, i) {
h += '<a class="si-quadro si-quadro-' + (i % 2 ? "b" : "a") + '" href="' + q[1] + '">' +
'<span class="si-quadro-img"><img src="' + q[2] + '" alt="' + q[0] + '" loading="lazy"></span>' +
'<span class="si-quadro-nome">' + q[0] + '</span></a>';
});
h += '</div></div>';
var sec = document.createElement("section");
sec.className = "si-quadros";
sec.innerHTML = h;
regua.parentNode.insertBefore(sec, regua.nextSibling);
}
var VITRINES = [
["Garrafas e Squeezes", 11, "/brindes/garrafas-e-squeezes"],
["Copos e Canecas", 13, "/brindes/copos-canecas-e-xicaras"],
["Kits para presentear", 19, "/brindes/kits-presenteaveis"]
];
var VITRINE_QTD = 12;
function montarVitrinesCarrossel() {
if (!document.documentElement.classList.contains("page-home")) return;
if (document.querySelector(".si-car")) return;
var dest = document.querySelector(".section-showcase");
if (!dest) return;
document.querySelectorAll("main .section-banners-grid").forEach(function (b) {
if (!b.querySelector("img")) b.style.display = "none";
});
var janela = Math.floor(Date.now() / (10 * 60000));
var ref = dest;
VITRINES.forEach(function (vt, n) {
var sec = document.createElement("section");
sec.className = "si-car";
sec.innerHTML = '<div class="container"><div class="si-car-cab"><h2 class="si-car-tit">' + vt[0] + '</h2>' +
'<a class="si-car-ver" href="' + vt[2] + '">Ver todos &rsaquo;</a></div>' +
'<div class="si-car-area"><button type="button" class="si-car-seta si-car-ant" aria-label="Anteriores"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
'<div class="si-car-trilho"></div>' +
'<button type="button" class="si-car-seta si-car-prox" aria-label="Próximos"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>';
ref.parentNode.insertBefore(sec, ref.nextSibling);
ref = sec;
var trilho = sec.querySelector(".si-car-trilho");
sec.querySelector(".si-car-ant").onclick = function () { trilho.scrollBy({ left: -trilho.clientWidth * 0.9, behavior: "smooth" }); };
sec.querySelector(".si-car-prox").onclick = function () { trilho.scrollBy({ left: trilho.clientWidth * 0.9, behavior: "smooth" }); };
var base = "/web_api/products?available=1&category_id=" + vt[1];
fetch(base + "&limit=1").then(function (r) { return r.json(); }).then(function (d) {
var total = (d.paging && +d.paging.total) || 0;
if (!total) { sec.style.display = "none"; return; }
var paginas = Math.max(1, Math.floor(total / 30));
var pg = Math.floor(sorteador(janela * 2654435761 + n * 97)() * paginas) + 1;
return fetch(base + "&limit=30&page=" + pg).then(function (r) { return r.json(); }).then(function (d2) {
var vistos = {}, prods = [];
(d2.Products || []).forEach(function (x) {
var p = x.Product || x, k = semCor(p.name).toLowerCase();
if (vistos[k] || prods.length >= VITRINE_QTD) return;
vistos[k] = 1; prods.push(p);
});
prods.forEach(function (p) { trilho.appendChild(cardDestaque(p)); });
if (typeof ajustarVitrine === "function") ajustarVitrine();
});
}).catch(function () { sec.style.display = "none"; });
});
}
var OCASIOES = [
["Fim de ano", "/brindes/copos-canecas-e-xicaras", "https://images.tcdn.com.br/img/img_prod/1570377/180_copo_termico_800ml_6603_1_f9e1a0d397b8a917c854d1ef17d2097f.jpg"],
["Festas infantis", "/personalizados", "https://images.tcdn.com.br/img/img_prod/1570377/180_garrafa_inox_parede_dupla_250ml_1_20261006163256_f7e726403264.jpg"],
["Eventos e feiras", "/brindes/bolsas-sacolas-e-mochilas", "https://images.tcdn.com.br/img/img_prod/1570377/180_sacola_tela_pvc_8273_1_ac162c1a097f0a773bab1ef81c39e4ff.jpg"],
["Boas-vindas", "/brindes/garrafas-e-squeezes", "https://images.tcdn.com.br/img/img_prod/1570377/180_squeeze_plastica_1_1_litros_8377_1_d8a1ba7820190cde6341d4471c2807e2.jpg"],
["Presentes para clientes", "/brindes/kits-presenteaveis", "https://images.tcdn.com.br/img/img_prod/1570377/180_kit_viagem_6pcs_7361_1_0886866db2e26b0424bcaa7ef5729a98.jpg"]
];
var WHATS_FIM_DE_ANO = "https://wa.me/5512991960856?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20um%20or%C3%A7amento%20de%20brindes%20de%20fim%20de%20ano%20para%20a%20minha%20empresa.";
function montarOcasioesEBanner() {
if (!document.documentElement.classList.contains("page-home")) return;
if (document.querySelector(".si-ocas")) return;
var dest = document.querySelector(".section-showcase");
if (!dest) return;
var h = '<div class="container"><h2 class="si-ocas-tit">Para cada ocasião</h2><div class="si-ocas-lista">';
OCASIOES.forEach(function (o) {
h += '<a class="si-oca" href="' + o[1] + '"><span class="si-oca-img"><img src="' + o[2] + '" alt="' + o[0] + '" loading="lazy"></span>' +
'<span class="si-oca-nome">' + o[0] + '</span></a>';
});
h += '</div></div>';
var sec = document.createElement("section");
sec.className = "si-ocas";
sec.innerHTML = h;
dest.parentNode.insertBefore(sec, dest.nextSibling);
var cars = document.querySelectorAll(".si-car");
var antes = cars.length ? cars[cars.length - 1] : sec.nextSibling;
var ban = document.createElement("section");
ban.className = "si-ban";
ban.innerHTML = '<div class="container"><div class="si-ban-caixa">' +
'<div class="si-ban-txt"><span class="si-ban-tag">Fim de ano</span>' +
'<h2>Brindes de fim de ano com a marca da sua empresa</h2>' +
'<p>Garrafas, copos, kits e muito mais, personalizados para presentear equipe e clientes. Peça com antecedência e garanta a entrega.</p>' +
'<a class="si-ban-btn" href="' + WHATS_FIM_DE_ANO + '" target="_blank" rel="noopener">Pedir orçamento pelo WhatsApp</a></div>' +
'<div class="si-ban-fotos"><img src="' + OCASIOES[0][2] + '" alt="" loading="lazy"><img src="' + OCASIOES[4][2] + '" alt="" loading="lazy"><img src="' + OCASIOES[3][2] + '" alt="" loading="lazy"></div>' +
'</div></div>';
antes.parentNode.insertBefore(ban, antes);
}
function montarRodapeSobre() {
var c = document.querySelector("footer .box-infos");
if (!c || document.querySelector(".si-sobre")) return;
var b = document.createElement("div");
b.className = "box si-sobre";
b.innerHTML = '<div class="title">Sobre a Sra Ideia</div><p>A Sra Ideia personaliza brindes e presentes para empresas, eventos e festas, com o seu nome, a sua arte ou a sua marca. São José dos Campos e todo o Brasil.</p>';
c.parentNode.insertBefore(b, c);
}
function iniciar() {
ajustarLayout();
ajustarVitrine();
montarCaixaProduto();
montarQuantidadeCompra();
corrigirAmostras();
montarPainel();
montarOutrosTamanhos();
montarDestaques();
montarMenuInstitucional();
corrigirEmailRodape();
montarMenuCategorias();
montarQuadrosCategoria();
montarVitrinesCarrossel();
montarOcasioesEBanner();
montarRodapeSobre();
ajustarInfoAdicional();
if (window.MutationObserver) {
new MutationObserver(function () { ajustarLayout(); ajustarInfoAdicional(); ajustarVitrine(); montarCaixaProduto(); montarOutrosTamanhos(); montarQuantidadeCompra(); corrigirAmostras(); montarMenuInstitucional(); })
.observe(document.body, { childList: true, subtree: true });
}
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
else iniciar();
})();
