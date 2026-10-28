//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];

// 🆕 Estado auxiliar: null = "Modo Cadastro" | número = "Modo Edição"
let indiceEdicao = null;

//
// FASE 2.1: Persistência com localStorage
//
const CHAVE_STORAGE = "sistema_estoque_produtos";

// 1. Função para SALVAR os dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função para CARREGAR os dados salvos quando a página abrir
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        // Reinstancia cada produto para recuperar o método .calcularSubtotal()
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnSubmit = document.querySelector(".btn-primary");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar ou Editar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // 🆕 Sanitização: .trim() remove espaços no início e no fim do nome
    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    // 🆕 Guard Clauses: interrompem a execução se algum dado for inválido
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        alert("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    // Dados válidos: cria o objeto
    const novoProduto = new Produto(nome, preco, quantidade);

    // 🆕 Decide entre Inclusão (push) e Edição (substituição)
    if (indiceEdicao === null) {
        // Modo Inclusão
        listaDeProdutos.push(novoProduto);
    } else {
        // Modo Edição (Update)
        listaDeProdutos[indiceEdicao] = novoProduto;

        // 🆕 Restauração de estado
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
    }

    salvarNoLocalStorage();
    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);

        // Se estava editando, os índices deixaram de existir: volta ao Modo Inclusão
        cancelarEdicao();

        atualizarInterface();
    }
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// 🆕 Volta o formulário ao Modo Inclusão
function cancelarEdicao() {
    indiceEdicao = null;
    btnSubmit.textContent = "Adicionar Produto";
    formProduto.reset();
}

// 🆕 Preenche o formulário com os dados do produto e ativa o Modo Edição
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    // 1. Preenche os campos do formulário com os dados existentes
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    // 2. Transfere o estado para Modo Edição e atualiza a interface
    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações";
}

// Função responsável por remover um único produto pelo índice
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    // 🆕 Evita editar o item errado: se removeu o item em edição, cancela a edição;
    // se removeu um item anterior a ele, ajusta o índice.
    if (indiceEdicao === index) {
        cancelarEdicao();
    } else if (indiceEdicao !== null && index < indiceEdicao) {
        indiceEdicao--;
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

// Função responsável por calcular e renderizar o total geral em estoque
function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Função responsável por re-desenhar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        // 🆕 Botão "Editar" adicionado na coluna de ações
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        // 🆕 Vincula o clique de "Editar" à função prepararEdicao(index)
        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(index));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(index));

        tabelaBody.appendChild(linha);
    });
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 6: Inicialização da Aplicação
//
carregarDoLocalStorage();
atualizarInterface();
