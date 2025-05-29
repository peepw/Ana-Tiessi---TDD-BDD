# Ana-Tiessi---TDD
# Pedro Wagner Rocha Silva 22.10091-0
# Felipe Ariel Chehaibar 22.00488-2
# Lucas Alves 24.00902-4
# Fabricio Aguiar 24.95005-0
# Projeto Integrador - Autenticação com TDD

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Jest-Testing-red)](https://jestjs.io/)

Implementação de um sistema de autenticação (login e cadastro) seguindo a metodologia TDD (Test-Driven Development).

## 📋 Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm (geralmente vem com o Node.js)
- MongoDB (opcional para ambiente de desenvolvimento)

## 🚀 Como executar o projeto

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/projeto-integrador.git
cd projeto-integrador
2. Instale as dependências:
npm install
Configuração
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/projeto-integrado
JWT_SECRET=seuSegredoSuperSecreto
Executando os testes
Para rodar a suíte de testes:
npm test
Para rodar os testes com cobertura:
bash
npm run test:coverage
