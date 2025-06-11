const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.registrar = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, email, senha } = req.body;

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserção direta na tabela pacientes
    await pool.query(
      `INSERT INTO pacientes (nome, cpf, data_nascimento, email, senha)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, cpf, dataNascimento, email, senhaHash]
    );

    res.status(201).json({ message: 'Paciente cadastrado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar paciente.' });
  }
};

exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome, cpf, data_nascimento, email, criado_em FROM pacientes`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar pacientes.' });
  }
};
