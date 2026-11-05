
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
    const logoutBtn = document.getElementById("logoutBtn");

    // Verifica a sessão do instrutor
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
            carregarRanking();
        } else {
            loginBox.style.display = "block";
            adminPanel.style.display = "none";
        }
    }

    // Login
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
            email: email,
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
        carregarRanking();
    });

    function mostrarPainel() {
        loginBox.style.display = "none";
        adminPanel.style.display = "block";
    }

    // Consulta o ranking no Supabase
    async function carregarRanking() {

        rankingArea.textContent = "Carregando ranking...";

        try {
            const { data, error } = await clienteSupabase
                .from("quiz_resultados")
                .select("nome, pontuacao, total_questoes, criado_em")
                .order("pontuacao", { ascending: false })
                .order("criado_em", { ascending: true });

            if (error) {
                console.error("Erro ao consultar ranking:", error);
                rankingArea.textContent =
                    "Não foi possível carregar o ranking. Verifique a conexão.";
                return;
            }

            if (!data || data.length === 0) {
                rankingArea.textContent =
                    "Ainda não existem participantes registrados.";
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

                linha.innerHTML = `
                    <td>${medalha}</td>
                    <td></td>
                    <td>${aluno.pontuacao} pontos</td>
                    <td>${aluno.total_questoes}</td>
                `;

                // Usa textContent para exibir o nome com segurança
                linha.children[1].textContent = aluno.nome;

                linha.style.borderBottom = "1px solid #444";
                linha.style.textAlign = "center";
                linha.style.padding = "10px";

                corpo.appendChild(linha);
            });

            tabela.appendChild(cabecalho);
            tabela.appendChild(corpo);

            rankingArea.replaceChildren(tabela);

        } catch (erro) {
            console.error("Falha ao carregar ranking:", erro);
            rankingArea.textContent =
                "Falha na comunicação com o banco de dados.";
        }
    }

    // Atualizar ranking
    if (refreshRankingBtn) {
        refreshRankingBtn.addEventListener("click", carregarRanking);
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
