
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

    // Verifica se já existe uma sessão ativa
    verificarSessao();

    async function verificarSessao() {

        const { data } = await clienteSupabase.auth.getSession();

        if (data.session) {
            mostrarPainel();
        } else {
            loginBox.style.display = "block";
            adminPanel.style.display = "none";
        }
    }

    // Login do instrutor
    loginBtn.addEventListener("click", async () => {

        const email = adminEmail.value.trim();
        const senha = adminPassword.value;

        if (!email || !senha) {
            loginMessage.textContent =
                "Informe o e-mail e a senha.";
            return;
        }

        loginMessage.textContent = "Verificando acesso...";

        const { data, error } =
            await clienteSupabase.auth.signInWithPassword({
                email: email,
                password: senha
            });

        if (error) {
            loginMessage.textContent =
                "E-mail ou senha inválidos.";
            console.error(error);
            return;
        }

        mostrarPainel();
    });

    // Exibe o painel administrativo
    function mostrarPainel() {
        loginBox.style.display = "none";
        adminPanel.style.display = "block";
    }

    // Logout do instrutor
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {

            await clienteSupabase.auth.signOut();

            adminPanel.style.display = "none";
            loginBox.style.display = "block";

            loginMessage.textContent =
                "Você saiu do painel administrativo.";
        });
    }

});
