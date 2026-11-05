
const SUPABASE_URL = "https://xfwogqbcyixkjceupwql.supabase.co";
const SUPABASE_KEY = "sb_publishable_SeWJdCtOD1yQD5tETCjtDQ_onC9lDBB";

const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", () => {

    const loginBox = document.getElementById("loginBox");
    const adminPanel = document.getElementById("adminPanel");

    const adminEmail = document.getElementById("adminEmail");
    const adminPassword = document.getElementById("adminPassword");
    const loginBtn = document.getElementById("loginBtn");
    const loginMessage = document.getElementById("loginMessage");

    const rankingArea = document.getElementById("rankingArea");
    const refreshRankingBtn = document.getElementById("refreshRankingBtn");
    const resetRankingBtn = document.getElementById("resetRankingBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const prizeName = document.getElementById("prizeName");
    const savePrizeBtn = document.getElementById("savePrizeBtn");

    let rodadaAtual = 1;

    verificarSessao();

    async function verificarSessao() {
        const { data, error } = await clienteSupabase.auth.getSession();

        if (error) {
            console.error(error);
            loginMessage.textContent = "Erro ao verificar acesso.";
            return;
        }

        if (data.session) {
            mostrarPainel();
            await carregarConfiguracao();
            await carregarRanking();
        } else {
            loginBox.style.display = "block";
            adminPanel.style.display = "none";
        }
    }

    loginBtn.addEventListener("click", async () => {
        const email = adminEmail.value.trim();
        const senha = adminPassword.value;

        if (!email || !senha) {
            loginMessage.textContent = "Informe e-mail e senha.";
            return;
        }

        loginMessage.textContent = "Verificando acesso...";
        loginBtn.disabled = true;

        const { error } = await clienteSupabase.auth.signInWithPassword({
            email,
            password: senha
        });

        loginBtn.disabled = false;

        if (error) {
            loginMessage.textContent = "E-mail ou senha inválidos.";
            console.error(error);
            return;
        }

        loginMessage.textContent = "";
        mostrarPainel();

        await carregarConfiguracao();
        await carregarRanking();
    });

    function mostrarPainel() {
        loginBox.style.display = "none";
        adminPanel.style.display = "block";
    }

    async function carregarConfiguracao() {
        const { data, error } = await clienteSupabase
            .from("quiz_configuracao")
            .select("rodada, premio")
            .eq("id", true)
            .single();

        if (error) {
            console.error("Erro ao carregar configuração:", error);
            alert("Não foi possível carregar a configuração da rodada.");
            return false;
        }

        rodadaAtual = data.rodada;
        prizeName.value = data.premio || "";

        console.log("Rodada atual:", rodadaAtual);
        return true;
    }

    // Salvar prêmio
    if (savePrizeBtn) {
        savePrizeBtn.addEventListener("click", async () => {
            const premio = prizeName.value.trim();

            savePrizeBtn.disabled = true;

            const { error } = await clienteSupabase
                .from("quiz_configuracao")
                .update({ premio })
                .eq("id", true);

            savePrizeBtn.disabled = false;

            if (error) {
                console.error("Erro ao salvar prêmio:", error);
                alert("Não foi possível salvar o prêmio.");
                return;
            }

            alert("Prêmio salvo com sucesso!");
        });
    }

    // Carregar ranking somente da rodada atual
    async function carregarRanking() {
        rankingArea.textContent = "Carregando ranking...";

        const { data, error } = await clienteSupabase
            .from("quiz_resultados")
            .select("nome, pontuacao, total_questoes, criado_em")
            .eq("rodada", rodadaAtual)
            .order("pontuacao", { ascending: false })
            .order("criado_em", { ascending: true });

        if (error) {
            console.error("Erro ao consultar ranking:", error);
            rankingArea.textContent =
                "Não foi possível carregar o ranking.";
            return;
        }

        if (!data || data.length === 0) {
            rankingArea.textContent =
                "Ainda não existem participantes nesta rodada.";
            return;
        }

        const tabela = document.createElement("table");
        tabela.style.width = "100%";
        tabela.style.borderCollapse = "collapse";

        const cabecalho = document.createElement("thead");
        cabecalho.innerHTML = `
            <tr>
                <th>Posição</th>
                <th>Participante</th>
                <th>Pontuação</th>
                <th>Questões</th>
            </tr>
        `;

        const corpo = document.createElement("tbody");

        data.forEach((aluno, indice) => {
            const linha = document.createElement("tr");

            const posicao = indice + 1;
            const medalha = ["🥇", "🥈", "🥉"][indice] || posicao + "º";

            const celulaPosicao = document.createElement("td");
            celulaPosicao.textContent = medalha;

            const celulaNome = document.createElement("td");
            celulaNome.textContent = aluno.nome;

            const celulaPontos = document.createElement("td");
            celulaPontos.textContent = `${aluno.pontuacao} pontos`;

            const celulaQuestoes = document.createElement("td");
            celulaQuestoes.textContent = aluno.total_questoes;

            linha.append(
                celulaPosicao,
                celulaNome,
                celulaPontos,
                celulaQuestoes
            );

            linha.style.borderBottom = "1px solid #444";
            linha.style.textAlign = "center";

            corpo.appendChild(linha);
        });

        tabela.append(cabecalho, corpo);
        rankingArea.replaceChildren(tabela);
    }

    if (refreshRankingBtn) {
        refreshRankingBtn.addEventListener("click", async () => {
            await carregarConfiguracao();
            await carregarRanking();
        });
    }

    // Encerrar e iniciar nova rodada sem apagar o histórico
    if (resetRankingBtn) {
        resetRankingBtn.addEventListener("click", async () => {

            const confirmar = confirm(
                `Deseja encerrar a rodada ${rodadaAtual} e iniciar a rodada ${rodadaAtual + 1}?\n\n` +
                "Os resultados anteriores serão preservados no histórico."
            );

            if (!confirmar) return;

            resetRankingBtn.disabled = true;
            resetRankingBtn.textContent = "PROCESSANDO...";

            const novaRodada = rodadaAtual + 1;

            const { data, error } = await clienteSupabase
                .from("quiz_configuracao")
                .update({
                    rodada: novaRodada,
                    premio: null
                })
                .eq("id", true)
                .select("rodada")
                .single();

            resetRankingBtn.disabled = false;
            resetRankingBtn.textContent = "ENCERRAR E REINICIAR RODADA";

            if (error) {
                console.error("Erro ao reiniciar rodada:", error);
                alert(
                    "Não foi possível reiniciar a rodada. " +
                    "Verifique a conexão e as permissões do Supabase."
                );
                return;
            }

            rodadaAtual = data.rodada;
            prizeName.value = "";

            await carregarRanking();

            alert(
                `Rodada ${rodadaAtual - 1} encerrada!\n` +
                `Rodada ${rodadaAtual} iniciada com sucesso.`
            );
        });
    }

    // Sair do painel
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const { error } = await clienteSupabase.auth.signOut();

            if (error) {
                alert("Não foi possível sair do painel.");
                console.error(error);
                return;
            }

            adminPanel.style.display = "none";
            loginBox.style.display = "block";
            adminPassword.value = "";
            loginMessage.textContent = "Sessão encerrada.";
        });
    }
});
