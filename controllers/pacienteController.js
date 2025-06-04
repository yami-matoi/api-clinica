const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.registrar = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, sexo, senha } = req.body;

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserção nas tabelas PESSOA e PESSOAFIS via procedure
    const [result] = await pool.query(
      "CALL SP_INSERT_PESSOAFIS(?, ?, ?, ?)",
      [nome, cpf, dataNascimento, sexo]
    );

    const idPessoaFis = result[0][0].ID;

    // Inserção em PACIENTE
    await pool.query(
      "INSERT INTO PACIENTE(ID_PESSOAFIS, RGPACIENTE, ESTDORGPAC, STATUSPAC) VALUES (?, ?, ?, ?)",
      [idPessoaFis, 'RG123456', 'MT', true]
    );

    // Inserção na tabela USUARIO
    await pool.query(
      "INSERT INTO USUARIO(ID_PROFISSIO, LOGUSUARIO, SENHAUSUA) VALUES (?, ?, ?)",
      [null, cpf, senhaHash]
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
      `SELECT pf.IDPESSOAFIS, pf.NOMEPESSOA, pf.CPFPESSOA, pf.DATANASCPES, pf.SEXOPESSOA,
              pa.IDPACIENTE, pa.STATUSPAC
         FROM PESSOAFIS pf
         JOIN PACIENTE pa ON pa.ID_PESSOAFIS = pf.IDPESSOAFIS`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar pacientes.' });
  }
};
