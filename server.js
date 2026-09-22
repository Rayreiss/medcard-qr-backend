// ============================================================================
// ARQUIVO: server.js
// OBJETIVO: Backend API RESTful em Node.js com Express e PostgreSQL
// ============================================================================

const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração fictícia do Banco de Dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/medcard_db'
});

// Regex para validação de senha (Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 símbolo)
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ==========================================
// ROTA 1: CADASTRO DE USUÁRIO (US01)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { email, senha } = req.body;

  if (!passwordRegex.test(senha)) {
    return res.status(400).json({ error: 'Senha não atende aos requisitos de segurança.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Inserção no banco (simulada)
    // await pool.query('INSERT INTO tb_usuarios (email, senha_hash) VALUES ($1, $2)', [email, senhaHash]);
    
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ==========================================
// ROTA 2: LOGIN DE USUÁRIO
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  // Simulação de busca e validação (Bcrypt)
  res.status(200).json({ message: 'Login realizado', token: 'jwt_token_simulado' });
});

// ==========================================
// ROTA 3: SALVAR FICHA MÉDICA E SENHA PÚBLICA (US03)
// ==========================================
app.post('/api/fichas', async (req, res) => {
  const { id_usuario, nome, alergias, senha_publica } = req.body;

  if (!passwordRegex.test(senha_publica)) {
    return res.status(400).json({ error: 'A senha pública deve ser complexa e segura.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaPublicaHash = await bcrypt.hash(senha_publica, salt);
    // Salvar no BD...
    res.status(200).json({ message: 'Ficha médica e crachá atualizados!', qr_code_url: `https://medcardqr.com/emergencia/${id_usuario}` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar ficha.' });
  }
});

// ==========================================
// ROTA 4: ACESSO DE EMERGÊNCIA (SOCORRISTA) - TELA DE INTERCEPTAÇÃO (US06)
// ==========================================
app.post('/api/emergencia/:id_usuario', async (req, res) => {
  const { senha_publica_digitada } = req.body;
  
  // Simulação: O banco buscaria o hash da senha pública do usuário.
  // const user = await pool.query('SELECT senha_publica_hash FROM tb_acesso_qr WHERE id_usuario = $1', [req.params.id_usuario]);
  // const valid = await bcrypt.compare(senha_publica_digitada, user.rows[0].senha_publica_hash);

  const isValid = true; // Simulado para o MVP

  if (!isValid) {
    return res.status(401).json({ error: 'Acesso Negado: Senha Pública Incorreta.' });
  }

  // Retorna os dados APENAS se a senha bater
  res.status(200).json({
    nome: "João Carlos Silva",
    tipo_sanguineo: "O+",
    alergias: "Penicilina, Dipirona",
    medicamentos: "Enalapril 10mg",
    contato_emergencia: "Maria Silva (11) 99887-6655"
  });
});

// ==========================================
// ROTA 5: EXCLUSÃO DE CONTA (US05)
// ==========================================
app.delete('/api/usuarios/:id', async (req, res) => {
  // Exclusão em cascata no banco PostgreSQL
  // await pool.query('DELETE FROM tb_usuarios WHERE id = $1', [req.params.id]);
  res.status(200).json({ message: 'Conta e dados médicos excluídos definitivamente.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend MedCard QR rodando na porta ${PORT}`);
});
