# Trabalho P2 — Delivery | Sabor da Casa

Painel do restaurante parceiro de um app de delivery, desenvolvido com React, TypeScript e Vite para o Trabalho P2 de Laboratório de Programação Front End (Engenharia de Software, 2026.2 — Universidade de Vassouras).

O dono do restaurante entra com login, vê os pratos do cardápio, cadastra pratos novos, edita e exclui. A interface foi pensada para uso no celular.

## Integrante

- Leandro de Oliveira Bravo Monteiro

## Repositório

https://github.com/LeoBravoDev/p2-delivery

## Tecnologias

- React + TypeScript
- Vite
- React Router
- Context API (autenticação)
- DummyJSON API (`fetch`)
- Lucide React (ícones)
- CSS responsivo

## Como executar

Requisitos: Node.js LTS e npm.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

O arquivo `.env` na raiz do projeto deve conter:

```env
VITE_API_URL=https://dummyjson.com
```

Depois de criar ou editar o `.env`, reinicie o `npm run dev`.

Para gerar a versão de produção:

```bash
npm run build
```

## Login de teste

- Usuário: `emilys`
- Senha: `emilyspass`

As credenciais já vêm preenchidas na tela de entrada. O token (`accessToken`) é guardado em `sessionStorage` e enviado como `Authorization: Bearer <token>`.

## Funcionalidades

- Login com `POST /auth/login`, token guardado no `AuthContext` e tratamento de erro.
- Cardápio em rota protegida (React Router) e botão **Sair**.
- Conferência do usuário logado com `GET /auth/me`.
- Lista de pratos com foto, nome, cozinha e preço.
- Busca por nome.
- Cadastro, edição e exclusão (com confirmação) de pratos.
- Estados de carregando, erro (com status HTTP e mensagem na tela) e lista vazia.
- Layout responsivo, utilizável em 375 px sem rolagem lateral.

## Estrutura

```
src/
  services/api.ts          chamadas à API com fetch, usando VITE_API_URL
  context/AuthContext.tsx  token e usuário logado
  components/              RecipeCard, RecipeModal, EmptyState, ProtectedRoute
  pages/                   LoginPage, MenuPage
  utils/errors.ts          mensagens de erro amigáveis
```

## Regra de preço

A API não tem preço, então ele é calculado no front:

`preço = R$ 15,00 + R$ 0,50 × (preparo + cozimento, em minutos)`

## Observações sobre a API

O DummyJSON apenas simula criar, editar e excluir: nada é gravado no servidor. Por isso o app atualiza o estado local depois de salvar, e ao recarregar a página a lista volta ao que a API tem.

Todo prato criado recebe `id` 51 e não existe de verdade no servidor. Ao editar ou excluir esse prato, a API responde **404**; o app mostra uma mensagem de erro clara na tela e aplica a mudança apenas na lista local.
