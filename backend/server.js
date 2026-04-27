const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Rota para buscar os livros
app.get('/livros', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM livros');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para cadastrar um novo livro
app.post('/livros', async (req, res) => {
  const { titulo, autor, categoria } = req.body; // Adicionado categoria
  try {
    const novoLivro = await pool.query(
      'INSERT INTO livros (titulo, autor, categoria) VALUES ($1, $2, $3) RETURNING *',
      [titulo, autor, categoria]
    );
    res.json(novoLivro.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao cadastrar livro');
  }
});

// Rota para registrar o empréstimo de um livro
app.put('/livros/emprestar/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_nome, serie, data_emprestimo, data_devolucao } = req.body;
  try {
    const emprestimo = await pool.query(
      'UPDATE livros SET usuario_nome = $1, serie = $2, data_emprestimo = $3, data_devolucao = $4 WHERE id = $5 RETURNING *',
      [usuario_nome, serie, data_emprestimo, data_devolucao, id]
    );
    res.json(emprestimo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao registrar empréstimo');
  }
});

// Rota para registrar a devolução do livro (limpa os dados de empréstimo)
app.put('/livros/devolver/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const devolucao = await pool.query(
      'UPDATE livros SET usuario_nome = NULL, serie = NULL, data_emprestimo = NULL, data_devolucao = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(devolucao.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao registrar devolução');
  }
});


// Rota para deletar um livro permanentemente
app.delete('/livros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM livros WHERE id = $1', [id]);
    
    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Livro não encontrado" });
    }

    res.json({ mensagem: "Livro removido com sucesso!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao deletar livro');
  }
});


app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});