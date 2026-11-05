// ==========================================
// CONEXÃO COM SUPABASE
// ==========================================

const SUPABASE_URL = "https://xfwogqbcyixkjceupwql.supabase.co";
const SUPABASE_KEY = "sb_publishable_SeWJdCtOD1yQD5tETCjtDQ_onC9lDBB";

const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const bancoQuestoes = [
    {
        pergunta: "O que caracteriza a Manutenção 4.0?",
        opcoes: [
            "Uso de tecnologias digitais e dados para melhorar a manutenção",
            "Substituição de toda manutenção preventiva por corretiva",
            "Eliminação completa da participação humana nos processos",
            "Uso exclusivo de ferramentas mecânicas convencionais"
        ],
        correta: 0
    },
    {
        pergunta: "O que significa IoT?",
        opcoes: [
            "Integração de máquinas exclusivamente por cabos elétricos",
            "Internet das Coisas, conectando dispositivos para troca de dados",
            "Sistema de controle manual de equipamentos",
            "Tecnologia utilizada somente em computadores"
        ],
        correta: 1
    },
    {
        pergunta: "Qual é a principal função de um sensor de vibração em uma máquina?",
        opcoes: [
            "Medir a velocidade do operador",
            "Controlar a iluminação da oficina",
            "Identificar alterações no comportamento vibratório do equipamento",
            "Substituir os componentes mecânicos"
        ],
        correta: 2
    },
    {
        pergunta: "O que é manutenção preditiva?",
        opcoes: [
            "Realizar reparos somente após a quebra",
            "Trocar componentes em intervalos fixos, sem inspeção",
            "Executar manutenção apenas quando solicitado pelo operador",
            "Utilizar dados e condições do equipamento para prever falhas"
        ],
        correta: 3
    },
    {
        pergunta: "O que a Realidade Aumentada (RA) permite?",
        opcoes: [
            "Sobrepor informações digitais ao ambiente real",
            "Criar exclusivamente ambientes totalmente virtuais",
            "Eliminar a necessidade de sensores industriais",
            "Substituir todos os equipamentos físicos por simuladores"
        ],
        correta: 0
    },
    {
        pergunta: "Qual é uma característica da Realidade Virtual (RV)?",
        opcoes: [
            "Exibir somente gráficos em planilhas",
            "Proporcionar imersão em um ambiente virtual simulado",
            "Medir diretamente a temperatura de motores",
            "Realizar conexões elétricas automaticamente"
        ],
        correta: 1
    },
    {
        pergunta: "Como a RV pode contribuir para a capacitação profissional?",
        opcoes: [
            "Eliminando a necessidade de aprender procedimentos",
            "Impedindo a simulação de situações de risco",
            "Permitindo treinamento em cenários simulados e controlados",
            "Substituindo definitivamente toda atividade prática"
        ],
        correta: 2
    },
    {
        pergunta: "O que caracteriza o monitoramento conectado de máquinas?",
        opcoes: [
            "Registro exclusivo em formulários de papel",
            "Inspeção somente quando ocorre uma parada",
            "Desligamento dos sensores durante a operação",
            "Coleta e transmissão de dados sobre as condições do equipamento"
        ],
        correta: 3
    },
    {
        pergunta: "Durante uma intervenção, como a RA pode auxiliar o técnico?",
        opcoes: [
            "Apresentando instruções e informações sobre componentes no campo de visão",
            "Desativando automaticamente os dispositivos de segurança",
            "Substituindo a análise técnica do profissional",
            "Impedindo o acesso aos procedimentos de manutenção"
        ],
        correta: 0
    },
    {
        pergunta: "Por que os dados de manutenção são importantes?",
        opcoes: [
            "Porque eliminam a necessidade de planejamento",
            "Porque auxiliam na análise de falhas e na tomada de decisões",
            "Porque servem apenas para registrar a presença dos funcionários",
            "Porque impedem qualquer falha futura"
        ],
        correta: 1
    },
    {
        pergunta: "O que significa interoperabilidade na Indústria 4.0?",
        opcoes: [
            "Impedir a comunicação entre equipamentos",
            "Utilizar apenas máquinas de um mesmo fabricante",
            "Permitir que sistemas e dispositivos diferentes troquem informações",
            "Substituir redes industriais por controles manuais"
        ],
        correta: 2
    },
    {
        pergunta: "Antes de realizar uma manutenção em uma máquina, qual atitude é essencial?",
        opcoes: [
            "Aumentar a velocidade de operação",
            "Retirar as proteções para facilitar o acesso",
            "Iniciar o serviço sem avaliar os riscos",
            "Identificar os riscos e aplicar os procedimentos de bloqueio e segurança"
        ],
        correta: 3
    },
    {
        pergunta: "Qual é a contribuição da análise de dados associada à IoT?",
        opcoes: [
            "Transformar dados coletados em informações úteis para decisões",
            "Eliminar a necessidade de acompanhamento dos equipamentos",
            "Impedir a comunicação entre sensores",
            "Substituir todos os procedimentos de segurança"
        ],
        correta: 0
    },
    {
        pergunta: "O que é um gêmeo digital (Digital Twin)?",
        opcoes: [
            "Uma cópia física reserva de uma máquina",
            "Uma representação digital de um ativo ou processo físico",
            "Um equipamento utilizado exclusivamente para soldagem",
            "Um sistema sem conexão com dados reais"
        ],
        correta: 1
    }
];

let perguntasSelecionadas = [];
let respostasAluno = [];
let indiceAtual = 0;
let nomeAluno = "";
let rodadaQuiz = 1;
let premioQuiz = null;

function embaralhar(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

async function iniciarQuiz() {
    const campoNome = document.getElementById("participantName");

    nomeAluno = campoNome.value.trim();

    if (!nomeAluno) {
        alert("Digite seu nome para iniciar.");
        return;
    }

    // Consulta qual rodada está ativa
    const { data, error } = await clienteSupabase
        .from("quiz_configuracao")
        .select("rodada, premio")
        .eq("id", true)
        .single();

    if (error) {
        console.error("Erro ao consultar rodada:", error);
        alert("Não foi possível iniciar o quiz. Avise o instrutor.");
        return;
    }

    // Guarda a rodada no momento em que o aluno inicia
    rodadaQuiz = data.rodada;
    premioQuiz = data.premio;

    // Seleciona e embaralha as perguntas
    perguntasSelecionadas = embaralhar(bancoQuestoes)
        .slice(0, 10)
        .map(pergunta => {
            const opcoesEmbaralhadas = embaralhar(
                pergunta.opcoes.map((texto, indice) => ({
                    texto,
                    correta: indice === pergunta.correta
                }))
            );

            return {
                pergunta: pergunta.pergunta,
                opcoes: opcoesEmbaralhadas
            };
        });

    respostasAluno = [];
    indiceAtual = 0;

    document.getElementById("welcome").style.display = "none";
    document.getElementById("quizBox").style.display = "block";

    mostrarPergunta();
}

function mostrarPergunta() {
    const pergunta = perguntasSelecionadas[indiceAtual];

    document.getElementById("questionCounter").textContent =
        `Pergunta ${indiceAtual + 1} de ${perguntasSelecionadas.length}`;

    document.getElementById("questionText").textContent =
        pergunta.pergunta;

    const areaOpcoes = document.getElementById("alternatives");
    areaOpcoes.innerHTML = "";

    pergunta.opcoes.forEach((opcao, indice) => {
        const label = document.createElement("label");
        label.className = "alternativa";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "resposta";
        radio.value = indice;

        label.appendChild(radio);
        label.appendChild(
            document.createTextNode(" " + opcao.texto)
        );

        areaOpcoes.appendChild(label);
    });

    document.getElementById("nextBtn").style.display =
        indiceAtual < perguntasSelecionadas.length - 1
            ? "inline-block"
            : "none";

    document.getElementById("finishBtn").style.display =
        indiceAtual === perguntasSelecionadas.length - 1
            ? "inline-block"
            : "none";
}

function registrarResposta() {
    const selecionada = document.querySelector(
        'input[name="resposta"]:checked'
    );

    if (!selecionada) {
        alert("Selecione uma alternativa para continuar.");
        return false;
    }

    const indiceOpcao = Number(selecionada.value);

    respostasAluno[indiceAtual] =
        perguntasSelecionadas[indiceAtual].opcoes[indiceOpcao].correta;

    return true;
}

function proximaPergunta() {
    if (!registrarResposta()) return;

    indiceAtual++;
    mostrarPergunta();
}


async function finalizarQuiz() {
    if (!registrarResposta()) return;

    const acertos = respostasAluno.filter(Boolean).length;
    const pontuacao = acertos * 10;

   const resultado = {
    nome: nomeAluno,
    pontuacao: pontuacao,
    total_questoes: 10,
    rodada: rodadaQuiz,
    premio: premioQuiz
};

    const textoResultado = document.getElementById("resultText");

    document.getElementById("quizBox").style.display = "none";
    document.getElementById("resultBox").style.display = "block";

    textoResultado.textContent =
        `${nomeAluno}, você acertou ${acertos} de 10 questões e fez ${pontuacao} pontos!`;

    try {
        textoResultado.textContent += " Salvando seu resultado...";

        const { data, error } = await clienteSupabase
            .from("quiz_resultados")
            .insert([resultado])
            .select();

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            textoResultado.textContent +=
                " Não foi possível registrar sua pontuação. Avise o instrutor.";
            return;
        }

        console.log("Resultado salvo com sucesso:", data);

        textoResultado.textContent =
            `${nomeAluno}, você acertou ${acertos} de 10 questões e fez ${pontuacao} pontos! Resultado registrado com sucesso.`;

    } catch (erro) {
        console.error("Falha na comunicação com Supabase:", erro);

        textoResultado.textContent +=
            " Falha na comunicação com o sistema. Avise o instrutor.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const iniciar = document.getElementById("startQuizBtn");
    const avancar = document.getElementById("nextBtn");
    const finalizar = document.getElementById("finishBtn");

    if (iniciar) iniciar.addEventListener("click", iniciarQuiz);
    if (avancar) avancar.addEventListener("click", proximaPergunta);
    if (finalizar) finalizar.addEventListener("click", finalizarQuiz);
});
