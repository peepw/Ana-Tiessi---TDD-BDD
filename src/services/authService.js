const bcrypt = require('bcrypt');
const firebase = require('firebase/app');
require('firebase/auth');

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    // Validação de campos obrigatórios
    if (!userData.nome || !userData.email || !userData.senha) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Validação de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Formato de e-mail inválido');
    }

    // Validação de senha (mínimo 6 caracteres)
    if (userData.senha.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    // Verificar se o e-mail já existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }
    
    // Criptografar a senha
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.senha, salt);
    
    // Criar usuário no Firebase
    try {
      await firebase.auth().createUserWithEmailAndPassword(userData.email, userData.senha);
    } catch (error) {
      throw new Error(`Erro ao registrar no Firebase: ${error.message}`);
    }
    
    // Salvar no repositório local
    return this.userRepository.create({
      ...userData,
      senha: hashedPassword
    });
  }

  async login(email, senha) {
    // Validação de campos obrigatórios
    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios');
    }

    try {
      // Verificar credenciais no Firebase
      await firebase.auth().signInWithEmailAndPassword(email, senha);
      
      // Buscar usuário no repositório local
      const user = await this.userRepository.findByEmail(email);
      
      if (!user || !bcrypt.compareSync(senha, user.senha)) {
        throw new Error('Credenciais inválidas');
      }
      
      return user;
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  }
}

module.exports = AuthService;
