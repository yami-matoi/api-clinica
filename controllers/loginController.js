const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    // Buscar usuário pelo CPF
    const [usuarioRows] = await pool.query(
      `SELECT IDUSUARIO, LOGUSUARIO, SENHAUSUA FROM USUARIO WHERE LOGUSUARIO = ?`,
      [cpf]
    );

    if (usuarioRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const usuario = usuarioRows[0];

    // Validar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.SENHAUSUA);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'CPF ou senha inválidos.' });
    }

    // Buscar dados do paciente pelo CPF
    const [pacienteRows] = await pool.query(
      `SELECT pf.IDPESSOAFIS, pf.CPFPESSOA, pf.NOMEPESSOA, pf.DATANASCPES, 
              p.IDPESSOA, pa.IDPACIENTE, pa.STATUSPAC
         FROM PESSOAFIS pf
         JOIN PESSOA p ON pf.ID_PESSOA = p.IDPESSOA
         JOIN PACIENTE pa ON pa.ID_PESSOAFIS = pf.IDPESSOAFIS
        WHERE pf.CPFPESSOA = ?`,
      [cpf]
    );

    if (pacienteRows.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    const paciente = pacienteRows[0];

    // Retornar dados do paciente
    res.json({
      paciente: {
        idPaciente: paciente.IDPACIENTE,
        idPessoaFis: paciente.IDPESSOAFIS,
        nome: paciente.NOMEPESSOA,
        cpf: paciente.CPFPESSOA,
        dataNascimento: paciente.DATANASCPES,
        status: paciente.STATUSPAC
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no login.' });
  }
};
