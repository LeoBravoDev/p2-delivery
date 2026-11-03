# Trabalho P2 — Delivery | Sabor da Casa

Painel de restaurante desenvolvido com React, TypeScript e Vite para o Trabalho P2 de Laboratório de Programação Front End (Engenharia de Software, 2026.2).

## Integrante

- **Nome completo:** PREENCHER COM SEU NOME COMPLETO

> O trabalho foi desenvolvido individualmente. A instrução original descreve uma entrega em dupla e solicita commits dos dois integrantes. Não invente um segundo integrante ou commits: confirme com a professora como registrar a entrega individual.

## Tecnologias

- React + TypeScript
- Vite
- CSS responsivo
- DummyJSON API
- Lucide React (ícones)

## Como executar

Requisitos: Node.js LTS e npm instalados.

1. Extraia o ZIP para uma pasta.
2. Abra a pasta `p2-delivery` no VS Code.
3. No terminal, instale as dependências:

   ```bash
   npm install
   ```

4. Confira o arquivo `.env` na raiz. Ele deve conter:

   ```env
   VITE_API_URL=https://dummyjson.com
   ```

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

6. Abra no navegador o endereço mostrado no terminal, normalmente `http://localhost:5173`.

Para verificar a compilação de produção:

```bash
npm run build
```

## Login de teste

- Usuário: `emilys`
- Senha: `emilyspass`

As credenciais ficam preenchidas na tela de entrada para facilitar a demonstração. O token é guardado em `sessionStorage` durante a sessão e enviado como `Authorization: Bearer <token>` às chamadas de cardápio.

## Funcionalidades

- Login pela rota `POST /auth/login`, com tratamento de erro.
- Cardápio protegido e botão para sair.
- Listagem com foto, nome, cozinha, tempo e preço calculado.
- Busca por nome usando `/recipes/search`.
- Cadastro, edição e exclusão com confirmação.
- Componentes reutilizáveis `RecipeCard`, `RecipeModal` e `EmptyState`, com props.
- Estados de carregamento, erro com status HTTP e lista vazia.
- Interface responsiva, incluindo telas estreitas de 375 px.
- Atualização do estado local após alterações, porque o DummyJSON apenas simula operações de escrita.

## Regra de preço

`Preço = R$ 15,00 + R$ 0,50 × (preparo em minutos + cozimento em minutos)`

## Observação sobre a API

O DummyJSON não persiste as alterações. Um prato criado recebe ID 51 e só existe na lista local até recarregar a aplicação. Para pratos que geram HTTP 404 ao editar/excluir, o painel apresenta um aviso e mantém a atualização local para que a demonstração continue funcionando.

## GitHub

**Link do repositório:** PREENCHER DEPOIS DE CRIAR O REPOSITÓRIO

Para publicar:
1. Crie um repositório vazio no GitHub.
2. Abra o terminal nesta pasta e execute:

   ```bash
   git init
   git add .
   git commit -m "Cria painel de delivery com React e TypeScript"
   git branch -M main
   git remote add origin URL_DO_SEU_REPOSITORIO
   git push -u origin main
   ```

3. Cole o link do repositório acima e salve o README.

## Checklist de entrega

- [ ] Preencher nome completo no README.
- [ ] Criar o repositório GitHub e colocar o link no README.
- [ ] Executar `npm install`.
- [ ] Executar `npm run dev` e testar login, busca, cadastro, edição e exclusão.
- [ ] Executar `npm run build`.
- [ ] Conferir em tela estreita, sem rolagem horizontal.
- [ ] Enviar o ZIP sem `node_modules` no AVA, conforme a orientação da professora.
