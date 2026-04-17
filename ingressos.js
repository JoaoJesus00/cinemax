// valor fixo de cada ingresso
const PRECO_INGRESSO = 20;

// formata numero para moeda no padrao br (ex: 20,00)
function formatarValor(valor) {
  return valor.toFixed(2).replace('.', ',');
}

// fluxo simples de compra ao clicar no botao
function comprarIngresso() {
  // pega o nome do filme no subtitulo da pagina
  const filme = document.querySelector('.subtitulo')?.textContent?.trim() || 'Filme';

  // pergunta quantos ingressos o usuario quer
  const quantidadeTexto = window.prompt(
    `Quantos ingressos você quer para "${filme}"?\nValor por ingresso: R$ ${formatarValor(PRECO_INGRESSO)}`
  );

  // se cancelar o prompt, nao faz nada
  if (quantidadeTexto === null) return;

  // converte e valida a quantidade digitada
  const quantidade = Number(quantidadeTexto);
  const quantidadeValida = Number.isInteger(quantidade) && quantidade > 0;

  if (!quantidadeValida) {
    // mostra aviso quando valor nao for inteiro maior que zero
    window.alert('Digite um número inteiro maior que 0.');
    return;
  }

  // calcula total e confirma a compra na tela
  const total = quantidade * PRECO_INGRESSO;
  window.alert(
    `Compra realizada!\nFilme: ${filme}\nQuantidade: ${quantidade}\nTotal: R$ ${formatarValor(total)}`
  );
}

// liga o clique de todos os botoes da pagina na funcao de compra
document.querySelectorAll('button').forEach((botao) => {
  botao.addEventListener('click', comprarIngresso);
});
