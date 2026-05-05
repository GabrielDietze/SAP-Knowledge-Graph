# Preview — Novas Anotações Estruturadas

> Valide este arquivo antes de confirmar a inserção no banco.  
> Cada seção mostra: **onde vai** (pasta → área → nó) e **o conteúdo** que será salvo.  
> Nós marcados com `[NOVO]` serão criados. `[ATUALIZA]` preenchem um nó já existente (content estava vazio).

---

## CPI (Cloud Integration) — nós a inserir

### Área `[NOVA]` → Configuração Inicial

Pasta pai: **CPI (Cloud Integration)**

---

#### Nó `[NOVO]` — Setup do Ambiente Trial

**Descrição:** Passo a passo para criar e configurar o ambiente CPI no SAP BTP Trial

**Conteúdo:**

```
1. Criar conta trial em https://account.hanatrial.ondemand.com/

2. Ativar o Cloud Foundry:
   - Na subaccount trial, habilitar o ambiente Cloud Foundry
   - Definir a organização e o espaço (space)

3. Criar uma instância do Integration Suite:
   - Entrar em "Instances and Subscriptions"
   - Subscribir ao SAP Integration Suite

4. Adicionar permissões ao usuário:
   - Ir em Security > Users
   - Atribuir os roles necessários para acesso às funcionalidades do CPI
     (ex: IntegrationDeveloper, MonitoringAndOperationsUser)
```

---

#### Nó `[NOVO]` — Criando Client ID e Secret (OAuth2)

**Descrição:** Como gerar credenciais OAuth2 (Client ID + Secret) para consumo externo de iFlows

**Conteúdo:**

```
1. Entrar na Subaccount Trial
2. Ir em "Instances and Subscriptions" → aba "Instances" → clicar em "Create"

3. Na tela de criação:
   - Serviço: process integration runtime
   - Plan: integration-flow
   - Instance Name: escolher um nome

4. Clicar em "Next"
   - Role: verificar qual role está configurada no iFlow
     (Ir na linha que conecta o Sender e verificar em "Connection" → "User Role")
   - Grant Types: client credentials

5. Revisar o resumo e clicar em "Create"

6. Criar uma Service Key:
   - Clicar na instância criada → "Service Keys" → "Create"
   - Preencher: Nome, Key Type = "ClientID/Secret"
   - Opcional: certificado, validade, tamanho da key

7. Visualizar as credenciais: clicar nos 3 pontos → "View"

Como usar no Postman:
   - Em "Authorization", tipo: Basic Auth
   - Username: Client ID
   - Password: Client Secret
```

**Conceito relacionado:** OAuth2 Client Credentials Flow — usado quando um sistema (cliente) precisa se autenticar sem interação do usuário. O client ID identifica a aplicação e o client secret funciona como a senha da aplicação.

---

### Área existente → iFlows — nós a adicionar

Pasta pai: **CPI (Cloud Integration)** → **iFlows**

---

#### Nó `[NOVO]` — Versionamento e Gerenciamento de iFlows

**Descrição:** Como versionar, renomear iFlows e renomear pacotes

**Conteúdo:**

```
VERSIONAMENTO DE IFLOWS:
- Em "Integrations and APIs" → "Artifacts"
- Clicar em "Version" na linha do iFlow
- Será exibida a lista de todas as versões salvas
- É possível retornar a qualquer versão anterior clicando nela

RENOMEAR UM IFLOW:
- Em "Integrations and APIs" → "Artifacts"
- Clicar em "Actions" (ícone) na linha do iFlow
- Ir em "View Metadata"
- Nesta tela é possível editar: Nome, Descrição, Integration Flow, Sender e Receiver

RENOMEAR UM PACOTE:
- Clicar no pacote desejado
- Clicar em "Edit"
- Acessar a aba "Header"
- Editar: Nome, Descrição, Vendor, Version
```

---

#### Nó `[NOVO]` — Content Modifier

**Descrição:** Usar o Content Modifier para criar e manipular propriedades de mensagem, incluindo xPath e conversão de formatos

**Conteúdo:**

```
CRIANDO UMA PROPRIEDADE COM XPATH:
1. Adicionar um Content Modifier no iFlow
2. Ir na aba "Exchange Property" → clicar em "Add"
3. Preencher:
   - Name: _nomeDaPropriedade (convenção: começar com _)
   - Source Type: XPath
   - Source Value: caminho no XML, ex: /home/numero
   - Data Type: java.lang.String
   - Default Value: (opcional)

4. Para usar a propriedade em um Message Body:
   ${property._nomeDaPropriedade}

---

CONVERTER XML PARA JSON:
- Usar o step "Converter"
- Se o conteúdo de entrada for diferente do padrão, mudar o Source Value para:
  application/xml (ou o tipo correto de entrada)

---

CONVERTER CSV PARA XML:
1. Gerar um schema XSD a partir do XML esperado (via ferramentas online)
2. No Converter, fazer upload do arquivo XSD em "XML Schema"
3. Definir o "Path to Target Element in XSD":
   ex: /cliente/data/row
4. Manter um Content Modifier no final para ajuste do payload

---

CONVERTER XML PARA CSV:
- No Converter, informar o caminho de preenchimento no CSV

---

ENVIAR CSV PARA FTP:
1. Criar credencial no "Manage Security Material" com dados do servidor FTP
2. No iFlow:
   - Criar um Receiver
   - Criar um "External → Send" para enviar dados ao FTP
   - Tipo de adaptador: FTP
3. Configurações na aba "Target":
   - Address: endereço do servidor FTP
   - Credential Name: nome da credencial criada
   - Directory: caminho onde o arquivo será salvo
   - File Name: nome do arquivo de destino
```

---

#### Nó `[NOVO]` — Request Reply

**Descrição:** Padrão de integração Request Reply — conceito e uso no CPI

**Conteúdo:**

```
O QUE É REQUEST REPLY:
Request Reply é um padrão de integração (Enterprise Integration Pattern - EIP)
onde uma mensagem é enviada a um receptor e o remetente AGUARDA a resposta
antes de continuar o processamento.

É o padrão síncrono por excelência: diferente do Fire-and-Forget (assíncrono),
no Request Reply o iFlow para na etapa e só segue quando recebe o retorno.

QUANDO USAR:
- Consultas a APIs externas onde você precisa do resultado para continuar
- Chamadas OData (GET, POST, PUT, DELETE)
- Chamadas REST onde a resposta alimenta o próximo passo do fluxo

COMO CRIAR NO CPI:
1. No iFlow, adicionar o step "Request Reply" (em Call → External)
2. Conectar um Receiver ao Request Reply
3. Na linha de conexão, configurar o adaptador desejado:
   - OData V2 / V4
   - HTTP
   - SOAP
   etc.
4. O resultado da chamada volta como o body da mensagem

DIFERENÇA: External Call vs Request Reply:
- External Call: usado principalmente para envio sem retorno processado (ex: enviar email)
- Request Reply: usado quando o retorno da chamada alimenta o fluxo seguinte
```

---

### Área existente → Adapters & Channels — nós a atualizar

---

#### Nó `[ATUALIZA]` — Mail Adapter

**Conteúdo a adicionar:**

```
COMO ENVIAR UM EMAIL VIA IFLOW:

1. No iFlow, criar um step "External Call" (em Call → External)
2. Criar um Receiver (ex: Gmail)
3. Conectar o External Call ao Receiver — clicar na linha tracejada

4. Na aba "Connection":
   - Address: endereço do servidor SMTP (ex: smtp.gmail.com)
   - Proxy Type: Internet
   - Timeout: Default
   - Protection: SMTPS
   - Authentication: Encrypted User/Password
   - Credential Name: nome cadastrado no Security Material

5. Na aba "Processing":
   - From: remetente
   - To: destinatário(s)
   - Cc / Bcc: cópia
   - Subject: assunto
   - Body: corpo do email (pode usar expressões ${property._variavel})
   - Attachments: anexos se necessário

PRÉ-REQUISITO:
- Cadastrar as credenciais SMTP no "Security Material" antes de configurar o canal
- Para Gmail: habilitar acesso de apps menos seguros ou usar App Password
```

---

#### Nó `[ATUALIZA]` — OData & REST Adapter

**Conteúdo a adicionar:**

```
CONEXÃO ODATA NO CPI VIA REQUEST REPLY:

1. Criar um step "Request Reply" no iFlow
2. Criar um Receiver e conectar ao Request Reply
3. Tipo de adaptador na conexão: OData V2 ou OData V4

4. Configurações na aba "Connection":
   - Address: URL base da API OData
     ex: https://host.sap.com/sap/opu/odata/sap/API_SALES_ORDER

5. Configurações na aba "Processing":
   - Operation Details: selecionar o método HTTP (GET, POST, PUT, DELETE)
   - Resource Path: clicar em "Select" para abrir o "Model Operation"
     - Escolher o tipo de conexão para buscar o modelo:
       a) Arquivo EDMX (upload manual)
       b) URL da internet (puxa automaticamente o metadata)
   - Selecionar: Método, Entidade, Sub-nível (expand)
   - Filtros: Top N / Skip N / $filter / $orderby

ATENÇÃO — Content Type:
- Sempre passar o Content-Type como application/json
- Sem isso, campos podem retornar nulos ou a conversão falha

MAPEAMENTO DE CAMPOS (Message Mapping):
1. Antes do Request Reply, criar um "Message Mapping"
2. Clicar no ícone de criar dentro do Message Mapping
3. Em "Add Target Message": usar o XSD gerado pelo Request Reply
4. Fazer o mapeamento dos campos fonte → destino
5. O método (GET/POST/PUT) é definido no próprio Request Reply

USANDO COM POSTMAN:
- Alterar o método HTTP no Postman conforme o configurado no Request Reply
- Ajustar o caminho da URL conforme a configuração do iFlow
```

---

### Área `[NOVA]` → Segurança & Credenciais

Pasta pai: **CPI (Cloud Integration)**

---

#### Nó `[NOVO]` — Security Material

**Descrição:** Gerenciamento de credenciais e materiais de segurança no CPI

**Conteúdo:**

```
O Security Material é o cofre de credenciais do CPI.
É usado para armazenar de forma segura qualquer credencial que os iFlows precisam:
- Usuário e senha de email (SMTP)
- Credenciais de servidores FTP/SFTP
- Tokens de APIs externas
- Certificados digitais
- Qualquer par user/password de sistema externo

COMO ACESSAR:
Monitor → Integrations and APIs → Manage Security → Security Material

COMO CADASTRAR:
1. Clicar em "Add"
2. Escolher o tipo:
   - User Credentials: user + password
   - OAuth2 Client Credentials: client ID + secret
   - Secure Parameter: valor simples (token, key)
   - Certificate: certificado X.509
3. Dar um nome que será referenciado nos iFlows (Credential Name)
4. Preencher os dados e salvar

USO NOS IFLOWS:
- Nos adaptadores (Mail, FTP, HTTP, etc.), no campo "Credential Name"
  informar exatamente o nome cadastrado aqui no Security Material
```

---

#### Nó `[NOVO]` — Connectivity Tests

**Descrição:** Testar conectividade de adaptadores e gerar certificados no CPI

**Conteúdo:**

```
ONDE ACESSAR:
Monitor → Integrations and APIs → Manage Security → Connectivity Tests

PARA QUE SERVE:
- Testar a conectividade com servidores externos antes de configurar o iFlow
- Validar se credenciais e certificados estão corretos
- Gerar/obter certificados de sites e conexões para adicionar no Security Material

ADAPTADORES QUE PODEM SER TESTADOS:
- FTP / SFTP
- SMTP (email)
- HTTP / HTTPS
- IDoc
- RFC
- e outros

COMO USAR:
1. Selecionar o tipo de adaptador
2. Preencher os dados de conexão (host, porta, protocolo)
3. Clicar em "Send" ou "Test"
4. O resultado mostra se a conexão foi bem-sucedida ou o erro detalhado

GERANDO CERTIFICADOS:
- Em Connectivity Tests, para conexões HTTPS, é possível baixar o certificado
  do servidor e adicioná-lo diretamente no Security Material → Keystore
```

---

### Nó `[NOVO]` — SOAP UI (Ferramenta)

**Área sugerida:** Criar dentro de nova área "Ferramentas & Utilitários" sob CPI, ou dentro de "Monitoramento CPI"

**Conteúdo:**

```
SOAP UI é uma aplicação desktop usada para testar Web Services e APIs.

CASOS DE USO:
- Testar chamadas SOAP (Web Services)
- Simular requests para validar iFlows antes de integrá-los
  - Verificar o payload de request/response de serviços SOAP
  - Criar mock services para testes locais

  COMO USAR BASICAMENTO:
  1. Criar um novo projeto SOAP
2. Informar a URL do WSDL do serviço
3. O SOAP UI importa automaticamente as operações disponíveis
4. Montar o payload XML do request e executar
5. Visualizar o response e validar o resultado

DOWNLOAD: https://www.soapui.org/

ALTERNATIVAS:
- Postman: para REST/OData (mais usado atualmente)
- Bruno: alternativa open-source ao Postman
```

---

---

## CDS Views — nós a inserir

### Área existente → Estrutura de Código — nós a adicionar

---

#### Nó `[ATUALIZA]` — CASE / CAST / COALESCE

**Conteúdo a adicionar:**

```
CAST — Conversão de tipos no HANA/CDS:
- Converte um campo de um tipo de dado para outro
- Equivalente ao CAST do SQL padrão

Sintaxe:
  cast( Campo as tipo_destino ) as NomeCampo

Exemplos:
  cast( Quantidade as abap.dec(13,3) ) as Quantidade,
  cast( DataDoc    as abap.dats )       as DataDocumento

Uso prático:
- Quando um campo de tabela não tem o tipo exato esperado pela view consumidora
- Ao fazer comparações entre campos de tipos diferentes
- Para garantir precisão em cálculos numéricos

COALESCE — Valor padrão para nulos:
  coalesce( Campo, 'Valor_Default' ) as Campo
```

---

#### Nó `[NOVO]` — Code Pushdown

**Descrição:** Conceito de Code Pushdown no HANA — lógica no banco, não no servidor de aplicação

**Conteúdo:**

```
CODE PUSHDOWN é o princípio de mover o processamento de dados
do servidor de aplicação (ABAP) para o banco de dados (HANA).

NO CONTEXTO ECC (ABAP tradicional):
- Dados eram trazidos em massa para o servidor ABAP com SELECT
- Lógicas de filtro, agrupamento e cálculo eram feitas em código ABAP
- Resultado: alto consumo de memória e processamento no app server

NO CONTEXTO S/4HANA (Code Pushdown com CDS):
- As lógicas ficam dentro da CDS View (DDL)
- O HANA executa: joins, filtros, agregações, cálculos, CASE, CAST
- O ABAP recebe apenas o resultado final — muito menos dados trafegam

EXEMPLOS DE CODE PUSHDOWN NA CDS:
- Fazer JOIN de tabelas diretamente na CDS (ao invés de FOR ALL ENTRIES)
- Usar CASE para derivar campos (ao invés de IF/ENDIF no ABAP)
- Usar SUM/COUNT/AVG com GROUP BY (ao invés de loops ABAP)
- Usar CAST para conversão (ao invés de MOVE-CORRESPONDING)
- Usar UNION para combinar resultados (ao invés de APPEND em tabelas internas)

REGRA GERAL:
"Tudo que o banco sabe fazer, deixe o banco fazer."
```

---

#### Nó `[NOVO]` — UNION em CDS

**Descrição:** Como usar UNION para combinar dados de múltiplas CDS Views

**Conteúdo:**

```
UNION serve para combinar os resultados de duas ou mais SELECT/CDS Views
em um único resultado.

REGRAS:
- As queries unidas devem ter o mesmo número de campos
- Os tipos de dados dos campos correspondentes devem ser compatíveis
- UNION remove duplicatas por padrão; use UNION ALL para manter duplicatas

SINTAXE NA CDS:
  define view ZMinhaViewUnion as
    select from ZViewA {
      Campo1,
      Campo2
    }
    union all
    select from ZViewB {
      Campo1,
      Campo2
    }

CASO DE USO PRÁTICO:
- Consolidar dados de múltiplas tabelas/views com a mesma estrutura
  ex: pedidos de vendas + pedidos de transferência em uma única lista
- Criar uma view "multi-fonte" sem precisar de JOIN

DIFERENÇA UNION vs JOIN:
- JOIN: combina colunas de tabelas diferentes (horizontal)
- UNION: empilha linhas de queries diferentes (vertical)
```

---

### Área existente → Annotations — nós a adicionar

---

#### Nó `[NOVO]` — Virtual Elements

**Descrição:** Adicionar campos calculados por lógica ABAP dentro de uma CDS View via anotações

**Conteúdo:**

```
Virtual Elements permitem adicionar campos em uma CDS View que NÃO existem
nas tabelas do banco de dados — eles são calculados por uma classe ABAP
em tempo de execução.

ANOTAÇÕES NECESSÁRIAS:
  @ObjectModel.virtualElement: true
  @ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_MINHA_CLASSE'

COMO FUNCIONA:
1. Declarar o campo na CDS com as anotações acima e tipo correto
2. Criar a classe ABAP referenciada (ZCL_MINHA_CLASSE)
   - Deve implementar a interface IF_SADL_EXIT_CALC_ELEMENT_READ
   - Método GET_CALCULATION_INFO: informa quais campos base precisam ser lidos
   - Método CALCULATE: recebe os dados e preenche o campo virtual

EXEMPLO DE DECLARAÇÃO NA CDS:
  @ObjectModel.virtualElement: true
  @ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_CALC_STATUS'
  cast( ' ' as abap.char(20) ) as StatusCalculado

QUANDO USAR:
- Quando a lógica de derivação é complexa demais para CASE na CDS
- Quando precisa chamar Function Modules ou classes ABAP dentro da view
- Campos de status calculados por regras de negócio complexas

ATENÇÃO:
- Virtual Elements não são persistidos nem filtráveis diretamente via OData
- Performance: cada registro passa pelo ABAP — usar com moderação
```

---

#### Nó `[NOVO]` — Fiori Elements com Annotations

**Descrição:** Criar telas Fiori Elements em tempo de execução via anotações CDS

**Conteúdo:**

```
Com as anotações corretas na CDS View, o Fiori Elements gera a tela
automaticamente em tempo de execução — sem precisar escrever código UI5.

TIPOS DE TELA (Fiori Floorplans):
- List Report: listagem com filtros (@UI.lineItem + @UI.selectionField)
- Object Page: detalhe de um registro (@UI.fieldGroup + @UI.facet)
- Analytical List Page: listagem analítica com gráficos
- Overview Page: dashboard de múltiplos cards

ANOTAÇÕES PRINCIPAIS:
  @UI.lineItem:     [ { position: 10, label: 'Campo' } ]  → coluna na lista
  @UI.selectionField: [ { position: 10 } ]                → filtro na lista
  @UI.fieldGroup:   [ { qualifier: 'Geral', position: 10 } ]  → grupo na Object Page
  @UI.facet:        [ { type: #COLLECTION, label: 'Dados' } ] → seção na Object Page
  @UI.hidden:       true                                   → ocultar campo

SMART CONTROLS (melhor dos mundos):
- UI5 Smart Controls combinam Freestyle UI5 + Fiori Elements
- Você tem a flexibilidade do desenvolvimento Freestyle (estrutura HTML/JS customizada)
- Mas usa controles inteligentes que leem anotações CDS automaticamente:
  - SmartTable, SmartFilterBar, SmartForm, SmartField
- Ideal quando o Fiori Elements puro não atende, mas você quer aproveitar as anotações

FLUXO GERAL:
CDS View (com anotações @UI) → OData Service → Fiori Elements App ou Smart Controls
```

---

### Área existente → Associações & Joins — nó a atualizar

---

#### Nó `[ATUALIZA]` — Associations (TO ONE / TO MANY)

**Conteúdo a adicionar:**

```
CONCEITO DE LAZY LOADING (Carregamento por Demanda):
As Associations em CDS são carregadas POR DEMANDA (lazy loading).
Isso significa que os dados da entidade associada só são buscados
quando o consumidor da view solicita explicitamente aquela associação.

Exemplo prático:
- Uma view de Ordem de Venda tem uma Association para o cadastro do Material
- Ao listar as ordens, o cadastro do Material NÃO é carregado automaticamente
- Somente ao navegar para o material (via $expand no OData ou path no ABAP)
  é que o banco executa a query adicional

COMO NAVEGAR VIA PATH EXPRESSION:
  // Na CDS, expor a association:
  association [0..1] to I_Material as _Material on $projection.Material = _Material.Material

  // Para usar o campo da entidade associada:
  _Material.MaterialDescription as DescricaoMaterial

BENEFÍCIO:
- Evita joins desnecessários quando o dado relacionado não é consumido
- Melhora a performance de queries de listagem
- Permite ao consumidor decidir se quer ou não expandir a associação

NAVEGAÇÃO VIA ODATA ($expand):
  GET /SalesOrders?$expand=_Material
  → Retorna a ordem + os dados do material em um único request
```

---

### Área existente → VDM — nó a atualizar

---

#### Nó `[ATUALIZA]` — Extension Views (E_)

**Conteúdo a adicionar:**

```
EXTENSION VIEWS (E_) — Extensão de CDS Standard:

Permitem adicionar campos customizados em CDS Views SAP Standard
SEM modificar a view original (sem modification key, não perde no upgrade).

FORMAS DE EXTENSÃO:

1. VIA CUSTOM FIELDS AND LOGIC (Ferramenta Fiori):
   - Acessar app "Custom Fields and Logic" no Fiori Launchpad
   - Criar um campo custom (Custom Field)
   - O campo é automaticamente disponibilizado em CDS Views habilitadas
   - Não requer programação ABAP direta
   - Ideal para campos simples com lógica básica

2. VIA EXTEND VIEW (DDL):
   Sintaxe:
     extend view I_SalesOrder with ZE_SalesOrder {
       SalesOrder._Customer.City as CidadeCliente
     }
   - Cria uma Extension View que adiciona campos à view original
   - Os campos ficam visíveis para quem consume a view standard

DIFERENÇA ENTRE ABORDAGENS:
- Custom Fields and Logic: mais fácil, interface visual, sem código
- Extend View (DDL): mais poderoso, permite associações e lógica complexa

QUANDO USAR:
- Sempre que precisar enriquecer dados de processos standard (SD, MM, FI)
  sem tocar no código SAP — essencial em projetos S/4HANA Cloud
```

---

### Área `[NOVA]` → Referências & Links

Pasta pai: **CDS Views**

---

#### Nó `[NOVO]` — Links Úteis CDS

**Conteúdo:**

```
CDS VIEWS STANDARD (S/4HANA Cloud):
https://help.sap.com/docs/SAP_S4HANA_CLOUD/c0c54048d35849128be8e872df5bea6d/5418de55938d1d22e10000000a44147b.html

APIs STANDARD SAP (SAP API Business Hub):
https://api.sap.com/
- Documentação de todas as APIs OData disponíveis no S/4HANA
- É possível baixar o arquivo EDMX (metadata) para usar no CPI
- Permite testar as APIs diretamente no browser com sandbox

DICA:
- No API Hub, filtrar por "OData V2" ou "OData V4" para encontrar a API certa
- Baixar o EDMX clicando em "API Specification" → "EDMX"
  e usar esse arquivo no "Model Operation" do CPI
```

---

## Resumo — O que será criado/atualizado

### Novos nós CPI:
| Nó | Área | Status |
|---|---|---|
| Setup do Ambiente Trial | Configuração Inicial (nova) | NOVO |
| Criando Client ID e Secret | Configuração Inicial (nova) | NOVO |
| Versionamento e Gerenciamento de iFlows | iFlows | NOVO |
| Content Modifier | iFlows | NOVO |
| Request Reply | iFlows | NOVO |
| Security Material | Segurança & Credenciais (nova) | NOVO |
| Connectivity Tests | Segurança & Credenciais (nova) | NOVO |
| SOAP UI (Ferramenta) | Ferramentas & Utilitários (nova) | NOVO |
| Mail Adapter | Adapters & Channels | ATUALIZA |
| OData & REST Adapter | Adapters & Channels | ATUALIZA |

### Novos nós CDS Views:
| Nó | Área | Status |
|---|---|---|
| CAST (conteúdo) | Estrutura de Código → CASE/CAST/COALESCE | ATUALIZA |
| Code Pushdown | Estrutura de Código | NOVO |
| UNION em CDS | Estrutura de Código | NOVO |
| Virtual Elements | Annotations | NOVO |
| Fiori Elements com Annotations | Annotations | NOVO |
| Associations — Lazy Loading | Associações & Joins | ATUALIZA |
| Extension Views — Custom Fields | VDM → Extension Views | ATUALIZA |
| Links Úteis CDS | Referências & Links (nova) | NOVO |
