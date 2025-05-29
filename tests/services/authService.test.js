const AuthService = require('../../src/services/authService');
const UserRepository = require('../../src/repositories/userRepository');
const bcrypt = require('bcrypt');
const firebase = require('firebase/app');

// Mock do Firebase
jest.mock('firebase/app', () => ({
  auth: jest.fn().mockReturnValue({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn()
  })
}));

// Mock do módulo firebase/auth
jest.mock('firebase/auth', () => {});

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  genSaltSync: jest.fn().mockReturnValue('salt'),
  hashSync: jest.fn().mockReturnValue('hashedPassword'),
  compareSync: jest.fn()
}));

// Mock do repositório de usuários
jest.mock('../../src/repositories/userRepository');

describe('AuthService - Cadastro de usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve cadastrar um usuário com dados válidos', async () => {
    const mockUser = {
      nome: 'Usuário Teste',
      email: 'teste@example.com',
      senha: 'senhaSegura123'
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(null);
    UserRepository.prototype.create.mockResolvedValue({
      ...mockUser,
      senha: 'hashedPassword',
      id: '123'
    });
    
    firebase.auth().createUserWithEmailAndPassword.mockResolvedValue({});
    
    const authService = new AuthService(new UserRepository());
    const result = await authService.register(mockUser);
    
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe(mockUser.nome);
    expect(result.email).toBe(mockUser.email);
    expect(UserRepository.prototype.create).toHaveBeenCalled();
    expect(firebase.auth().createUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.senha
    );
  });

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
    
    expect(UserRepository.prototype.create).not.toHaveBeenCalled();
    expect(firebase.auth().createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test('Deve validar campos obrigatórios no cadastro', async () => {
    const authService = new AuthService(new UserRepository());
    
    // Teste sem nome
    await expect(authService.register({
      email: 'teste@example.com',
      senha: 'senha123'
    })).rejects.toThrow('Todos os campos são obrigatórios');
    
    // Teste sem email
    await expect(authService.register({
      nome: 'Teste',
      senha: 'senha123'
    })).rejects.toThrow('Todos os campos são obrigatórios');
    
    // Teste sem senha
    await expect(authService.register({
      nome: 'Teste',
      email: 'teste@example.com'
    })).rejects.toThrow('Todos os campos são obrigatórios');
  });

  test('Deve validar formato de e-mail', async () => {
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.register({
      nome: 'Teste',
      email: 'emailinvalido',
      senha: 'senha123'
    })).rejects.toThrow('Formato de e-mail inválido');
  });

  test('Deve validar tamanho mínimo da senha', async () => {
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.register({
      nome: 'Teste',
      email: 'teste@example.com',
      senha: '12345'
    })).rejects.toThrow('A senha deve ter pelo menos 6 caracteres');
  });
});

describe('AuthService - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve permitir login com credenciais válidas', async () => {
    const mockUser = {
      id: '123',
      email: 'teste@example.com',
      senha: 'hashedPassword',
      nome: 'Usuário Teste'
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    bcrypt.compareSync.mockReturnValue(true);
    firebase.auth().signInWithEmailAndPassword.mockResolvedValue({});
    
    const authService = new AuthService(new UserRepository());
    const result = await authService.login('teste@example.com', 'senhaSegura123');
    
    expect(result).toEqual(mockUser);
    expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledWith(
      'teste@example.com',
      'senhaSegura123'
    );
  });

  test('Deve falhar com e-mail inválido', async () => {
    UserRepository.prototype.findByEmail.mockResolvedValue(null);
    firebase.auth().signInWithEmailAndPassword.mockRejectedValue(new Error('auth/user-not-found'));
    
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.login('invalido@example.com', 'senha123'))
      .rejects
      .toThrow('Credenciais inválidas');
  });

  test('Deve falhar com senha inválida', async () => {
    const mockUser = {
      email: 'teste@example.com',
      senha: 'hashedPassword'
    };
    
    UserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    bcrypt.compareSync.mockReturnValue(false);
    firebase.auth().signInWithEmailAndPassword.mockRejectedValue(new Error('auth/wrong-password'));
    
    const authService = new AuthService(new UserRepository());
    
    await expect(authService.login('teste@example.com', 'senhaErrada'))
      .rejects
      .toThrow('Credenciais inválidas');
  });

  test('Deve validar campos obrigatórios no login', async () => {
    const authService = new AuthService(new UserRepository());
    
    // Teste sem email
    await expect(authService.login('', 'senha123'))
      .rejects
      .toThrow('E-mail e senha são obrigatórios');
    
    // Teste sem senha
    await expect(authService.login('teste@example.com', ''))
      .rejects
      .toThrow('E-mail e senha são obrigatórios');
  });
});
