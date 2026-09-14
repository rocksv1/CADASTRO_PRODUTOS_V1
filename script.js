//
//FASE 1: modelagem dos dados (Classe Base)
//
//A classe funciona como um molde para criar
class Produto{
    constructor(nome,preco,quantidade){
        //propriedades do objeto recebidas no molde
        this.nome=nome;
        this.preco=parseFloat(preco);
        this.quantidade=parseInt(quantidade);
    }
    //método que calcula o subtotal
    calcularSubtotal(){
        return this.preco*this.quantidade;
    }
}
//
//FASE 2: Gerenciamento de Estado (memória)
//
//Array global que guardará todas as instâncias da classe Produto
const listaDeProdutos=[];
//
//FASE 3: Escuta de Eventos do DOM
//
//Selecionamos o formulário pelo ID
const formProduto=document.getElementById("produto-form");
//Adicionar um escutador de eventos para quando o formulário for enviado
formProduto.addEventListener("submit",function(event){
    event.preventDefault();
    //1. Captura dos valores digitados nos campos de input
    const nomeInput=document.getElementById("nome").value;
    const precoInput=document.getElementById("preco").value;
    const quantidadeInput=document.getElementById("quantidade").value;
    //2. Criar uma nova instância da classe
    const novoProduto=new Produto(nomeInput,precoInput,quantidadeInput);
    //3. Adiciona um novo produto ao Array
    listaDeProdutos.push(novoProduto);
    //4. Atualiza a exibição da tabela e limpa o formulário
    renderizarTabela();
    formProduto.reset();
});

//
//FASE 3.1: Evento do botão "Limpar Tudo" (Desafio 3)
//
const btnLimparTabela=document.getElementById("limpar-tabela");
btnLimparTabela.addEventListener("click",function(){
    //esvazia o array zerando seu comprimento
    listaDeProdutos.length=0;
    //re-renderiza a tabela (agora vazia) e atualiza o total
    renderizarTabela();
});

//FASE 4: Renderização da Interface DOM
//
//função responsável por desenhar na tela o estado
//atual do Array listaDeProdutos
function renderizarTabela(){
    //seleciona o corpo da tabela (tbody)
    const tabelaBody=document.querySelector("#tabela-produtos tbody");
    //limpa o conteúdo anterior da tabela
    tabelaBody.innerHTML="";
    //percorre o array de produtos usando forEach, recebendo também o índice
    listaDeProdutos.forEach((produto,index)=>{
        //criar uma linha tr dentro da tabela
        const linha=document.createElement("tr");
        //preenche o conteúdo da linha com os dados do objeto
        linha.innerHTML=`
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover" data-index="${index}">Remover</button>
            </td>
        `;
        //insere a linha criada dentro do tbody da tabela
        tabelaBody.appendChild(linha);
    });

    //FASE 4.1: liga o evento de clique em cada botão "Remover" recém-criado (Desafio 3)
    const botoesRemover=document.querySelectorAll(".btn-remover");
    botoesRemover.forEach((botao)=>{
        botao.addEventListener("click",function(){
            //recupera o índice guardado no atributo data-index e chama a remoção
            const index=parseInt(this.dataset.index);
            removerProduto(index);
        });
    });

    //FASE 5: sempre que a tabela for redesenhada, o total também precisa ser atualizado
    atualizarTotalEstoque();
}

//
//FASE 5: Indicadores Financeiros (Desafio 2)
//
//função responsável por somar os subtotais de todos os produtos
//e exibir o valor formatado em moeda brasileira
function atualizarTotalEstoque(){
    //.reduce() percorre o array acumulando um único valor (o total)
    //acc = acumulador (começa em 0), produto = item atual da iteração
    const total=listaDeProdutos.reduce((acc,produto)=>{
        return acc+produto.calcularSubtotal();
    },0);

    //formata o número no padrão de moeda brasileiro (R$ 1.234,56)
    const totalFormatado=total.toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

    //atualiza o texto do elemento h3 na tela
    const totalEstoqueEl=document.getElementById("total-estoque");
    totalEstoqueEl.textContent=`Total em Estoque: ${totalFormatado}`;
}

//
//FASE 6: Remoção Individual (Desafio 3)
//
//função que remove um produto específico do array, pela sua posição (index)
function removerProduto(index){
    //splice(index, 1) remove exatamente 1 item a partir da posição "index"
    listaDeProdutos.splice(index,1);
    //re-renderiza a tabela para refletir a remoção (e atualiza o total)
    renderizarTabela();
}