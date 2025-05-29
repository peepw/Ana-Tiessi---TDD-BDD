const UserRepository = require('../../src/repositories/userRepository');

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  test('Deve criar um novo usuário', async () => {
    const userData = {
      nome: 'Usuário Teste',
      email: 'teste@example.com',
      senha: 'senha123'
    };

    const result = await userRepository.create(userData);

    expect(result).toHaveProperty('id');
    expect(result.nome).toBe(userData.nome);
    expect(result.email).toBe(userData.email);
    expect(result.senha).toBe(userData.senha);
  });

  test('Deve encontrar um usuário pelo e-mail', async () => {
    const userData = {
      nome: 'Usuário Teste',
      email: 'teste@example.com',
      senha: 'senha123'
    };

    await userRepository.create(userData);
    const foundUser = await userRepository.findByEmail('teste@example.com');

    expect(foundUser).toBeTruthy();
    expect(foundUser.email).toBe('teste@example.com');
  });

  test('Deve retornar null quando não encontrar um usuário pelo e-mail', async () => {
    const foundUser = await userRepository.findByEmail('naoexiste@example.com');
    expect(foundUser).toBeNull();
  });
});
