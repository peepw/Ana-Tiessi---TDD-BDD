class UserRepository {
  constructor() {
    this.users = [];
  }

  async findByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData) {
    const newUser = { ...userData, id: Date.now().toString() };
    this.users.push(newUser);
    return newUser;
  }
}

module.exports = UserRepository;
