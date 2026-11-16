class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
let indiceEdicao = null;
let acaoConfirmadaCallback = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnSubmit = document.querySelector(".btn-primary");
const inputBusca = document.getElementById("busca");
const selectOrdenacao = document.getElementById("ordenacao");
const mensagemVazia = document.getElementById("mensagem-vazia");
const mensagemErroEl = document.getElementById("mensagem-erro");

const btnExportarCsv = document.getElementById("btn-exportar-csv");
const btnExportarJson = document.getElementById("btn-exportar-json");
const inputImportarJson = document.getElementById("input-importar-json");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTextoConfirmacao = document.getElementById("modal-texto-confirmacao");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");
const modalBootstrapFechar = document.getElementById("modal-bootstrap-fechar");

function exibirErroInline(mensagem) {
    mensagemErroEl.textContent = mensagem;
    mensagemErroEl.style.display = "block";
}

function limparErroInline() {
    mensagemErroEl.textContent = "";
    mensagemErroEl.style.display = "none";
}

function abrirModalConfirmacao(texto, callback) {
    modalTextoConfirmacao.textContent = texto;
    acaoConfirmadaCallback = callback;
    modalConfirmacao.style.display = "flex";
}

function fecharModalConfirmacao() {
    modalConfirmacao.style.display = "none";
    acaoConfirmadaCallback = null;
}

modalBtnConfirmar.addEventListener("click", function() {
    if (acaoConfirmadaCallback) {
        acaoConfirmadaCallback();
    }
    fecharModalConfirmacao();
});

modalBtnCancelar.addEventListener("click", fecharModalConfirmacao);

btnConceitoBootstrap.addEventListener("click", function() {
    modalBootstrap.style.display = "flex";
});

modalBootstrapFechar.addEventListener("click", function() {
    modalBootstrap.style.display = "none";
});

document.getElementById("nome").addEventListener("input", function (event) {
    inputBusca.value = event.target.value;
    atualizarInterface();
});

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    limparErroInline();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!nome) {
        exibirErroInline("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        exibirErroInline("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
    }

    salvarNoLocalStorage();
    sairDoModoEdicao();
    atualizarInterface();
    formProduto.reset();
});

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        exibirErroInline("A tabela já está vazia!");
        return;
    }

    abrirModalConfirmacao("Tem certeza que deseja remover todos os produtos?", function() {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
    
        sairDoModoEdicao();
        formProduto.reset();
        atualizarInterface();
    });
});

inputBusca.addEventListener("input", function () {
    atualizarInterface();
});

selectOrdenacao.addEventListener("change", function () {
    atualizarInterface();
});

function prepararEdicao(indexReal) {
    limparErroInline();
    const produto = listaDeProdutos[indexReal];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = indexReal;
    btnSubmit.textContent = "Salvar Alterações";
}

function sairDoModoEdicao() {
    indiceEdicao = null;
    btnSubmit.textContent = "Adicionar Produto";
}

function removerProduto(indexReal) {
    abrirModalConfirmacao("Tem certeza que deseja remover este produto?", function() {
        listaDeProdutos.splice(indexReal, 1);
        salvarNoLocalStorage();

        if (indiceEdicao !== null) {
            sairDoModoEdicao();
            formProduto.reset();
        }

        atualizarInterface();
    });
}

function obterProdutosFiltradosEEspecificos() {
    const termo = inputBusca.value.toLowerCase();
    const filtrados = listaDeProdutos.filter(produto => produto.nome.toLowerCase().includes(termo));
    const criterio = selectOrdenacao.value;
    const resultado = [...filtrados];

    if (criterio === "menor-quantidade") {
        resultado.sort((a, b) => a.quantidade - b.quantidade);
    } else if (criterio === "maior-preco") {
        resultado.sort((a, b) => b.preco - a.preco);
    } else if (criterio === "menor-preco") {
        resultado.sort((a, b) => a.preco - b.preco);
    } else if (criterio === "alfabetica") {
        resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return resultado;
}

function atualizarTotalEstoque() {
    const produtosFiltrados = obterProdutosFiltradosEEspecificos();
    const total = produtosFiltrados.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltradosEEspecificos();

    if (produtosFiltrados.length === 0) {
        mensagemVazia.style.display = "block";
    } else {
        mensagemVazia.style.display = "none";
    }

    produtosFiltrados.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        if (produto.quantidade <= 3) {
            linha.classList.add("estoque-baixo");
        }

        const textoEstoqueBaixo = produto.quantidade <= 3 ? '<span class="aviso-baixo">Estoque Baixo</span>' : '';

        linha.innerHTML = `
            <td>${produto.nome} ${textoEstoqueBaixo}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(indexReal));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(indexReal));

        tabelaBody.appendChild(linha);
    });
}

function dispararDownload(conteudo, nomeArquivo, tipoMime) {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

btnExportarCsv.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        exibirErroInline("Nenhum produto para exportar.");
        return;
    }

    const cabecalho = "Nome;Preco;Quantidade;Subtotal";
    const linhas = listaDeProdutos.map(p => `${p.nome};${p.preco.toFixed(2)};${p.quantidade};${p.calcularSubtotal().toFixed(2)}`);
    const csv = "\uFEFF" + [cabecalho, ...linhas].join("\n");
    dispararDownload(csv, "estoque.csv", "text/csv;charset=utf-8;");
});

btnExportarJson.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        exibirErroInline("Nenhum produto para exportar.");
        return;
    }

    const json = JSON.stringify(listaDeProdutos, null, 2);
    dispararDownload(json, "backup_estoque.json", "application/json");
});

inputImportarJson.addEventListener("change", function(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (!Array.isArray(dados)) throw new Error();

            listaDeProdutos.length = 0;
            dados.forEach(p => {
                listaDeProdutos.push(new Produto(p.nome, p.preco, p.quantidade));
            });

            salvarNoLocalStorage();
            sairDoModoEdicao();
            formProduto.reset();
            atualizarInterface();
        } catch (erro) {
            exibirErroInline("Arquivo JSON inválido.");
        } finally {
            inputImportarJson.value = "";
        }
    };
    leitor.readAsText(arquivo);
});

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

carregarDoLocalStorage();
atualizarInterface();