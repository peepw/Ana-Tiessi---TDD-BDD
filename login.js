const AuthService = require('../../src/services/authService');
const UserRepository = require('../../src/repositories/userRepository');

jest.mock('../../src/repositories/userRepository');

describe('AuthService - Cadastro de usuário', () => {
  test('Deve cadastrar um usuário com dados válidos', async () => {
    const mockUser = {
      nome: 'Usuário Teste',
      email: 'teste@example.com',
      senha: 'senhaSegura123'
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(null);
    UserRepository.prototype.create.mockResolvedValue(mockUser);
    
    const authService = new AuthService(new UserRepository());
    const result = await authService.register(mockUser);
    
    expect(result).toEqual(mockUser);
    expect(UserRepository.prototype.create).toHaveBeenCalledWith(mockUser);
  });
});
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    return this.userRepository.create(userData);
  }
}

module.exports = AuthService;
test('Deve impedir cadastro com e-mail já existente', async () => {
  const existingUser = {
    nome: 'Usuário Existente',
    email: 'existente@example.com',
    senha: 'senha123'
  };
  
  UserRepository.prototype.findByEmail.mockResolvedValue(existingUser);
  
  const authService = new AuthService(new UserRepository());
  
  await expect(authService.register(existingUser))
    .rejects
    .toThrow('E-mail já cadastrado');
});
class AuthService {

  async register(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }
    
    return this.userRepository.create(userData);
  }
}
describe('AuthService - Login', () => {
  test('Deve permitir login com credenciais válidas', async () => {
    const mockUser = {
      email: 'teste@example.com',
      senha: '$2b$10$hashedpassword' 
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
    
    const authService = new AuthService(new UserRepository());
    const result = await authService.login('teste@example.com', 'senhaSegura123');
    
    expect(result).toEqual(mockUser);
  });

  test('Deve falhar com e-mail inválido', async () => {
    UserRepository.prototype.findByEmail.mockResolvedValue(null);
    
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.login('invalido@example.com', 'senha123'))
      .rejects
      .toThrow('Credenciais inválidas');
  });

  test('Deve falhar com senha inválida', async () => {
    const mockUser = {
      email: 'teste@example.com',
      senha: '$2b$10$hashedpassword'
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.login('teste@example.com', 'senhaErrada'))
      .rejects
      .toThrow('Credenciais inválidas');
  });
});
const bcrypt = require('bcrypt');

class AuthService {

  async login(email, senha) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user || !bcrypt.compareSync(senha, user.senha)) {
      throw new Error('Credenciais inválidas');
    }
    
    return user;
  }
}
