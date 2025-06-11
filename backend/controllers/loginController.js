const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    // Buscar paciente pelo CPF
    const [pacienteRows] = await pool.query(
      `SELECT id, nome, cpf, data_nascimento, email, senha FROM pacientes WHERE cpf = ?`,
      [cpf]
    );

    if (pacienteRows.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    const paciente = pacienteRows[0];

    // Validar senha
    const senhaCorreta = await bcrypt.compare(senha, paciente.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'CPF ou senha inválidos.' });
    }

    // Retornar dados do paciente (sem a senha)
    res.json({
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
        cpf: paciente.cpf,
        dataNascimento: paciente.data_nascimento,
        email: paciente.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no login.' });
  }
};
